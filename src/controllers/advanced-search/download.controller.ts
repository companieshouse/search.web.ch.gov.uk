import { Request, Response } from "express";
import { getDatesFromParams, mapAdvancedSearchParams, mapCompanyResource } from "../utils/utils";
import { getAdvancedCompanies } from "../../client/apiclient";
import { ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD, API_KEY, SEARCH_WEB_COOKIE_NAME } from "../../config/config";
import { AdvancedSearchParams } from "../../model/advanced.search.params";
import Papa from "papaparse";
import Cookies = require("cookies");
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../../config/config";

const logger = createLogger(APPLICATION_NAME);

const route = async (req: Request, res: Response) => {
    logger.info("[1] starting to parse excel")
    const cookies = new Cookies(req, res);
    const page = 1;
    const { fullDissolvedDates, fullIncorporationDates } = getDatesFromParams(req);

    const advancedSearchParams: AdvancedSearchParams = mapAdvancedSearchParams(page, req.query.companyNameIncludes as string || null, req.query.companyNameExcludes as string || null, req.query.registeredOfficeAddress as string || null,
        fullIncorporationDates.incorporationFromDate || null, fullIncorporationDates.incorporationToDate || null, req.query.sicCodes as string || null, req.query.status as string || null, req.query.type as string || null,
        req.query.subtype as string || null, fullDissolvedDates.dissolvedFromDate || null, fullDissolvedDates.dissolvedToDate || null, ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD);

    logger.info("[2] getting company resource")
    const companyResource = await getAdvancedCompanies(API_KEY, advancedSearchParams, (cookies.get(SEARCH_WEB_COOKIE_NAME) as string));
    logger.info("[3] mapping resources to json")
    const companyJson = mapCompanyResource(companyResource);
    logger.info("[4] parsing json to excel")
    const parsedData = Papa.unparse(companyJson);
    logger.info("[5] done")

    res.header("Content-Type", "text/csv");
    res.attachment("Companies-House-search-results.csv");
    return res.send(parsedData);
};

export default [route];

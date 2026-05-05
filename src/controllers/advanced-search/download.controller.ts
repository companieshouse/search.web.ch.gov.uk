import { Request, Response } from "express";
import { getDatesFromParams, mapAdvancedSearchParams } from "../utils/utils";
import { getAdvancedCompaniesAsCsv } from "../../client/apiclient";
import { ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD, API_KEY, SEARCH_WEB_COOKIE_NAME } from "../../config/config";
import { AdvancedSearchParams } from "../../model/advanced.search.params";
import Papa from "papaparse";
import Cookies = require("cookies");
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../../config/config";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/advanced-search/types";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import AdvancedSearchService from "@companieshouse/api-sdk-node/dist/services/search/advanced-search/service";
import { IHttpClient } from "@companieshouse/api-sdk-node";

const logger = createLogger(APPLICATION_NAME);

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const page = 1;
    const { fullDissolvedDates, fullIncorporationDates } = getDatesFromParams(req);
    const searchParams: AdvancedSearchParams = mapAdvancedSearchParams(page, req.query.companyNameIncludes as string || null, req.query.companyNameExcludes as string || null, req.query.registeredOfficeAddress as string || null,
        fullIncorporationDates.incorporationFromDate || null, fullIncorporationDates.incorporationToDate || null, req.query.sicCodes as string || null, req.query.status as string || null, req.query.type as string || null,
        req.query.subtype as string || null, fullDissolvedDates.dissolvedFromDate || null, fullDissolvedDates.dissolvedToDate || null, ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD)
    const csvData = await getAdvancedCompaniesAsCsv(API_KEY, searchParams, (cookies.get(SEARCH_WEB_COOKIE_NAME) as string))

    res.header("Content-Type", "text/csv");
    res.attachment("Companies-House-search-results.csv");
    return res.send(csvData);
};

export default [route];

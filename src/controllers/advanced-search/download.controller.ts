import { Request, Response } from "express";
import { getDatesFromParams, mapAdvancedSearchParams, mapCompanyResource } from "../utils/utils";
import { getAdvancedCompanies } from "../../client/apiclient";
import { ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD, API_KEY, SEARCH_WEB_COOKIE_NAME } from "../../config/config";
import { AdvancedSearchParams } from "../../model/advanced.search.params";
import Papa from "papaparse";
import Cookies = require("cookies");

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const page = 1;
    const { fullDissolvedDates, fullIncorporationDates } = getDatesFromParams(req);

    const advancedSearchParams: AdvancedSearchParams = mapAdvancedSearchParams(page, req.query.companyNameIncludes as string || null, req.query.companyNameExcludes as string || null, req.query.registeredOfficeAddress as string || null,
        fullIncorporationDates.incorporationFromDate || null, fullIncorporationDates.incorporationToDate || null, req.query.sicCodes as string || null, req.query.status as string || null, req.query.type as string || null,
        req.query.subtype as string || null,
        fullDissolvedDates.dissolvedFromDate || null, fullDissolvedDates.dissolvedToDate || null, ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD);

    const companyResource = await getAdvancedCompanies(API_KEY, advancedSearchParams, (cookies.get(SEARCH_WEB_COOKIE_NAME) as string));
    const companyJson = mapCompanyResource(companyResource);
    const parsedData = Papa.unparse(companyJson);

    res.header("Content-Type", "text/csv");
    res.attachment("Companies-House-search-results.csv");
    return res.send(parsedData);
};

export default [route];

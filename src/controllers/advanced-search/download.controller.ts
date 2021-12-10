import { Request, Response } from "express";
import { mapAdvancedSearchParams, mapCompanyResource } from "../utils/utils";
import { getAdvancedCompanies } from "../../client/apiclient";
import { ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD, API_KEY, SEARCH_WEB_COOKIE_NAME } from "../../config/config";
import Papa from "papaparse";
import Cookies = require("cookies");

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const page = 1;
    const companyNameIncludes = req.query.companyNameIncludes as string || null;
    const companyNameExcludes = req.query.companyNameExcludes as string || null;
    const location = req.query.registeredOfficeAddress as string || null;
    const incorporatedFrom = req.query.incorporatedFrom as string || null;
    const incorporatedTo = req.query.incorporatedTo as string || null;
    const sicCodes = req.query.sicCodes as string || null;
    const companyStatus = req.query.status as string || null;
    const companyType = req.query.type as string || null;
    const dissolvedFrom = req.query.dissolvedFrom as string || null;
    const dissolvedTo = req.query.dissolvedTo as string || null;

    const advancedSearchParams = mapAdvancedSearchParams(page, companyNameIncludes, companyNameExcludes, location, incorporatedFrom, incorporatedTo,
        sicCodes, companyStatus, companyType, dissolvedFrom, dissolvedTo, ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD);

    if (advancedSearchParams.companyType !== null) {
        advancedSearchParams.companyType = String(advancedSearchParams.companyType).replace("icvc", "icvc-securities,icvc-warrant,icvc-umbrella");
    }

    const companyResource = await getAdvancedCompanies(API_KEY, advancedSearchParams, (cookies.get(SEARCH_WEB_COOKIE_NAME) as string));
    const companyJson = mapCompanyResource(companyResource);
    const parsedData = Papa.unparse(companyJson);

    res.header("Content-Type", "text/csv");
    res.attachment("Companies-House-search-results.csv");
    return res.send(parsedData);
};

export default [route];

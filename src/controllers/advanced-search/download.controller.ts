import { Request, Response } from "express";
import { changeDateFormat, mapCompanyResource } from "../utils/utils";
import { AdvancedSearchParams } from "../../model/advanced.search.params";
import { getAdvancedCompanies } from "../../client/apiclient";
import { ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD, API_KEY, SEARCH_WEB_COOKIE_NAME } from "../../config/config";
import Papa from "papaparse";
import Cookies = require("cookies");

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const urlArray = req.headers.referer?.split("advanced-search/get-results?")
    let parsedQueryParams;
    
    if (urlArray != undefined) {
        parsedQueryParams = JSON.parse('{"' + decodeURI(urlArray[1].replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}')
    };

    const advancedSearchParams: AdvancedSearchParams = {
        page: 1,
        companyNameIncludes: parsedQueryParams.companyNameIncludes as string || null,
        companyNameExcludes: parsedQueryParams.companyNameExcludes as string || null,
        location: parsedQueryParams.registeredOfficeAddress as string || null,
        incorporatedFrom: parsedQueryParams.incorporatedFrom !== null ? changeDateFormat(decodeURIComponent(parsedQueryParams.incorporatedFrom)) : null,
        incorporatedTo: parsedQueryParams.incorporatedTo !== null ? changeDateFormat(decodeURIComponent(parsedQueryParams.incorporatedTo)) : null,
        sicCodes: parsedQueryParams.icCodes as string || null,
        companyStatus: parsedQueryParams.status as string || null,
        companyType: parsedQueryParams.type as string || null,
        dissolvedFrom: parsedQueryParams.dissolvedFrom !== null ? changeDateFormat(decodeURIComponent(parsedQueryParams.dissolvedFrom)) : null,
        dissolvedTo: parsedQueryParams.dissolvedTo !== null ? changeDateFormat(decodeURIComponent(parsedQueryParams.dissolvedTo)) : null,
        size: ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD
    };
   
    const companyResource = await getAdvancedCompanies(API_KEY, advancedSearchParams, (cookies.get(SEARCH_WEB_COOKIE_NAME) as string));
    const jsonString = mapCompanyResource(companyResource);
    const parsedData = Papa.unparse(jsonString);

    res.header('Content-Type', 'text/csv');
    res.attachment('advanced-search.csv');
    return res.send(parsedData);
};

export default [route];

import { Request, Response } from "express";
import { changeDateFormat, mapCompanyResource } from "../utils/utils";
import { getAdvancedCompanies } from "../../client/apiclient";
import { ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD, API_KEY, SEARCH_WEB_COOKIE_NAME } from "../../config/config";
import { AdvancedSearchParams } from "../../model/advanced.search.params";
import { parse } from "js2xmlparser";
import Papa from "papaparse";
import Cookies = require("cookies");

const route = async (req: Request, res: Response) => {

    console.log(req.query)
    const cookies = new Cookies(req, res);
    const incorporatedFrom = req.query.incorporatedFrom as string || null;
    const incorporatedTo = req.query.incorporatedTo as string || null;
    const dissolvedFrom = req.query.dissolvedFrom as string || null;
    const dissolvedTo = req.query.dissolvedTo as string || null;
    const downloadType = req.query.downloadType as string || null;

    const advancedSearchParams: AdvancedSearchParams = {
        page: 1,
        companyNameIncludes: req.query.companyNameIncludes as string || null,
        companyNameExcludes: req.query.companyNameExcludes as string || null,
        location: req.query.registeredOfficeAddress as string || null,
        incorporatedFrom: incorporatedFrom !== null ? changeDateFormat(incorporatedFrom) : null,
        incorporatedTo: incorporatedTo !== null ? changeDateFormat(incorporatedTo) : null,
        sicCodes: req.query.sicCodes as string || null,
        companyStatus: req.query.status as string || null,
        companyType: req.query.type as string || null,
        dissolvedFrom: dissolvedFrom !== null ? changeDateFormat(dissolvedFrom) : null,
        dissolvedTo: dissolvedTo !== null ? changeDateFormat(dissolvedTo) : null,
        size: ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD
    };

    if (advancedSearchParams.companyType !== null) {
        advancedSearchParams.companyType = String(advancedSearchParams.companyType).replace("icvc", "icvc-securities,icvc-warrant,icvc-umbrella");
    };
    
    const companyResource = await getAdvancedCompanies(API_KEY, advancedSearchParams, (cookies.get(SEARCH_WEB_COOKIE_NAME) as string));

    if (downloadType === "csv" || null){
        const companyJson = mapCompanyResource(companyResource, true);
        console.log(companyJson)
        const parsedData = Papa.unparse(companyJson);

        res.header("Content-Type", "text/csv");
        res.attachment("advanced-search.csv");
        return res.send(parsedData);
    };

    if (downloadType === "json") {
        const companyJson = mapCompanyResource(companyResource, false);
        res.header("Content-Type", "application/json");
        res.attachment("advanced-search.json");
        return res.send(companyJson);
    };


    if (downloadType === "xml") {
        const companyJson = mapCompanyResource(companyResource, false);
        const xmlData = parse("item", companyJson)

        res.header("Content-Type", "application/xml");
        res.attachment("advanced-search.xml");
        return res.send(xmlData);
    };
};

export default [route];

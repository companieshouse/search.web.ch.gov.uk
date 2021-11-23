import { Request, Response } from "express";
import { getParamsFromUrlReferer, mapCompanyResource } from "../utils/utils";
import { getAdvancedCompanies } from "../../client/apiclient";
import { API_KEY, SEARCH_WEB_COOKIE_NAME } from "../../config/config";
import Papa from "papaparse";
import Cookies = require("cookies");

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);

    if (req.headers.referer === undefined) {
        return res.status(400).send("Unable to download results");
    } else {
        const advancedSearchParams = getParamsFromUrlReferer(req.headers.referer);
        const companyResource = await getAdvancedCompanies(API_KEY, advancedSearchParams, (cookies.get(SEARCH_WEB_COOKIE_NAME) as string));
        const jsonString = mapCompanyResource(companyResource);
        const parsedData = Papa.unparse(jsonString);

        res.header("Content-Type", "text/csv");
        res.attachment("advanced-search.csv");
        return res.send(parsedData);
    }
};

export default [route];

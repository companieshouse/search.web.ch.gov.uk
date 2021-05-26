import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { createGovUkErrorData } from "../../model/govuk.error.data";
import { createLogger } from "@companieshouse/structured-logging-node";
import { SEARCH_WEB_COOKIE_NAME, API_KEY, APPLICATION_NAME } from "../../config/config";
import { getCompanies } from "../../client/apiclient";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/types";
import { detectNearestMatch, toTitleCase } from "../../controllers/utils";
import * as templatePaths from "../../model/template.paths";
import * as errorMessages from "../../model/error.messages";

import escape from "escape-html";
import Cookies = require("cookies");

const logger = createLogger(APPLICATION_NAME);

const validators = [
    check("companyName").not().isEmpty().withMessage(errorMessages.COMPANY_NAME_EMPTY)
];

const generateSize = (size: string | null, searchBefore: string | null, searchAfter: string | null): number | null => {
    if (searchBefore === null && searchAfter === null && size === null) {
        return null;
    }

    const sizeAsNumber = Number(size);

    if (sizeAsNumber < 1 || sizeAsNumber > 100) {
        return 40;
    } else if (size === null && (searchBefore !== null || searchAfter !== null)) {
        return 40;
    }

    return Number(size);
};

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        const companyNameRequestParam = req.query.companyName as string;
        const searchBefore = req.query.searchBefore as string || null;
        const searchAfter = req.query.searchAfter as string || null;
        const size = generateSize(req.query.size as string || null, searchBefore, searchAfter);

        const companyName = companyNameRequestParam;
        const encodedCompanyName = encodeURIComponent(companyName);

        const { companyResource, searchResults } = await getSearchResults(encodedCompanyName, cookies, searchBefore, searchAfter, size);

        const { results } = companyResource;

        const searchBeforeAlphaKey = results[0]?.items?.ordered_alpha_key_with_id;
        const searchAfterAlphaKey = results[results.length - 1]?.items?.ordered_alpha_key_with_id;
        const previousUrl = searchBeforeAlphaKey ? `get-results?companyName=${encodedCompanyName}&searchBefore=${encodeURIComponent(searchBeforeAlphaKey)}` : "";
        const nextUrl = searchAfterAlphaKey ? `get-results?companyName=${encodedCompanyName}&searchAfter=${encodeURIComponent(searchAfterAlphaKey)}` : "";

        return res.render(templatePaths.ALPHABETICAL_SEARCH_RESULTS, {
            searchResults,
            previousUrl,
            nextUrl,
            searchTerm: companyName,
            templateName: templatePaths.ALPHABETICAL_SEARCH_RESULTS
        });
    } else {
        const errorArray = errors.array();
        const errorText = errorArray[errorArray.length - 1].msg as string;
        const companyNameErrorData = createGovUkErrorData(errorText, "#companyName", true, "");
        return res.render(templatePaths.ALPHABETICAL_INDEX, {
            companyNameErrorData,
            errorList: [companyNameErrorData]
        });
    }
};

const getSearchResults = async (encodedCompanyName: string, cookies: Cookies, searchBefore: string | null, searchAfter: string | null, size: number | null): Promise<{
    companyResource: CompaniesResource,
    searchResults: any[]
}> => {
    try {
        const companyResource = await getCompanies(API_KEY, encodedCompanyName, (cookies.get(SEARCH_WEB_COOKIE_NAME) as string), searchBefore, searchAfter, size);
        const { topHit, results } = companyResource;

        let noNearestMatch = false;

        const searchResults = results.map(({ items, links }) => {
            const {
                company_status: status,
                corporate_name: corporateName,
                company_number: companyNumber
            } = items;

            const nearestClass = detectNearestMatch(corporateName, topHit, noNearestMatch);
            noNearestMatch = nearestClass === "nearest";

            const sanitisedCorporateName = escape(corporateName);

            return [
                {
                    classes: nearestClass,
                    html: `<a href="${links.self}">${sanitisedCorporateName}</a>`
                },
                {
                    text: companyNumber
                },
                {
                    text: toTitleCase(status)
                }
            ];
        });

        return {
            companyResource,
            searchResults
        };
    } catch (err) {
        logger.error(`${err}`);
        return {
            companyResource: {
                searchType: "",
                topHit: "",
                results: []
            },
            searchResults: []
        };
    }
};

export default [...validators, route];

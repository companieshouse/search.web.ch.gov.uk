import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { createGovUkErrorData } from "../../model/govuk.error.data";
import { createLogger } from "@companieshouse/structured-logging-node";
import { SEARCH_WEB_COOKIE_NAME, API_KEY, APPLICATION_NAME } from "../../config/config";
import { getCompanies } from "../../client/apiclient";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/types";
import { detectNearestMatch, toTitleCase } from "../utils/utils";
import * as templatePaths from "../../model/template.paths";
import * as errorMessages from "../../model/error.messages";

import escape from "escape-html";
import Cookies = require("cookies");

const logger = createLogger(APPLICATION_NAME);

const validators = [
    check("companyName").not().isEmpty().withMessage(errorMessages.COMPANY_NAME_EMPTY)
];

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        const companyNameRequestParam = req.query.companyName as string;
        const searchBefore = req.query.searchBefore as string || null;
        const searchAfter = req.query.searchAfter as string || null;
        // Currently not allowing users to specify a size parameter, will leave this here for possible future implementation
        // const size = generateSize(req.query.size as string || null, searchBefore, searchAfter);
        const size = null;
        let prevLink = "";
        let nextLink = "";

        const companyName = companyNameRequestParam;
        const encodedCompanyName = encodeURIComponent(companyName);

        const { companyResource, searchResults } = await getSearchResults(encodedCompanyName, cookies, searchBefore, searchAfter, size);

        const { items } = companyResource;

        const searchBeforeAlphaKey = items[0]?.ordered_alpha_key_with_id;
        const searchAfterAlphaKey = items[items.length - 1]?.ordered_alpha_key_with_id;
        const previousUrl = searchBeforeAlphaKey ? `get-results?companyName=${encodedCompanyName}&searchBefore=${encodeURIComponent(searchBeforeAlphaKey)}` : "";
        const nextUrl = searchAfterAlphaKey ? `get-results?companyName=${encodedCompanyName}&searchAfter=${encodeURIComponent(searchAfterAlphaKey)}` : "";

        const searchResultsPreviousLink = await getSearchResults(encodedCompanyName, cookies, searchBeforeAlphaKey, searchAfter, size);
        const searchResultsNextLink = await getSearchResults(encodedCompanyName, cookies, searchBefore, searchAfterAlphaKey, size);

        if (searchResultsPreviousLink.searchResults.length > 0) {
            prevLink = "resultsPresent";
        }
        if (searchResultsNextLink.searchResults.length > 0) {
            nextLink = "resultsPresent";
        }

        return res.render(templatePaths.ALPHABETICAL_SEARCH_RESULTS, {
            searchResults,
            previousUrl,
            nextUrl,
            searchTerm: companyName,
            prevLink,
            nextLink,
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
        const { top_hit, items } = companyResource;

        let noNearestMatch = false;

        const searchResults = items.map(({ company_number, company_name, company_status, ordered_alpha_key_with_id, links }) => {
            const nearestClass = detectNearestMatch(ordered_alpha_key_with_id, top_hit.ordered_alpha_key_with_id, noNearestMatch);

            if (!noNearestMatch) {
                noNearestMatch = nearestClass === "nearest";
            };

            const sanitisedCompanyName = escape(company_name);

            return [
                {
                    classes: nearestClass,
                    html: `<a href="${links.company_profile}">${sanitisedCompanyName}</a>`
                },
                {
                    text: company_number
                },
                {
                    text: toTitleCase(company_status)
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
                etag: "",
                kind: "",
                top_hit: {
                    company_name: "",
                    company_number: "",
                    company_status: "",
                    ordered_alpha_key_with_id: "",
                    kind: ""
                },
                items: []
            },
            searchResults: []
        };
    }
};

export default [...validators, route];

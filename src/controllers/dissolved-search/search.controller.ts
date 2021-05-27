import { Request, Response } from "express";
import { query, validationResult } from "express-validator";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/types";
import { createLogger } from "@companieshouse/structured-logging-node";
import { getDissolvedCompanies } from "../../client/apiclient";

import { SEARCH_WEB_COOKIE_NAME, API_KEY, APPLICATION_NAME, LAST_UPDATED_MESSAGE, DISSOLVED_SEARCH_NUMBER_OF_RESULTS } from "../../config/config";
import { detectNearestMatch, formatDate, formatPostCode, generateSize, sanitiseCompanyName } from "../utils";
import * as templatePaths from "../../model/template.paths";
import * as errorMessages from "../../model/error.messages";
import Cookies = require("cookies");

const logger = createLogger(APPLICATION_NAME);

const ALPHABETICAL_SEARCH_TYPE: string = "alphabetical";
const BEST_MATCH_SEARCH_TYPE: string = "bestMatch";
const PREVIOUS_NAME_SEARCH_TYPE: string = "previousNameDissolved";

const validators = [
    query("alphabetical").custom((value, { req }) => {
        if (req.query?.searchType === ALPHABETICAL_SEARCH_TYPE && req.query?.changedName === PREVIOUS_NAME_SEARCH_TYPE) {
            throw new Error(errorMessages.ALPHABETICAL_PREVIOUS_NAMES_ERROR);
        }
        return true;
    })
];

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        const companyNameRequestParam: string = req.query.companyName as string;
        const searchTypeRequestParam: string = req.query.searchType as string;
        const changeNameTypeParam: string = req.query.changedName as string;
        const searchBefore = req.query.searchBefore as string || null;
        const searchAfter = req.query.searchAfter as string || null;
        const size = generateSize(req.query.size as string || null, searchBefore, searchAfter);
        const companyName: string = companyNameRequestParam;
        const encodedCompanyName: string = encodeURIComponent(companyName);
        const lastUpdatedMessage: string = LAST_UPDATED_MESSAGE;
        const page = searchTypeRequestParam === ALPHABETICAL_SEARCH_TYPE ? 0 : req.query.page ? Number(req.query.page) : 1;

        let searchType: string;

        if (companyNameRequestParam === "") {
            return res.render(templatePaths.DISSOLVED_INDEX);
        }

        if (searchTypeRequestParam === ALPHABETICAL_SEARCH_TYPE) {
            searchType = ALPHABETICAL_SEARCH_TYPE;
        } else if (changeNameTypeParam === PREVIOUS_NAME_SEARCH_TYPE) {
            searchType = PREVIOUS_NAME_SEARCH_TYPE;
        } else {
            searchType = BEST_MATCH_SEARCH_TYPE;
        };

        const { companyResource, searchResults } = await getSearchResults(encodedCompanyName, cookies, searchType, page, searchBefore, searchAfter, size);

        const { items } = companyResource;

        const numberOfPages: number = Math.ceil(companyResource.hits / DISSOLVED_SEARCH_NUMBER_OF_RESULTS);

        const partialHref: string = "get-results?companyName=" + companyNameRequestParam + "&changedName=" + changeNameTypeParam;

        const searchBeforeAlphaKey = items[0]?.ordered_alpha_key_with_id;
        const searchAfterAlphaKey = items[items.length - 1]?.ordered_alpha_key_with_id;
        const previousUrl = searchBeforeAlphaKey ? `get-results?companyName=${encodedCompanyName}&searchType=${ALPHABETICAL_SEARCH_TYPE}&searchBefore=${encodeURIComponent(searchBeforeAlphaKey)}` : "";
        const nextUrl = searchAfterAlphaKey ? `get-results?companyName=${encodedCompanyName}&searchType=${ALPHABETICAL_SEARCH_TYPE}&searchAfter=${encodeURIComponent(searchAfterAlphaKey)}` : "";
        const searchTypeFlag = searchType === ALPHABETICAL_SEARCH_TYPE;

        if (changeNameTypeParam === PREVIOUS_NAME_SEARCH_TYPE) {
            return res.render(templatePaths.DISSOLVED_SEARCH_RESULTS_PREVIOUS_NAME, {
                searchResults, searchedName: companyName, templateName: templatePaths.DISSOLVED_SEARCH_RESULTS_PREVIOUS_NAME, lastUpdatedMessage, partialHref, numberOfPages, page
            });
        }

        return res.render(templatePaths.DISSOLVED_SEARCH_RESULTS, {
            searchResults, searchedName: companyName, templateName: templatePaths.DISSOLVED_SEARCH_RESULTS, lastUpdatedMessage, partialHref, numberOfPages, page, previousUrl, nextUrl, searchTypeFlag
        });
    } else {
        const errorText = errors.array().map((err) => err.msg).pop() as string;
        const dissolvedSearchOptionsErrorData: GovUkErrorData = createGovUkErrorData(errorText, "#changed-name", true, "");
        return res.render(templatePaths.DISSOLVED_INDEX, {
            dissolvedSearchOptionsErrorData,
            errorList: [dissolvedSearchOptionsErrorData]
        });
    }
};

const getSearchResults = async (encodedCompanyName: string, cookies: Cookies, searchType: string, page: number, searchBefore: string | null, searchAfter: string | null, size: number | null): Promise<{
    companyResource: CompaniesResource,
    searchResults: any[]
}> => {
    try {
        const companyResource = await getDissolvedCompanies(API_KEY, encodedCompanyName, (cookies.get(SEARCH_WEB_COOKIE_NAME) as string), searchType, page, searchBefore, searchAfter, size);
        const { top_hit, items } = companyResource;

        let noNearestMatch = false;

        const searchResults = items.map(({ company_name, company_number, date_of_cessation, date_of_creation, address, previous_company_names }) => {
            const nearestClass = detectNearestMatch(company_name, top_hit.company_name, noNearestMatch);
            noNearestMatch = nearestClass === "nearest";

            if (searchType === ALPHABETICAL_SEARCH_TYPE) {
                return alphabeticalMapping(nearestClass, company_name, company_number, date_of_cessation, date_of_creation, address);
            } else if (searchType === BEST_MATCH_SEARCH_TYPE) {
                return bestMatchMapping(company_name, company_number, date_of_cessation, date_of_creation, address);
            } else {
                return previousNameResults(company_name, company_number, date_of_cessation, date_of_creation, address, previous_company_names);
            };
        });

        return {
            companyResource,
            searchResults
        };
    } catch (err) {
        logger.error(`${err}`);
        return {
            companyResource: {
                hits: 0,
                etag: "",
                kind: "",
                top_hit: {
                    address: {
                        locality: "",
                        postal_code: ""
                    },
                    company_name: "",
                    company_number: "",
                    company_status: "",
                    date_of_cessation: new Date(),
                    date_of_creation: new Date(),
                    kind: "",
                    ordered_alpha_key_with_id: "",
                    previous_company_names: []
                },
                items: []
            },
            searchResults: []
        };
    }
};

const previousNameResults = (company_name, company_number, date_of_cessation, date_of_creation, address, previous_company_names) => {
    return [
        {
            html: sanitiseCompanyName(previous_company_names)
        },
        {
            html: sanitiseCompanyName(company_name)
        },
        {
            text: company_number
        },
        {
            text: formatDate(date_of_creation)
        },
        {
            text: formatDate(date_of_cessation),
            classes: "govuk-table__cell no-wrap"
        },
        {
            text: formatPostCode(address?.postal_code)
        }
    ];
};

const alphabeticalMapping = (nearestClass, company_name, company_number, date_of_cessation, date_of_creation, address) => {
    return [
        {
            classes: nearestClass,
            html: sanitiseCompanyName(company_name)
        },
        {
            text: company_number
        },
        {
            text: formatDate(date_of_creation)
        },
        {
            text: formatDate(date_of_cessation),
            classes: "govuk-table__cell no-wrap"
        },
        {
            text: formatPostCode(address?.postal_code)
        }
    ];
};

const bestMatchMapping = (company_name, company_number, date_of_cessation, date_of_creation, address) => {
    return [
        {
            html: sanitiseCompanyName(company_name)
        },
        {
            text: company_number
        },
        {
            text: formatDate(date_of_creation)
        },
        {
            text: formatDate(date_of_cessation),
            classes: "govuk-table__cell no-wrap"
        },
        {
            text: formatPostCode(address?.postal_code)
        }
    ];
};

export default [...validators, route];

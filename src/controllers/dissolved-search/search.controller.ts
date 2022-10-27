import { Request, Response } from "express";
import { query, validationResult } from "express-validator";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/types";
import { createLogger } from "@companieshouse/structured-logging-node";
import { getDissolvedCompanies } from "../../client/apiclient";
import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";

import { SEARCH_WEB_COOKIE_NAME, API_KEY, APPLICATION_NAME, LAST_UPDATED_MESSAGE, DISSOLVED_SEARCH_NUMBER_OF_RESULTS, ACCOUNT_URL, CHS_MONITOR_GUI_URL } from "../../config/config";
import { detectNearestMatch, formatDate, sanitiseCompanyName, generateROAddress, determineReturnToUrl, getDownloadReportText, determineReportAvailableBool, mapResponsiveHeaders, getPagingRange } from "../utils/utils";
import * as templatePaths from "../../model/template.paths";
import * as errorMessages from "../../model/error.messages";
import Cookies = require("cookies");

const logger = createLogger(APPLICATION_NAME);

const ALPHABETICAL_SEARCH_TYPE: string = "alphabetical";
const BEST_MATCH_SEARCH_TYPE: string = "bestMatch";
const PREVIOUS_NAME_SEARCH_TYPE: string = "previousNameDissolved";
const COMPANY_NAME_TABLE_HEADING: string = "Company name";
const COMPANY_NUMBER_TABLE_HEADING: string = "Company number";
const INCORPORATED_ON_TABLE_HEADING: string = "Incorporated on";
const DISSOLVED_ON_TABLE_HEADING: string = "Dissolved on";
const ROA_TABLE_HEADING: string = "Registered office address at dissolution";
const DOWNLOAD_REPORT_TABLE_HEADING: string = "Download Report";
const PREVIOUS_COMPANY_NAME_TABLE_HEADING: string = "Previous company name";


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
        const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;
        // Currently not allowing users to specify a size parameter, will leave this here for possible future implementation
        // const size = generateSize(req.query.size as string || null, searchBefore, searchAfter);
        const size = null;
        const companyName: string = companyNameRequestParam;
        const encodedCompanyName: string = encodeURIComponent(companyName);
        const lastUpdatedMessage: string = LAST_UPDATED_MESSAGE;
        const page = searchTypeRequestParam === ALPHABETICAL_SEARCH_TYPE ? 0 : req.query.page ? Number(req.query.page) : 1;
        const returnToUrl = determineReturnToUrl(req);

        let prevLink = "";
        let nextLink = "";

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

        const { companyResource, searchResults } = await getSearchResults(encodedCompanyName, cookies, searchType, page, searchBefore, searchAfter, size, signedIn, returnToUrl);

        const { items } = companyResource;

        const numberOfPages: number = Math.ceil(companyResource.hits / DISSOLVED_SEARCH_NUMBER_OF_RESULTS);

        const partialHref: string = "get-results?companyName=" + encodeURIComponent(companyNameRequestParam) + "&changedName=" + changeNameTypeParam;

        const searchBeforeAlphaKey = items[0]?.ordered_alpha_key_with_id;
        const searchAfterAlphaKey = items[items.length - 1]?.ordered_alpha_key_with_id;
        const previousUrl = searchBeforeAlphaKey ? `get-results?companyName=${encodedCompanyName}&searchType=${ALPHABETICAL_SEARCH_TYPE}&searchBefore=${encodeURIComponent(searchBeforeAlphaKey)}` : "";
        const nextUrl = searchAfterAlphaKey ? `get-results?companyName=${encodedCompanyName}&searchType=${ALPHABETICAL_SEARCH_TYPE}&searchAfter=${encodeURIComponent(searchAfterAlphaKey)}` : "";
        const searchTypeFlag = searchType === ALPHABETICAL_SEARCH_TYPE;
        const pagingRange = getPagingRange(page, numberOfPages);

        if (changeNameTypeParam === PREVIOUS_NAME_SEARCH_TYPE) {
            return res.render(templatePaths.DISSOLVED_SEARCH_RESULTS_PREVIOUS_NAME, {
               searchResults, searchedName: companyName, templateName: templatePaths.DISSOLVED_SEARCH_RESULTS_PREVIOUS_NAME, lastUpdatedMessage, partialHref, numberOfPages, page, pagingRange
            });
        }

        const searchResultsPreviousLink = await getSearchResults(encodedCompanyName, cookies, searchType, page, searchBeforeAlphaKey, searchAfter, size, signedIn, returnToUrl);
        const searchResultsNextLink = await getSearchResults(encodedCompanyName, cookies, searchType, page, searchBefore, searchAfterAlphaKey, size, signedIn, returnToUrl);

        if (searchResultsPreviousLink.searchResults.length > 0) {
            prevLink = "resultsPresent";
        }
        if (searchResultsNextLink.searchResults.length > 0) {
            nextLink = "resultsPresent";
        }

        return res.render(templatePaths.DISSOLVED_SEARCH_RESULTS, {
            searchResults, searchedName: companyName, templateName: templatePaths.DISSOLVED_SEARCH_RESULTS, lastUpdatedMessage, partialHref, numberOfPages, page, previousUrl, nextUrl, prevLink, nextLink, searchTypeFlag, pagingRange
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

const getSearchResults = async (encodedCompanyName: string, cookies: Cookies, searchType: string, page: number, searchBefore: string | null, searchAfter: string | null, size: number | null, signedIn: boolean, returnToUrl: string): Promise<{
    companyResource: CompaniesResource,
    searchResults: any[]
}> => {
    try {
        const companyResource = await getDissolvedCompanies(API_KEY, encodedCompanyName, (cookies.get(SEARCH_WEB_COOKIE_NAME) as string), searchType, page, searchBefore, searchAfter, size);
        const { top_hit, items } = companyResource;

        let noNearestMatch = false;

        const searchResults = items.map(({ company_name, company_number, date_of_cessation, date_of_creation, registered_office_address, previous_company_names, ordered_alpha_key_with_id, matched_previous_company_name }) => {
            const nearestClass = detectNearestMatch(ordered_alpha_key_with_id, top_hit.ordered_alpha_key_with_id, noNearestMatch);
            const reportAvailable: boolean = determineReportAvailableBool(company_number, date_of_cessation);
            const downloadReportText: string = getDownloadReportText(signedIn, reportAvailable, returnToUrl, company_number, company_name);
            if (!noNearestMatch) {
                noNearestMatch = nearestClass === "nearest";
            };

            if (searchType === ALPHABETICAL_SEARCH_TYPE) {
                return alphabeticalMapping(nearestClass, company_name, company_number, date_of_cessation, date_of_creation, registered_office_address, downloadReportText);
            } else if (searchType === BEST_MATCH_SEARCH_TYPE) {
                return bestMatchMapping(company_name, company_number, date_of_cessation, date_of_creation, registered_office_address, downloadReportText);
            } else {
                return previousNameResults(company_name, company_number, date_of_cessation, date_of_creation, registered_office_address, previous_company_names, matched_previous_company_name, downloadReportText);
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
                    registered_office_address: {
                        address_line_1: "",
                        address_line_2: "",
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
                    previous_company_names: [],
                    matched_previous_company_name: {
                        ceased_on: new Date(),
                        effective_from: new Date(),
                        name: ""
                    }
                },
                items: []
            },
            searchResults: []
        };
    }
};

const previousNameResults = (company_name, company_number, date_of_cessation, date_of_creation, registered_office_address, previous_company_names, matched_previous_company_name, downloadReportText) => {
    return [
        {
            html: mapResponsiveHeaders(PREVIOUS_COMPANY_NAME_TABLE_HEADING, sanitiseCompanyName(matched_previous_company_name.name))
        },
        {
            html: mapResponsiveHeaders(COMPANY_NAME_TABLE_HEADING, sanitiseCompanyName(company_name))
        },
        {
            html: mapResponsiveHeaders(COMPANY_NUMBER_TABLE_HEADING, company_number)
        },
        {
            html: mapResponsiveHeaders(INCORPORATED_ON_TABLE_HEADING, formatDate(date_of_creation))
        },
        {
            html: mapResponsiveHeaders(DISSOLVED_ON_TABLE_HEADING, formatDate(date_of_cessation)),
            classes: "govuk-table__cell no-wrap"
        },
        {
            html: mapResponsiveHeaders(ROA_TABLE_HEADING, generateROAddress(registered_office_address))
        },
        {
            html: mapResponsiveHeaders(DOWNLOAD_REPORT_TABLE_HEADING, downloadReportText),
        }
    ];
};

const alphabeticalMapping = (nearestClass, company_name, company_number, date_of_cessation, date_of_creation, registered_office_address, downloadReportText) => {
    return [
        {
            classes: nearestClass,
            html: mapResponsiveHeaders(COMPANY_NAME_TABLE_HEADING, sanitiseCompanyName(company_name))
        },
        {
            html: mapResponsiveHeaders(COMPANY_NUMBER_TABLE_HEADING, company_number)
        },
        {
            html: mapResponsiveHeaders(INCORPORATED_ON_TABLE_HEADING, formatDate(date_of_creation))
        },
        {
            html: mapResponsiveHeaders(DISSOLVED_ON_TABLE_HEADING, formatDate(date_of_cessation)),
            classes: "govuk-table__cell no-wrap"
        },
        {
            html: mapResponsiveHeaders(ROA_TABLE_HEADING, generateROAddress(registered_office_address))
        },
        {
            html: mapResponsiveHeaders(DOWNLOAD_REPORT_TABLE_HEADING, downloadReportText),
        }
    ];
};

const bestMatchMapping = (company_name, company_number, date_of_cessation, date_of_creation, registered_office_address, downloadReportText) => {
    return [
        {
            html: mapResponsiveHeaders(COMPANY_NAME_TABLE_HEADING, sanitiseCompanyName(company_name))
        },
        {
            html: mapResponsiveHeaders(COMPANY_NUMBER_TABLE_HEADING, company_number)
        },
        {
            html: mapResponsiveHeaders(INCORPORATED_ON_TABLE_HEADING, formatDate(date_of_creation))
        },
        {
            html: mapResponsiveHeaders(DISSOLVED_ON_TABLE_HEADING, formatDate(date_of_cessation)),
            classes: "govuk-table__cell no-wrap"
        },
        {
            html: mapResponsiveHeaders(ROA_TABLE_HEADING, generateROAddress(registered_office_address))
        },
        {
            html: mapResponsiveHeaders(DOWNLOAD_REPORT_TABLE_HEADING, downloadReportText),
        }
    ];
};

export default [...validators, route];

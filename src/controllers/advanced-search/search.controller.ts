import { Request, Response } from "express";
import { createLogger } from "@companieshouse/structured-logging-node";
import { SEARCH_WEB_COOKIE_NAME, API_KEY, APPLICATION_NAME } from "../../config/config";
import { getAdvancedCompanies } from "../../client/apiclient";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/advanced-search/types";
import { getCompanyConstant, COMPANY_STATUS_CONSTANT, COMPANY_TYPE_CONSTANT } from "../../config/api.enumerations";
import { checkLineBreakRequired, formatLongDate, formatCompactAddress, changeDateFormat, getPagingRange, buildPagingUrl } from "../utils/utils";
import { advancedSearchValidationRules, validate } from "../utils/advanced-search-validation";
import { validationResult } from "express-validator";
import * as templatePaths from "../../model/template.paths";
import Cookies = require("cookies");
import { AdvancedSearchParams } from "model/advanced.search.params";

const logger = createLogger(APPLICATION_NAME);

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const page = req.query.page ? Number(req.query.page) : 1;
    const incorporatedFrom = req.query.incorporatedFrom as string || null;
    const incorporatedTo = req.query.incorporatedTo as string || null;
    const advancedSearchParams: AdvancedSearchParams = {
        page: page,
        companyNameIncludes: req.query.companyNameIncludes as string || null,
        companyNameExcludes: req.query.companyNameExcludes as string || null,
        location: req.query.registeredOfficeAddress as string || null,
        incorporatedFrom: incorporatedFrom !== null ? changeDateFormat(incorporatedFrom) : null,
        incorporatedTo: incorporatedTo !== null ? changeDateFormat(incorporatedTo) : null,
        sicCodes: null,
        companyStatus: null,
        companyType: null,
        dissolvedFrom: null,
        dissolvedTo: null
    }

    const errors = validationResult(req);
    const errorList = validate(errors);

    if (!errors.isEmpty()) {
        return res.render(templatePaths.ADVANCED_SEARCH_RESULTS, { ...errorList, advancedSearchParams });
    };

    const { companyResource, searchResults } = await getSearchResults(advancedSearchParams, cookies);
    const numberOfPages: number = Math.ceil(companyResource.hits / 20);
    const pagingRange = getPagingRange(page, numberOfPages);

    const partialHref: string = buildPagingUrl(advancedSearchParams);
    return res.render(templatePaths.ADVANCED_SEARCH_RESULTS,
        { searchResults, advancedSearchParams, numberOfPages, pagingRange, partialHref, incorporatedFrom, incorporatedTo });
};

const getSearchResults = async (advancedSearchParams: AdvancedSearchParams, cookies: Cookies) : Promise<{
    companyResource: CompaniesResource,
    searchResults: any[]
}> => {
    try {
        const companyResource = await getAdvancedCompanies(API_KEY, advancedSearchParams, (cookies.get(SEARCH_WEB_COOKIE_NAME) as string));
        const { items } = companyResource;

        const searchResults = items.map(({ company_name, links, company_status, company_type, company_number, date_of_creation, date_of_cessation, registered_office_address, sic_codes }) => {
            const mappedCompanyStatus = getCompanyConstant(COMPANY_STATUS_CONSTANT, company_status);
            const mappedCompanyType = getCompanyConstant(COMPANY_TYPE_CONSTANT, company_type);
            const formattedIncorporationDate = formatLongDate("- Incorporated on", date_of_creation);
            const formattedDissolvedDate = checkLineBreakRequired(formatLongDate("Dissolved on", date_of_cessation));
            const addressString = formatCompactAddress(registered_office_address);
            const sicCodeString = (sic_codes === undefined) ? "" : "SIC codes - " + sic_codes.join(", ");
            return [
                {
                    html: `<h2 class="govuk-heading-m" style="margin-bottom: 3px;"><a class="govuk-link" href=${links.company_profile} target="_blank">${company_name}<span class="govuk-visually-hidden">(link opens a new window)</span></a></h2>
                            <p style="padding-bottom: 10px; margin-top:0px;">
                            <span class="govuk-body govuk-!-font-weight-bold">${mappedCompanyStatus}</span><br>
                            ${mappedCompanyType}<br>
                            ${company_number} ${formattedIncorporationDate}<br>
                            ${formattedDissolvedDate}
                            ${addressString}<br>
                            ${sicCodeString}</p>`
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
                hits: 0,
                etag: "",
                kind: "",
                top_hit: {
                    company_name: "",
                    company_number: "",
                    company_status: "",
                    company_type: "",
                    kind: "",
                    links: {
                        company_profile: ""
                    },
                    date_of_cessation: new Date(),
                    date_of_creation: new Date(),
                    registered_office_address: {
                        address_line_1: "",
                        address_line_2: "",
                        locality: "",
                        postal_code: "",
                        premises: "",
                        region: "",
                        country: ""
                    },
                    sic_codes: [
                    ]
                },
                items: []
            },
            searchResults: []
        };
    }
};

export default [...advancedSearchValidationRules, route];

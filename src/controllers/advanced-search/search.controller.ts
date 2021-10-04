import { Request, Response } from "express";
import { createLogger } from "@companieshouse/structured-logging-node";
import { SEARCH_WEB_COOKIE_NAME, API_KEY, APPLICATION_NAME } from "../../config/config";
import { getAdvancedCompanies } from "../../client/apiclient";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/advanced-search/types";
import { sanitiseCompanyName } from "../utils";
import * as templatePaths from "../../model/template.paths";

import Cookies = require("cookies");

const logger = createLogger(APPLICATION_NAME);

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const companyNameIncludes = req.query.companyNameIncludes as string || null;
    const companyNameExcludes = req.query.companyNameExcludes as string || null;
    const location = null;
    const incorporatedFrom = null;
    const incorporatedTo = null;
    const sicCodes = null;
    const companyStatus = null;
    const companyType = null;
    const dissolvedFrom = null;
    const dissolvedTo = null;

    const { searchResults } = await getSearchResults(companyNameIncludes, companyNameExcludes, location, incorporatedFrom, incorporatedTo,
        sicCodes, companyStatus, companyType, dissolvedFrom, dissolvedTo, cookies);
    return res.render(templatePaths.ADVANCED_SEARCH_RESULTS, { searchResults, companyNameIncludes, companyNameExcludes });
};

const getSearchResults = async (companyNameIncludes: string | null, companyNameExcludes: string | null, location: string | null, incorporatedFrom: string | null,
    incorporatedTo: string | null, sicCodes: string | null, companyType: string | null, companyStatus: string | null,
    dissolvedFrom: string | null, dissolvedTo: string | null, cookies: Cookies) : Promise<{
    companyResource: CompaniesResource,
    searchResults: any[]
}> => {
    try {
        const companyResource = await getAdvancedCompanies(API_KEY, companyNameIncludes, companyNameExcludes, location, incorporatedFrom, incorporatedTo,
            sicCodes, companyStatus, companyType, dissolvedFrom, dissolvedTo, (cookies.get(SEARCH_WEB_COOKIE_NAME) as string));
        const { items } = companyResource;

        const searchResults = items.map(({ company_name, links }) => {
            return [
                {
                    html: `<h2 class="govuk-heading-m" style="margin-bottom: 3px;"><a class="govuk-link" href=${links.company_profile} target="_blank">${company_name}<span class="govuk-visually-hidden">(link opens a new window)</span></a></h2>`
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

export default [route];

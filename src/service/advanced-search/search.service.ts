import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/advanced-search/types";
import { getAdvancedCompanies } from "../../client/apiclient";
import { getCompanyConstant, COMPANY_TYPE_CONSTANT } from "../../config/api.enumerations";
import { API_KEY, APPLICATION_NAME, SEARCH_WEB_COOKIE_NAME } from "../../config/config";
import { formatLongDate, checkLineBreakRequired, formatCompactAddress, buildCompanyStatusHtml } from "../../controllers/utils/utils";
import { AdvancedSearchParams } from "../../model/advanced.search.params";
import Cookies from "cookies";
import { createLogger } from "@companieshouse/structured-logging-node";

const logger = createLogger(APPLICATION_NAME);
const emptyCompaniesResource: CompaniesResource = {
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
};

export const getSearchResults = async (advancedSearchParams: AdvancedSearchParams, cookies: Cookies) : Promise<{
    companyResource: CompaniesResource,
    searchResults: any[]
}> => {
    try {
        if (isAdvancedSearchParamsEmpty(advancedSearchParams)) {
            return {
                companyResource: emptyCompaniesResource,
                searchResults: []
            };
        }
        const companyResource = await getAdvancedCompanies(API_KEY, advancedSearchParams, (cookies.get(SEARCH_WEB_COOKIE_NAME) as string));
        const { items } = companyResource;

        const searchResults = items.map(({ company_name, links, company_status, company_type, company_number, date_of_creation, date_of_cessation, registered_office_address, sic_codes }) => {
            const mappedCompanyStatus = buildCompanyStatusHtml(company_status);
            const mappedCompanyType = getCompanyConstant(COMPANY_TYPE_CONSTANT, company_type);
            const formattedIncorporationDate = formatLongDate("- Incorporated on", date_of_creation);
            const formattedDissolvedDate = checkLineBreakRequired(formatLongDate("Dissolved on", date_of_cessation));
            const addressString = formatCompactAddress(registered_office_address);
            const sicCodeString = (sic_codes === undefined) ? "" : "SIC codes - " + sic_codes.join(", ");
            return [
                {
                    html: `<h2 class="govuk-heading-m" style="margin-bottom: 3px;"><a class="govuk-link" href=${links.company_profile} target="_blank">${company_name}<span class="govuk-visually-hidden">(link opens a new window)</span></a></h2>
                            <p style="padding-bottom: 10px; margin-top:0px;">
                            ${mappedCompanyStatus}
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
            companyResource: emptyCompaniesResource,
            searchResults: []
        };
    }
};

export const isAdvancedSearchParamsEmpty = (advancedSearchParams: AdvancedSearchParams): boolean => {
    return advancedSearchParams.companyNameIncludes === null &&
        advancedSearchParams.companyNameExcludes === null &&
        advancedSearchParams.location === null &&
        advancedSearchParams.incorporatedFrom === null &&
        advancedSearchParams.incorporatedTo === null &&
        advancedSearchParams.sicCodes === null &&
        advancedSearchParams.companyStatus === null &&
        advancedSearchParams.companyType === null &&
        advancedSearchParams.dissolvedFrom === null &&
        advancedSearchParams.dissolvedTo === null;
};

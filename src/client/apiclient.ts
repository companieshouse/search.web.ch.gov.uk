import { createApiClient } from "@companieshouse/api-sdk-node";
import { CompaniesResource as AlphabeticalCompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/types";
import { CompaniesResource as DissolvedCompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/types";
import { CompaniesResource as AdvancedCompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/advanced-search/types";
import { API_URL, APPLICATION_NAME, DISSOLVED_SEARCH_NUMBER_OF_RESULTS } from "../config/config";
import { createLogger } from "@companieshouse/structured-logging-node";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import createError from "http-errors";
import { AdvancedSearchParams } from "model/advanced.search.params";

const logger = createLogger(APPLICATION_NAME);

export const getCompanies =
    async (apiKey: string, companyName: string, requestId: string, searchBefore: string | null, searchAfter: string | null, size: number | null): Promise<AlphabeticalCompaniesResource> => {
        const api = createApiClient(apiKey, undefined, API_URL);
        const companiesResource: Resource<AlphabeticalCompaniesResource> =
            await api.alphabeticalSearch.getCompanies(companyName, requestId, searchBefore, searchAfter, size);
        if (companiesResource.httpStatusCode !== 200 && companiesResource.httpStatusCode !== 201) {
            throw createError(companiesResource.httpStatusCode, companiesResource.httpStatusCode.toString());
        }
        logger.info(`Get company name alphabetical search results, company_name=${companyName}, status_code=${companiesResource.httpStatusCode}`);
        return companiesResource.resource as AlphabeticalCompaniesResource;
    };

export const getDissolvedCompanies =
    async (apiKey: string, companyName: string, requestId, searchType: string, page: number, searchBefore: string | null, searchAfter: string | null, size: number | null): Promise<DissolvedCompaniesResource> => {
        const api = createApiClient(apiKey, undefined, API_URL);
        const startIndexOffset = (page * DISSOLVED_SEARCH_NUMBER_OF_RESULTS) - DISSOLVED_SEARCH_NUMBER_OF_RESULTS;
        const companiesResource: Resource<DissolvedCompaniesResource> =
            await api.dissolvedSearch.getCompanies(companyName, requestId, searchType, startIndexOffset, searchBefore, searchAfter, size);
        if (companiesResource.httpStatusCode !== 200 && companiesResource.httpStatusCode !== 201) {
            throw createError(companiesResource.httpStatusCode, companiesResource.httpStatusCode.toString());
        }
        logger.info(`Get company name dissolved search results, company_name=${companyName}, status_code=${companiesResource.httpStatusCode}`);
        return companiesResource.resource as DissolvedCompaniesResource;
    };

export const getAdvancedCompanies =
    async (apiKey: string, advancedSearchParams: AdvancedSearchParams, requestId: string): Promise<AdvancedCompaniesResource> => {
        const api = createApiClient(apiKey, undefined, API_URL);
        const startIndexOffset = (advancedSearchParams.page * 20) - 20;
        const companiesResource: Resource<AdvancedCompaniesResource> =
            await api.advancedSearch.getCompanies(startIndexOffset,
                advancedSearchParams.companyNameIncludes,
                advancedSearchParams.companyNameExcludes,
                advancedSearchParams.location,
                advancedSearchParams.incorporatedFrom,
                advancedSearchParams.incorporatedTo,
                advancedSearchParams.sicCodes,
                advancedSearchParams.companyStatus,
                advancedSearchParams.companyType,
                advancedSearchParams.dissolvedFrom,
                advancedSearchParams.dissolvedTo,
                requestId);

        if (companiesResource.httpStatusCode !== 200 && companiesResource.httpStatusCode !== 201) {
            throw createError(companiesResource.httpStatusCode, companiesResource.httpStatusCode.toString());
        }
        logger.info(`Get advanced search results, company_name_includes=${advancedSearchParams.companyNameIncludes},company_name_excludes=${advancedSearchParams.companyNameExcludes},
         location=${advancedSearchParams.location}, incorporated_from=${advancedSearchParams.incorporatedFrom}, incorporated_to=${advancedSearchParams.incorporatedTo},
          company_status=${advancedSearchParams.companyStatus}, sic_codes=${advancedSearchParams.sicCodes}, dissolved_from=${advancedSearchParams.dissolvedFrom},
          dissolved_to=${advancedSearchParams.dissolvedTo}, status_code=${companiesResource.httpStatusCode}`);
        return companiesResource.resource as AdvancedCompaniesResource;
    };

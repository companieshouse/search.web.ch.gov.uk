import { createApiClient } from "@companieshouse/api-sdk-node";
import { CompaniesResource as AlphabeticalCompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/types";
import { CompaniesResource as DissolvedCompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/types";
import { API_URL, APPLICATION_NAME, DISSOLVED_SEARCH_NUMBER_OF_RESULTS } from "../config/config";
import { createLogger } from "@companieshouse/structured-logging-node";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import createError from "http-errors";

const logger = createLogger(APPLICATION_NAME);

export const getCompanies =
    async (apiKey: string, companyName: string, requestId): Promise<AlphabeticalCompaniesResource> => {
        const api = createApiClient(apiKey, undefined, API_URL);
        const companiesResource: Resource<AlphabeticalCompaniesResource> =
            await api.alphabeticalSearch.getCompanies(companyName, requestId);
        if (companiesResource.httpStatusCode !== 200 && companiesResource.httpStatusCode !== 201) {
            throw createError(companiesResource.httpStatusCode, companiesResource.httpStatusCode.toString());
        }
        logger.info(`Get company name alphabetical search results, company_name=${companyName}, status_code=${companiesResource.httpStatusCode}`);
        return companiesResource.resource as AlphabeticalCompaniesResource;
    };

export const getDissolvedCompanies =
async (apiKey: string, companyName: string, requestId, searchType: string, page: number): Promise<DissolvedCompaniesResource> => {
    const api = createApiClient(apiKey, undefined, API_URL);
    const startIndexOffset =  page * DISSOLVED_SEARCH_NUMBER_OF_RESULTS - DISSOLVED_SEARCH_NUMBER_OF_RESULTS;
    const companiesResource: Resource<DissolvedCompaniesResource> =
        await api.dissolvedSearch.getCompanies(companyName, requestId, searchType, startIndexOffset);
    if (companiesResource.httpStatusCode !== 200 && companiesResource.httpStatusCode !== 201) {
        throw createError(companiesResource.httpStatusCode, companiesResource.httpStatusCode.toString());
    }
    logger.info(`Get company name dissolved search results, company_name=${companyName}, status_code=${companiesResource.httpStatusCode}`);
    return companiesResource.resource as DissolvedCompaniesResource;
};

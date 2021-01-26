import { createApiClient } from "@companieshouse/api-sdk-node";
import { CompaniesResource, AlphabeticalSearchPostRequest } from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/types";
import { API_URL, APPLICATION_NAME } from "../config/config";
import { createLogger } from "@companieshouse/structured-logging-node";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import createError from "http-errors";

const logger = createLogger(APPLICATION_NAME);

export const getCompanies =
    async (apiKey: string, companyName: AlphabeticalSearchPostRequest, requestId): Promise<CompaniesResource> => {
    const api = createApiClient(apiKey, undefined, API_URL);
    const companiesResource: Resource<CompaniesResource> =
        await api.alphabeticalSearch.getCompanies(companyName, requestId);
    if (companiesResource.httpStatusCode !== 200 && companiesResource.httpStatusCode !== 201) {
        throw createError(companiesResource.httpStatusCode, companiesResource.httpStatusCode.toString());
    }
    logger.info(`Get company name alphabetical search results, company_name=${companyName.company_name}, status_code=${companiesResource.httpStatusCode}`);
    return companiesResource.resource as CompaniesResource;
};

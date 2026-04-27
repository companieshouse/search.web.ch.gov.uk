import { Request, Response } from "express";
import { getDatesFromParams, mapAdvancedSearchParams, mapCompanyResource } from "../utils/utils";
import { getAdvancedCompanies } from "../../client/apiclient";
import { ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD, API_KEY, SEARCH_WEB_COOKIE_NAME } from "../../config/config";
import { AdvancedSearchParams } from "../../model/advanced.search.params";
import Papa from "papaparse";
import Cookies = require("cookies");
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../../config/config";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/advanced-search/types";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";

const logger = createLogger(APPLICATION_NAME);

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const page = 1;
    const { fullDissolvedDates, fullIncorporationDates } = getDatesFromParams(req);

    const advancedSearchParams: AdvancedSearchParams = mapAdvancedSearchParams(page, req.query.companyNameIncludes as string || null, req.query.companyNameExcludes as string || null, req.query.registeredOfficeAddress as string || null,
        fullIncorporationDates.incorporationFromDate || null, fullIncorporationDates.incorporationToDate || null, req.query.sicCodes as string || null, req.query.status as string || null, req.query.type as string || null,
        req.query.subtype as string || null, fullDissolvedDates.dissolvedFromDate || null, fullDissolvedDates.dissolvedToDate || null, ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD);

    const companyResource = await getAdvancedCompanies(API_KEY, advancedSearchParams, (cookies.get(SEARCH_WEB_COOKIE_NAME) as string));
    const companyJson = mapCompanyResource(companyResource);
    const parsedData = Papa.unparse(companyJson);

    res.header("Content-Type", "text/csv");
    res.attachment("Companies-House-search-results.csv");
    return res.send(parsedData);
};

const getCompaniesAsCsv = (startIndex: number | null, companyNameIncludes: string | null, companyNameExcludes: string | null, location: string | null, incorporatedFrom: string | null,
    incorporatedTo: string | null, sicCodes: string | null, companyStatus: string | null, companyType: string | null, companySubtype: string | null, dissolvedFrom: string | null,
    dissolvedTo: string | null, size: number | null, requestId: string): string => {
    const START_INDEX_QUERY = "start_index";
    const COMPANY_NAME_INCLUDES_QUERY = "company_name_includes";
    const COMPANY_NAME_EXCLUDES_QUERY = "company_name_excludes"
    const LOCATION_QUERY = "location";
    const INCORPORATED_FROM_QUERY = "incorporated_from";
    const INCORPORATED_TO_QUERY = "incorporated_to";
    const SIC_CODES_QUERY = "sic_codes";
    const COMPANY_STATUS_QUERY = "company_status";
    const COMPANY_TYPE_QUERY = "company_type";
    const COMPANY_SUBTYPE_QUERY = "company_subtype";
    const DISSOLVED_FROM_QUERY_PARAMETER = "dissolved_from";
    const DISSOLVED_TO_QUERY_PARAMETER = "dissolved_to";
    const SIZE_QUERY_PARAMETER = "size";
    const additionalHeaders = {
        "X-Request-ID": requestId,
        "Content-Type": "application/json"
    }

    const buildAdvancedSearchURL = new URLSearchParams("/advanced-search/csv?");

    if (startIndex !== null) {
        buildAdvancedSearchURL.append(START_INDEX_QUERY, String(startIndex));
    }

    if (companyNameIncludes !== null) {
        buildAdvancedSearchURL.append(COMPANY_NAME_INCLUDES_QUERY, companyNameIncludes)
    }

    if (companyNameExcludes !== null) {
        buildAdvancedSearchURL.append(COMPANY_NAME_EXCLUDES_QUERY, companyNameExcludes)
    }

    if (location !== null) {
        buildAdvancedSearchURL.append(LOCATION_QUERY, location)
    }

    if (incorporatedFrom !== null) {
        buildAdvancedSearchURL.append(INCORPORATED_FROM_QUERY, incorporatedFrom)
    }

    if (incorporatedTo !== null) {
        buildAdvancedSearchURL.append(INCORPORATED_TO_QUERY, incorporatedTo)
    }

    if (sicCodes !== null) {
        buildAdvancedSearchURL.append(SIC_CODES_QUERY, sicCodes)
    }

    if (companyStatus !== null) {
        buildAdvancedSearchURL.append(COMPANY_STATUS_QUERY, companyStatus);
    }

    if (companyType !== null) {
        buildAdvancedSearchURL.append(COMPANY_TYPE_QUERY, companyType)
    }

    if (companySubtype !== null) {
        buildAdvancedSearchURL.append(COMPANY_SUBTYPE_QUERY, companySubtype)
    }

    if (dissolvedFrom !== null) {
        buildAdvancedSearchURL.append(DISSOLVED_FROM_QUERY_PARAMETER, dissolvedFrom)
    }

    if (dissolvedTo !== null) {
        buildAdvancedSearchURL.append(DISSOLVED_TO_QUERY_PARAMETER, dissolvedTo)
    }

    if (size !== null) {
        buildAdvancedSearchURL.append(SIZE_QUERY_PARAMETER, String(size))
    }

    const advancedSearchUrl = buildAdvancedSearchURL.toString();

    const resp = await this.client.httpGet(advancedSearchUrl, additionalHeaders);

    const resource: Resource<CompaniesResource> = {
        httpStatusCode: resp.status
    };

    if (resp.error) {
        return resource.httpStatusCode.toString;
    }


    return resp.body;
}

export default [route];

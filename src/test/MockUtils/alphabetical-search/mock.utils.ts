import { CompaniesResource, Result, Items, Links } from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/types";

export const getDummyCompanyResource = (name?: string): CompaniesResource => {
    return {
        searchType: "searchType",
        topHit: "topHit",
        results: createDummyResults(name)
    };
};

export const getDummyCompanyResourceEmpty = (): CompaniesResource => {
    return {
        searchType: "searchType",
        topHit: "topHit",
        results: []
    };
};

export const createDummyResults = (name?: string): Result[] => {
    const results: Result[] = [createDummyResult(name)];
    return results;
};

export const createDummyResult = (name?: string): Result => {
    return {
        ID: "ID",
        company_type: "company_type",
        items: createDummyItems(name),
        links: createDummyLinks()
    };
};

export const createDummyItems = (name = "Test"): Items => {
    return {
        company_number: "00006400",
        company_status: "active",
        corporate_name: name,
        record_type: "test"
    };
};

export const createDummyLinks = (): Links => {
    return {
        self: "self"
    };
};

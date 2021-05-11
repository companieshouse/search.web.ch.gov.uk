import { CompaniesResource, Result, Items, Links } from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/types";

export const getDummyCompanyResource = (name: string): CompaniesResource => {
    return {
        searchType: "searchType",
        topHit: "companyNameTest41",
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

export const createDummyResults = (name: string): Result[] => {
    const results: Result[] = createArrayDummyResults(name);
    return results;
};

export const createArrayDummyResults = (name: string) : Result[] => {
    const resultsArray: Result[] = [];
    for (let i = 0; i < 82; i++) {
        resultsArray.push({
            ID: "id",
            company_type: "company_type",
            items: {
                company_number: "00006400" + i,
                company_status: "active",
                corporate_name: name + i,
                record_type: "test"
            },
            links: createDummyLinks()
        });
    }
    return resultsArray;
};

export const createDummyLinks = (): Links => {
    return {
        self: "self"
    };
};

import { CompaniesResource, Items, Links, TopHit } from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/types";

export const getDummyCompanyResource = (name: string, alphaKeyWithId: string, topHitOrderedAlphaKeyWithId: string): CompaniesResource => {
    return {
        etag: "etag",
        kind: "searchType",
        top_hit: createTopHit(name, topHitOrderedAlphaKeyWithId),
        items: createDummyResults(name, alphaKeyWithId)
    };
};

export const getDummyCompanyResourceEmpty = (): CompaniesResource => {
    return {
        etag: "etag",
        kind: "searchType",
        top_hit: createEmptyTopHit(),
        items: []
    };
};

export const createDummyResults = (name: string, alphaKeyWithId: string): Items[] => {
    const results: Items[] = createArrayDummyResults(name, alphaKeyWithId);
    return results;
};

export const createArrayDummyResults = (name: string, alphaKeyWithId: string) : Items[] => {
    const itemsArray: Items[] = [];
    for (let i = 0; i < 82; i++) {
        itemsArray.push({

            company_type: "company_type",
            company_number: "00006400" + i,
            company_status: "active",
            company_name: name + i,
            ordered_alpha_key: "alpha key",
            ordered_alpha_key_with_id: `${alphaKeyWithId}${i}`,
            links: createDummyLinks(),
            kind: "kind"
        });
    }
    return itemsArray;
};

export const createDummyLinks = (): Links => {
    return {
        self: "self"
    };
};

export const createTopHit = (name, topHitOrderedAlphaKeyWithId): TopHit => {
    return {
        company_name: name,
        company_number: "0650000",
        company_status: "company status",
        kind: "kind",
        ordered_alpha_key_with_id: topHitOrderedAlphaKeyWithId
    };
};

export const createEmptyTopHit = (): TopHit => {
    return {
        company_name: "",
        company_number: "",
        company_status: "",
        kind: "",
        ordered_alpha_key_with_id: ""
    };
};

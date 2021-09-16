import { Address, CompaniesResource, Items, TopHit } from "@companieshouse/api-sdk-node/dist/services/search/advanced-search/types";

const emptyDate = new Date();

export const getDummyAdvancedCompanyResource = (name: string): CompaniesResource => {
    return {
        etag: "etag",
        items: createDummyItemsArray(name),
        kind: "kind",
        top_hit: createTopHit(name),
        hits: 1
    };
};

export const createDummyItemsArray = (name: string): Items[] => {
    const itemsArray: Items[] = [];
    for (let i = 0; i < 10; i++) {
        itemsArray.push({
            registered_office_address: createAddress(),
            company_name: name + i,
            company_number: "0650000" + i,
            company_status: "company status",
            date_of_cessation: new Date(1991, 11, 12),
            date_of_creation: new Date(1980, 13, 8),
            kind: "kind",
            company_type: "ltd",
            sic_codes: ["8765"],
            links: {
                company_profile: "/065000"
            }
        });
    }
    return itemsArray;
};

export const createAddress = (): Address => {
    return {
        address_line_1: "test house",
        address_line_2: "test street",
        locality: "cardiff",
        postal_code: "cf5 6rb",
        premises: "premises",
        region: "region",
        country: "country"
    };
};

export const createTopHit = (name): TopHit => {
    return {
        registered_office_address: createAddress(),
        company_name: name,
        company_number: "0650000",
        company_status: "company status",
        date_of_cessation: new Date(1991, 11, 12),
        date_of_creation: new Date(1980, 13, 8),
        kind: "kind",
        company_type: "ltd",
        sic_codes: ["8765"],
        links: {
            company_profile: "/065000"
        }
    };
};

export const getEmptyAdvancedDummyCompanyResource = (): CompaniesResource => {
    return {
        etag: "etag",
        items: [],
        kind: "kind",
        top_hit: createEmptyTopHit(),
        hits: 0
    };
};

export const createEmptyTopHit = (): TopHit => {
    return {
        registered_office_address: createEmptyAddress(),
        company_name: "",
        company_number: "",
        company_status: "",
        date_of_cessation: emptyDate,
        date_of_creation: emptyDate,
        kind: "kind",
        company_type: "",
        sic_codes: [""],
        links: {
            company_profile: ""
        }
    };
};

export const createEmptyAddress = (): Address => {
    return {
        address_line_1: "",
        address_line_2: "",
        locality: "",
        postal_code: "",
        premises: "",
        region: "",
        country: ""
    };
};
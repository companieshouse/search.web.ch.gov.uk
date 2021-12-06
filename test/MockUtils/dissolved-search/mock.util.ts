import { Address, CompaniesResource, Items, MatchedPreviousCompanyName, PreviousCompanyNames, TopHit } from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/types";

export const getDummyDissolvedCompanyResource = (name: string, numberOfCompanies: number, numberOfPreviousCompanyNames: number): CompaniesResource => {
    return {
        etag: "etag",
        items: createDummyItemsArray(name, numberOfCompanies, numberOfPreviousCompanyNames),
        kind: "kind",
        top_hit: createTopHit(name, numberOfPreviousCompanyNames),
        hits: numberOfCompanies
    };
};

export const createDummyItemsArray = (name: string, numberOfCompanies: number, numberOfPreviousCompanyNames: number): Items[] => {
    const itemsArray: Items[] = [];
    for (let i = 0; i < numberOfCompanies; i++) {
        itemsArray.push({
            registered_office_address: createAddress(),
            company_name: name + i,
            company_number: "0650000" + i,
            company_status: "company status",
            date_of_cessation: new Date(1991, 11, 12),
            date_of_creation: new Date(1980, 13, 8),
            kind: "kind",
            ordered_alpha_key_with_id: `${name}:${i}`,
            previous_company_names: createPreviousCompanyNameArray(numberOfPreviousCompanyNames),
            matched_previous_company_name: createMatchedPreviousName()
        });
    }
    return itemsArray;
};

export const createAddress = (): Address => {
    return {
        address_line_1: "test house",
        address_line_2: "test street",
        locality: "locality",
        postal_code: "post code"
    };
};

export const createPreviousCompanyNameArray = (numberOfPreviousCompanyNames) => {
    const previousNamesArray: PreviousCompanyNames[] = [];
    for (let i = 0; i < numberOfPreviousCompanyNames; i++) {
        previousNamesArray.push({
            ceased_on: new Date(1999, 11, 12),
            effective_from: new Date(1981, 11, 12),
            name: "name" + i
        });
    }
    return previousNamesArray;
};

export const createMatchedPreviousName = (): MatchedPreviousCompanyName => {
    return {
        ceased_on: new Date(1999, 11, 12),
        effective_from: new Date(1981, 11, 12),
        name: "name"
    };
};

export const createTopHit = (name, numberOfPreviousCompanyNames): TopHit => {
    return {
        registered_office_address: createAddress(),
        company_name: name,
        company_number: "0650000",
        company_status: "company status",
        date_of_cessation: new Date(1991, 11, 12),
        date_of_creation: new Date(1980, 13, 8),
        kind: "kind",
        ordered_alpha_key_with_id: "testcompany:1234",
        previous_company_names: createPreviousCompanyNameArray(numberOfPreviousCompanyNames),
        matched_previous_company_name: createMatchedPreviousName()
    };
};
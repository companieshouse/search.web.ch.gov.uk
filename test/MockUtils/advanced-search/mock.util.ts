import { Address, CompaniesResource, Items, TopHit } from "@companieshouse/api-sdk-node/dist/services/search/advanced-search/types";
import { AdvancedSearchParams } from "../../../src/model/advanced.search.params";
import { format } from 'date-fns';

const emptyDate = new Date();
const addressString = "test house test street cardiff cf5 6rb";

export const getDummyAdvancedCompanyResource = (name: string, numberOfCompanies: number): CompaniesResource => {
    return {
        etag: "etag",
        items: createDummyItemsArray(name, numberOfCompanies),
        kind: "kind",
        top_hit: createTopHit(name),
        hits: numberOfCompanies
    };
};

export const getDummyAdvancedCompanyCsv = (items: Items[]): string => {
    let csv: string = "company_name,company_number,company_status,company_type,company_subtype,dissolution_date,incorporation_date,removed_date,registered_date,nature_of_business,registered_office_address\n";
    for (let i = 0; i < items.length; i++) {
        const line = items[i].company_name + "," + 
            items[i].company_number + "," + 
            items[i].company_status + "," + 
            items[i].company_type + "," + 
            items[i].company_subtype + "," + 
            format(items[i].date_of_cessation, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") + "," + 
            format(items[i].date_of_creation, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") + ",,," + 
            items[i].sic_codes + "," + 
            addressString + "\n";
        csv = csv + line;
    }
    return csv;
};

const formatDate = (date: Date): string => {

    return `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}T${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}Z`;
}

export const createDummyItemsArray = (name: string, numberOfCompanies: number): Items[] => {
    const itemsArray: Items[] = [];
    for (let i = 0; i < numberOfCompanies; i++) {
        itemsArray.push({
            registered_office_address: createAddress(),
            company_name: name + i,
            company_number: "0650000" + i,
            company_status: "Active",
            date_of_cessation: new Date(1991, 11, 12),
            date_of_creation: new Date(1980, 13, 8),
            kind: "kind",
            company_type: "ltd",
            company_subtype: "community-interest-company",
            sic_codes: ["01120"],
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
        company_subtype: "community-interest-company",
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
        company_subtype: "",
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

export const createDummyAdvancedSearchParams = (
    pageParam: string | null,
    companyNameIncludesParam: string | null,
    companyNameExcludesParam: string | null,
    locationParam: string | null,
    incorporatedFromParam: string | null,
    incorporatedToParam: string | null,
    sicCodesParam: string | null,
    companyStatusParam: string | null,
    companyTypeParam: string | null,
    companySubtypeParam: string | null,
    dissolvedFromDayParam: string | null,
    dissolvedFromMonthParam: string | null,
    dissolvedFromYearParam: string | null,
    dissolvedToDayParam: string | null,
    dissolvedToMonthParam: string | null,
    dissolvedToYearParam: string | null,
    sizeParam: number | null): AdvancedSearchParams => {
    const dissolvedFromDate = `${dissolvedFromDayParam}/${dissolvedFromMonthParam}/${dissolvedFromYearParam}`;
    const dissolvedToDate = `${dissolvedToDayParam}/${dissolvedToMonthParam}/${dissolvedToYearParam}`;
    const dummyAdvancedSearchParams: AdvancedSearchParams = {
        page: Number(pageParam),
        companyNameExcludes: companyNameExcludesParam,
        companyNameIncludes: companyNameIncludesParam,
        location: locationParam,
        incorporatedFrom: incorporatedFromParam,
        incorporatedTo: incorporatedToParam,
        sicCodes: sicCodesParam,
        companyStatus: companyStatusParam,
        companyType: companyTypeParam,
        companySubtype: companySubtypeParam,
        dissolvedFrom: dissolvedFromDate,
        dissolvedTo: dissolvedToDate,
        size: sizeParam
    };
    return dummyAdvancedSearchParams;
};

import sinon from "sinon";
import chai from "chai";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/types";
import { CompaniesResource as DissolvedCompanyResource } from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/types";
import { CompaniesResource as AdvancedCompanyResource } from "@companieshouse/api-sdk-node/dist/services/search/advanced-search/types";
import { getCompanies, getDissolvedCompanies, getAdvancedCompanies } from "../../client/apiclient";
import AlphabeticalSearchService from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/service";
import DissolvedSearchService from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/service";
import AdvancedSearchService from "@companieshouse/api-sdk-node/dist/services/search/advanced-search/service";
import { createDummyAdvancedSearchParams } from "../../test/MockUtils/advanced-search/mock.util";
import { AdvancedSearchParams } from "../../model/advanced.search.params";

const mockResponse: Resource<CompaniesResource> = {
    httpStatusCode: 200,
    resource: {
        etag: "etag",
        kind: "searchType",
        top_hit: {
            company_name: "company name",
            company_number: "0000876",
            company_status: "active",
            ordered_alpha_key_with_id: "companyName:0000876",
            kind: "kind"
        },
        items: [
            {
                company_type: "company_type",
                company_number: "00000000",
                company_status: "active",
                company_name: "TEST",
                ordered_alpha_key: "ordered alpha key",
                ordered_alpha_key_with_id: "ordered alpha key:00000000",
                links: {
                    company_profile: "/company_profile/00000000"
                },
                kind: "kind"
            }
        ]
    }
};

const mockDissolvedResponse: Resource<DissolvedCompanyResource> = {
    httpStatusCode: 200,
    resource: {
        etag: "etag",
        items: [
            {
                registered_office_address: {
                    address_line_1: "test house",
                    address_line_2: "test street",
                    locality: "cardiff",
                    postal_code: "cf5 6rb"
                },
                company_name: "test company",
                company_number: "0000789",
                company_status: "active",
                date_of_cessation: (new Date("19910212")),
                date_of_creation: (new Date("19910212")),
                kind: "kind",
                ordered_alpha_key_with_id: "testcompany:1234",
                previous_company_names: [
                    {
                        ceased_on: (new Date("19910212")),
                        effective_from: (new Date("19910212")),
                        name: "old name"
                    }
                ],
                matched_previous_company_name:
                    {
                        ceased_on: (new Date("19910212")),
                        effective_from: (new Date("19910212")),
                        name: "old name"
                    }
            }
        ],
        kind: "kind",
        top_hit: {
            registered_office_address: {
                address_line_1: "test house",
                address_line_2: "test street",
                locality: "cardiff",
                postal_code: "cf5 6rb"
            },
            company_name: "test company",
            company_number: "0000789",
            company_status: "active",
            date_of_cessation: (new Date("19910212")),
            date_of_creation: (new Date("19910212")),
            kind: "kind",
            ordered_alpha_key_with_id: "testcompany:1234",
            previous_company_names: [
                {
                    ceased_on: (new Date("19910212")),
                    effective_from: (new Date("19910212")),
                    name: "old name"
                }
            ],
            matched_previous_company_name:
            {
                ceased_on: (new Date("19910212")),
                effective_from: (new Date("19910212")),
                name: "old name"
            }
        },
        hits: 20
    }
};

const mockAdvancedResponse: Resource<AdvancedCompanyResource> = {
    httpStatusCode: 200,
    resource: {
        etag: "etag",
        items: [
            {
                registered_office_address: {
                    address_line_1: "test house",
                    address_line_2: "test street",
                    locality: "cardiff",
                    postal_code: "cf5 6rb",
                    premises: "premises",
                    region: "region",
                    country: "country"
                },
                company_name: "test company",
                company_number: "0000789",
                company_status: "active",
                company_type: "ltd",
                links: {
                    company_profile: "/company_profile/0000789"
                },
                sic_codes: ["00000"],
                date_of_cessation: (new Date("20100212")),
                date_of_creation: (new Date("20100212")),
                kind: "kind"
            }
        ],
        kind: "kind",
        top_hit: {
            registered_office_address: {
                address_line_1: "test house",
                address_line_2: "test street",
                locality: "cardiff",
                postal_code: "cf5 6rb",
                premises: "premises",
                region: "region",
                country: "country"
            },
            company_name: "test company",
            company_number: "0000789",
            company_status: "active",
            company_type: "ltd",
            links: {
                company_profile: "/company_profile/0000789"
            },
            sic_codes: ["00000"],
            date_of_cessation: (new Date("20100212")),
            date_of_creation: (new Date("20100212")),
            kind: "kind"
        },
        hits: 20
    }
};

const mockRequestID: string = "ID";
const hits: number = 20;

const sandbox = sinon.createSandbox();

describe("api.client", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("alphabetical search", () => {
        it("GET returns alphabetical search results", async () => {
            sandbox.stub(AlphabeticalSearchService.prototype, "getCompanies")
                .returns(Promise.resolve(mockResponse));

            const alphabeticalSearchResults = await getCompanies("api key", "TEST COMPANY NAME", mockRequestID, null, null, null);
            chai.expect(alphabeticalSearchResults).to.equal(mockResponse.resource);
        });
    });

    describe("dissolved search", () => {
        it("GET returns alphabetical search results", async () => {
            sandbox.stub(DissolvedSearchService.prototype, "getCompanies")
                .returns(Promise.resolve(mockDissolvedResponse));

            const dissolvedAlphabeticalSearchResults = await getDissolvedCompanies("api key", "test company", mockRequestID, "alphabetical", 1, "testcompany:1234", null, 20);
            chai.expect(dissolvedAlphabeticalSearchResults).to.equal(mockDissolvedResponse.resource);
        });

        it("GET returns best match search results, this is the default search option for dissolved", async () => {
            sandbox.stub(DissolvedSearchService.prototype, "getCompanies")
                .returns(Promise.resolve(mockDissolvedResponse));

            const dissolvedAlphabeticalSearchResults = await getDissolvedCompanies("api key", "test company", mockRequestID, "", 1, "testcompany:1234", null, 20);
            chai.expect(dissolvedAlphabeticalSearchResults).to.equal(mockDissolvedResponse.resource);
        });
    });

    describe("advanced search", () => {
        it("GET returns advanced search results", async () => {
            sandbox.stub(AdvancedSearchService.prototype, "getCompanies")
                .returns(Promise.resolve(mockAdvancedResponse));

            const searchParams: AdvancedSearchParams = createDummyAdvancedSearchParams("1", "testCompanyNameIncludes", "testCompanyNameExcludes", "testLocation", "01/01/2000",
                "01/01/2001", "07210", "active", "ltd", "01/10/2010", "01/03/2010", 20);

            const advancedSearchResults = await getAdvancedCompanies("api key", searchParams, "request id");
            chai.expect(advancedSearchResults).to.equal(mockAdvancedResponse.resource);
        });
    });
});

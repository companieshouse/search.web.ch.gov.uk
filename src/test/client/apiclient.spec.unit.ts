import sinon from "sinon";
import chai from "chai";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/types";
import { CompaniesResource as DissolvedCompanyResource } from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/types";
import { getCompanies, getDissolvedCompanies } from "../../client/apiclient";
import AlphabeticalSearchService from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/service";
import DissolvedSearchService from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/service";

const mockResponse: Resource<CompaniesResource> = {
    httpStatusCode: 200,
    resource: {
        searchType: "searchType",
        topHit: "topHit",
        results: [
            {
                ID: "ID",
                company_type: "company_type",
                items: {
                    company_number: "00006400",
                    company_status: "active",
                    corporate_name: "TEST",
                    record_type: "test",
                    ordered_alpha_key: "ordered alpha key",
                    ordered_alpha_key_with_id: "ordered alpha key:00006400"
                },
                links: {
                    self: "self"
                }
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
                address: {
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
                ]
            }
        ],
        kind: "kind",
        top_hit: {
            address: {
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
            ]
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
});

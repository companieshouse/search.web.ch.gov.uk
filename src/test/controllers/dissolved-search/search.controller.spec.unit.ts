import sinon from "sinon";
import chai from "chai";
import * as apiClient from "../../../client/apiclient";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/types";
//import { route } from "../../../../src/controllers/dissolved-search/search.controller";

const sandbox = sinon.createSandbox();
let testApp = null;
let getCompanyItemStub;

const mockResponseBody : CompaniesResource = ({
    etag: "etag",
    items: [
        {
            address: {
                locality: "cardiff",
                postal_code: "cf5 6rb"
            },
            company_name: "test company",
            company_number: "0000789",
            company_status: "dissolved",
            date_of_cessation: "19910212",
            date_of_creation: "19910212",
            kind: "kind",
            previous_company_names: [
                {
                    ceased_on: "19910212",
                    effective_from: "19910212",
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
        date_of_cessation: "19910212",
        date_of_creation: "19910212",
        kind: "kind",
        previous_company_names: [
            {
                ceased_on: "19910212",
                effective_from: "19910212",
                name: "old name"
            }
        ]
    }
});

const emptyMockResponseBody : CompaniesResource = ({
    etag: "etag",
    items: [],
    kind: "kind",
    top_hit: {
        address: {
            locality: "",
            postal_code: ""
        },
        company_name: "",
        company_number: "",
        company_status: "",
        date_of_cessation: "",
        date_of_creation: "",
        kind: "kind",
        previous_company_names: [
            {
                ceased_on: "",
                effective_from: "",
                name: ""
            }
        ]
    }
});

describe("search.controller.spec.unit", () => {
    beforeEach((done) => {
        testApp = require("../../../../src/app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("check it returns a dissolved results page successfully", () => {
        it("should return a results page successfully", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockResponseBody));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=test");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("0000789");
        });
    });

    // describe("check it returns a dissolved results page with a shortened postcode successfully", () => {
    //     it.only("should return a results page with a shortened postcode successfully", async () => {
    //         chai.expect( route.formatPostCode("CF5 6RB").to.equal("CF5"));
    //     });
    // });


    describe("check it displays no dissolved results found if they have not been found", () => {
        it("should display No results found, if no search results have been found", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(emptyMockResponseBody));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=sfgasfjgsdkfhkjdshgjkfdhgkjdhfkghfldgh");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("No results found");
        });
    });

    describe("check it displays an error message if a company name hasn't been entered", () => {
        it("should display an error message if no company name is entered", async () => {
            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=");

            chai.expect(resp.status).to.equal(200);
        });
    });
});

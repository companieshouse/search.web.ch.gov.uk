import * as mockUtils from "../../MockUtils/dissolved-search/mock.util";
import sinon from "sinon";
import chai from "chai";
import ioredis from "ioredis";
import * as apiClient from "../../../client/apiclient";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/types";
import { formatDate, sanitiseCompanyName, generateROAddress, determineReportAvailableBool } from "../../../controllers/utils";
import { signedInSession, SIGNED_IN_COOKIE } from "../../MockUtils/redis.mocks";

const sandbox = sinon.createSandbox();
let testApp = null;
let getCompanyItemStub;
const cessationDate = new Date(1991, 11, 12);
const creationDate = new Date(1991, 11, 12);
const emptyDate = new Date();

const mockResponseBody : CompaniesResource = ({
    etag: "etag",
    hits: 20,
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
            company_status: "dissolved",
            date_of_cessation: cessationDate,
            date_of_creation: creationDate,
            kind: "kind",
            ordered_alpha_key_with_id: "testcompany:1234",
            previous_company_names: [
                {
                    ceased_on: cessationDate,
                    effective_from: creationDate,
                    name: "old name"
                }
            ],
            matched_previous_company_name: {
                ceased_on: cessationDate,
                effective_from: creationDate,
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
        date_of_cessation: cessationDate,
        date_of_creation: creationDate,
        kind: "kind",
        ordered_alpha_key_with_id: "testcompany:1234",
        previous_company_names: [
            {
                ceased_on: cessationDate,
                effective_from: creationDate,
                name: "old name"
            }
        ],
        matched_previous_company_name: {
            ceased_on: cessationDate,
            effective_from: creationDate,
            name: "old name"
        }
    }
});

const emptyMockResponseBody : CompaniesResource = ({
    etag: "etag",
    items: [],
    kind: "kind",
    hits: 20,
    top_hit: {
        registered_office_address: {
            address_line_1: "",
            address_line_2: "",
            locality: "",
            postal_code: ""
        },
        company_name: "",
        company_number: "",
        company_status: "",
        date_of_cessation: emptyDate,
        date_of_creation: emptyDate,
        kind: "kind",
        ordered_alpha_key_with_id: "",
        previous_company_names: [
            {
                ceased_on: emptyDate,
                effective_from: emptyDate,
                name: ""
            }
        ],
        matched_previous_company_name: {
            ceased_on: emptyDate,
            effective_from: emptyDate,
            name: ""
        }
    }
});

describe("search.controller.spec.unit", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));
        testApp = require("../../../../src/app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("best match search - check it returns a dissolved results page successfully", () => {
        it("should return a results page successfully without the top hit having the css class 'nearest'", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockResponseBody));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=test");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("0000789");
            chai.expect(resp.text).to.not.contain("nearest");
        });
    });

    describe("check it returns a dissolved results page with an address if available", () => {
        it("should return a results page with the RO address", () => {
            chai.expect(generateROAddress(mockResponseBody.top_hit.registered_office_address)).to.contain("test house");
        });
    });

    describe("check it returns a dissolved results page with the address showing not available", () => {
        it("should return a results page with the RO address showing Not available", () => {
            chai.expect(generateROAddress(undefined)).to.contain("Not available");
        });
    });

    describe("check it returns a dissolved results page with a blank date field when date is not present", () => {
        it("should return a results page with a correct date format", () => {
            chai.expect(formatDate(undefined)).to.contain("");
        });
    });

    describe("check it returns a dissolved results page with a the date in DD Jan YYYY format for both columns", () => {
        it("should return a results page with a correct date format", () => {
            const newDate = "1990-01-25";

            chai.expect(formatDate(newDate)).to.contain("25 Jan 1990");
        });
    });

    describe("check it returns a dissolved results page with a the date in DD Feb YYYY format for both columns", () => {
        it("should return a results page with a correct date format", () => {
            const date = "1990-02-25";

            chai.expect(formatDate(date)).to.contain("25 Feb 1990");
        });
    });

    describe("check it returns a dissolved results page with a the date in DD Mar YYYY format for both columns", () => {
        it("should return a results page with a correct date format", () => {
            const date = "1990-03-25";

            chai.expect(formatDate(date)).to.contain("25 Mar 1990");
        });
    });

    describe("check it returns a dissolved results page with a the date in DD Apr YYYY format for both columns", () => {
        it("should return a results page with a correct date format", () => {
            const date = "1990-04-25";

            chai.expect(formatDate(date)).to.contain("25 Apr 1990");
        });
    });

    describe("check it returns a dissolved results page with a the date in DD May YYYY format for both columns", () => {
        it("should return a results page with a correct date format", () => {
            const date = "1990-05-25";

            chai.expect(formatDate(date)).to.contain("25 May 1990");
        });
    });

    describe("check it returns a dissolved results page with a the date in DD Jun YYYY format for both columns", () => {
        it("should return a results page with a correct date format", () => {
            const date = "1990-06-25";

            chai.expect(formatDate(date)).to.contain("25 Jun 1990");
        });
    });

    describe("check it returns a dissolved results page with a the date in DD Jul YYYY format for both columns", () => {
        it("should return a results page with a correct date format", () => {
            const date = "1990-07-25";

            chai.expect(formatDate(date)).to.contain("25 Jul 1990");
        });
    });

    describe("check it returns a dissolved results page with a the date in DD Aug YYYY format for both columns", () => {
        it("should return a results page with a correct date format", () => {
            const date = "1990-08-25";

            chai.expect(formatDate(date)).to.contain("25 Aug 1990");
        });
    });

    describe("check it returns a dissolved results page with a the date in DD Sep YYYY format for both columns", () => {
        it("should return a results page with a correct date format", () => {
            const date = "1990-09-25";

            chai.expect(formatDate(date)).to.contain("25 Sep 1990");
        });
    });

    describe("check it returns a dissolved results page with a the date in DD Oct YYYY format for both columns", () => {
        it("should return a results page with a correct date format", () => {
            const date = "1990-10-25";

            chai.expect(formatDate(date)).to.contain("25 Oct 1990");
        });
    });

    describe("check it returns a dissolved results page with a the date in DD Nov YYYY format for both columns", () => {
        it("should return a results page with a correct date format", () => {
            const date = "1994-11-25";

            chai.expect(formatDate(date)).to.contain("25 Nov 1994");
        });
    });

    describe("check it returns a dissolved results page with a the date in DD Dec YYYY format for both columns", () => {
        it("should return a results page with a correct date format", () => {
            const date = "1990-12-25";

            chai.expect(formatDate(date)).to.contain("25 Dec 1990");
        });
    });

    describe("check it returns a dissolved results page with a the date in DD MM YYYY format for both columns", () => {
        it("should return a results page with a correct date format if it can't workout the month", () => {
            const date: string = "1990-00-25";

            chai.expect(formatDate(date)).to.contain("25 00 1990");
        });
    });

    describe("check it displays no dissolved results found if they have not been found", () => {
        it("should display No results found, if no search results have been found", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(emptyMockResponseBody));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=sfgasfjgsdkfhkjdshgjkfdhgkjdhfkghfldgh");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("No results found");
            chai.expect(resp.text).to.not.contain("nearest");
        });
    });

    describe("check it escapes any HTML tags that are embeeded in the text", () => {
        it("should escape any HTML tags that are embedded in the text", async () => {
            const companyName = "<I>company_name</I>";

            chai.expect(sanitiseCompanyName(companyName)).to.contain("&lt;I&gt;company_name&lt;/I&gt;");
        });
    });

    describe("check the index page refreshes if no search is entered", () => {
        it("should refresh when no input and company name when it was dissolved is selected", async () => {
            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=&changedName=name-at-dissolution");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Search for a dissolved company");
        });

        it("should refresh when no input and previous company names is selected", async () => {
            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=&changedName=previousNameDissolved");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Search for a dissolved company");
        });

        it("should refresh when no input and company name when it was dissolved and show results alphabetically are selected ", async () => {
            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=&searchType=alphabetical&changedName=name-at-dissolution");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Search for a dissolved company");
        });
    });

    describe("check best match name at dissolution pagination ", () => {
        /*
        it("should display the correct number of page links - 50 results = 3 pages", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 50, 2)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=testo&changedName=name-at-dissolution&page=0");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("page-3");
            chai.expect(resp.text).to.not.contain("page-4");
        });
        */

        it("should check that the correct css class is assigned to the current page", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 50, 2)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=testo&changedName=name-at-dissolution&page=1");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<span class=\"active\">1</span>");
        });

        it("should show the previous and next links if on any middle page", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 80, 2)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=testo&changedName=name-at-dissolution&page=2");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Previous");
            chai.expect(resp.text).to.contain("Next");
        });

        it("should not show the previous link if on the 1st page", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 50, 2)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=testo&changedName=name-at-dissolution&page=0");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("Previous");
        });

        it("should not show the next link if on the last page", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 50, 2)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=testo&changedName=name-at-dissolution&page=3");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("Next");
        });
    });

    describe("check best match name at dissolution previous names pagination ", () => {
        /*
        it("should display the correct number of page links - 50 results = 3 pages", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 50, 50)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=testo&changedName=previousNameDissolved&page=0");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("page-3");
            chai.expect(resp.text).to.not.contain("page-4");
        });

        it("should check that the correct css class is assigned to the current page", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 50, 50)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=testo&changedName=previousNameDissolved&page=1");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<span class=\"active\">1</span>");
        });
        */

        it("should show the previous and next links if on any middle page", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 50, 50)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=testo&changedName=previousNameDissolved&page=2");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Previous");
            chai.expect(resp.text).to.contain("Next");
        });

        it("should not show the previous link if on the 1st page", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 50, 50)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=testo&changedName=previousNameDissolved&page=0");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("previous-page");
        });

        it("should not show the next link if on the last page", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 50, 50)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=testo&changedName=previousNameDissolved&page=3");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("Next");
        });
    });

    describe("check it displays an error message if a company name hasn't been entered", () => {
        it("should display an error message if no company name is entered", async () => {
            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("nearest");
        });
    });

    describe("check it renders the previous name results page when previous names is selected", () => {
        it("should render the previous name results page", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockResponseBody));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=company&changedName=previousNameDissolved");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("nearest");
        });
    });

    describe("check it displays alphabetical search results when checkbox for alphabetical is ticked", () => {
        it("should return a results page successfully with the top hit having a css class 'nearest'", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockResponseBody));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=company&searchType=alphabetical");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("0000789");
            chai.expect(resp.text).to.contain("nearest");
        });
    });

    describe("check it displays paging when the search type is alphabetical and the changed name is name-at-dissolution", () => {
        it("should return previous and next links if the search type is alphabetical and the changed name is name-at-dissolution", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockResponseBody));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=company&searchType=alphabetical&changedName=name-at-dissolution");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("previousLink");
            chai.expect(resp.text).to.contain("nextLink");
        });
    });

    describe("check that a size parameter has no effect on the results being returned for dissolved searches", () => {
        it("check that a size parameter has no effect on the results being returned for alphabetical name at dissolution", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 50, 50)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=testo&searchType=alphabetical&changedName=name-at-dissolution&size=400");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("065000030");
            chai.expect(resp.text).to.not.contain("0650000350");
        });

        it("check that a size parameter has no effect on the results being returned for previous names", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 50, 50)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=company&changedName=previousNameDissolved&size=200");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("065000030");
            chai.expect(resp.text).to.not.contain("0650000199");
        });

        it("check that a size parameter has no effect on the results being returned for name at dissolution", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 50, 50)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=company&changedName=name-at-dissolution&size=200");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("065000030");
            chai.expect(resp.text).to.not.contain("0650000199");
        });

        describe("check it returns a url is the company has been dissolved less than 20 years", () => {
            it("should return a url for companies less than 20 years", () => {
                const companyNumber = "00000000";
                const date = "2010";

                chai.expect(determineReportAvailableBool(companyNumber, date)).to.equal(true);
            });
        });

        describe("check it does not return a url if the company is a branch", () => {
            it("should return a url for companies less than 20 years", () => {
                const companyNumber = "BR000000";
                const date = "2010";

                chai.expect(determineReportAvailableBool(companyNumber, date)).to.equal(false);
            });
        });

        describe("check it does not return a url is the company has been dissolved more than 20 years", () => {
            it("should not return a url for companies more than 20 years", () => {
                const companyNumber = "00000000";
                const date = "1990";

                chai.expect(determineReportAvailableBool(companyNumber, date)).to.equal(false);
            });
        });
    });

    describe("check the download reports uris match the company number of the selected company", () => {
        it("should return the correct company number in download uri for 5 company results being returned", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 5, 0)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=company&searchType=alphabetical&changedName=name-at-dissolution")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`data-resource-url="/dissolved-company-number/06500000`);
            chai.expect(resp.text).to.contain(`data-resource-url="/dissolved-company-number/06500004`);
            chai.expect(resp.text).to.not.contain(`data-resource-url="/dissolved-company-number/06500005`);
        });
    });
});

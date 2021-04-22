import sinon from "sinon";
import chai from "chai";
import * as apiClient from "../../../client/apiclient";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/types";
import { formatPostCode, formatDate, sanitiseCompanyName } from "../../../controllers/utils";

const sandbox = sinon.createSandbox();
let testApp = null;
let getCompanyItemStub;
const cessationDate = new Date(1991, 11, 12);
const creationDate = new Date(1991, 11, 12);
const emptyDate = new Date();

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
            date_of_cessation: cessationDate,
            date_of_creation: creationDate,
            kind: "kind",
            previous_company_names: [
                {
                    ceased_on: cessationDate,
                    effective_from: creationDate,
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
        date_of_cessation: cessationDate,
        date_of_creation: creationDate,
        kind: "kind",
        previous_company_names: [
            {
                ceased_on: cessationDate,
                effective_from: creationDate,
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
        date_of_cessation: emptyDate,
        date_of_creation: emptyDate,
        kind: "kind",
        previous_company_names: [
            {
                ceased_on: emptyDate,
                effective_from: emptyDate,
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

    describe("check it returns a dissolved results page with a shortened postcode successfully when the postcode has a space", () => {
        it("should return a results page with a shortened postcode successfully", () => {
            const postCode: string = "CF5 6RB";

            chai.expect(formatPostCode(postCode)).to.contain("CF5");
        });
    });

    describe("check it returns a dissolved results page with a shortened postcode successfully when the postcode has no space", () => {
        it("should return a results page with a shortened postcode successfully", () => {
            const postCode: string = "CF56RB";

            chai.expect(formatPostCode(postCode)).to.contain("CF56");
        });
    });

    describe("check it returns a dissolved results page with a shortened postcode successfully when the postcode has a space in an odd place space", () => {
        it("should return a results page with a shortened postcode successfully", () => {
            const postCode: string = "CF56R B";

            chai.expect(formatPostCode(postCode)).to.contain("CF56");
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
            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=test&changedName=previousNameDissolved");

            chai.expect(resp.status).to.equal(200);
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
});

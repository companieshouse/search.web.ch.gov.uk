import * as mockUtils from "../../MockUtils/alphabetical-search/mock.utils";
import sinon from "sinon";
import chai from "chai";
import cheerio from "cheerio";
import * as apiClient from "../../../client/apiclient";

const sandbox = sinon.createSandbox();
let testApp = null;
let getCompanyItemStub;

describe("search.controller.spec.unit", () => {
    beforeEach((done) => {
        testApp = require("../../../../src/app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("check it returns a results page successfully", () => {
        it("should return a results page successfully", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getCompanies")
                .returns(Promise.resolve(mockUtils.getDummyCompanyResource("nab")));

            const resp = await chai.request(testApp)
                .get("/alphabetical-search/get-results?companyName=nab");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("00006400");
        });
    });

    describe("check it escapes any HTML tags that are embeeded in the text", () => {
        it("should escape any HTML tags that are embedded in the text", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getCompanies")
                .returns(Promise.resolve(mockUtils.getDummyCompanyResource("<I>company_name</I>")));

            const resp = await chai.request(testApp)
                .get("/alphabetical-search/get-results?companyName=nab");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("00006400");
            chai.expect(resp.text).to.contain("&lt;I&gt;company_name&lt;/I&gt;");
        });
    });

    describe("check previous and next urls have the correct links being created from the results array", () => {
        it("check previous and next urls have the correct links being created from the results array", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getCompanies")
                .returns(Promise.resolve(mockUtils.getDummyCompanyResource("nab")));

            const resp = await chai.request(testApp)
                .get("/alphabetical-search/get-results?companyName=nab");

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("#previousLink").attr("href")).to.include("nab0");
            chai.expect($("#nextLink").attr("href")).to.include("nab81");
        });
    });

    describe("check that the searched term result is only highlighted using pagination", () => {
        it("check the search term is highlighted", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getCompanies")
                .returns(Promise.resolve(mockUtils.getDummyCompanyResource("companyNameTest")));

            const resp = await chai.request(testApp)
                .get("/alphabetical-search/get-results?companyName=companyNameTest&originalCompanyNumber=0000640041");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("nearest");
        });

        it("check the no result is highlighted on screen", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getCompanies")
                .returns(Promise.resolve(mockUtils.getDummyCompanyResource("companyNameTest")));

            const resp = await chai.request(testApp)
                .get("/alphabetical-search/get-results?companyName=companyNameTest&originalCompanyNumber=0000540041");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("nearest");
        });
    });

    describe("check it displays not results found if they have not been found", () => {
        it("should display No results found, if no search results have been found", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getCompanies")
                .returns(Promise.resolve(mockUtils.getDummyCompanyResourceEmpty()));

            const resp = await chai.request(testApp)
                .get("/alphabetical-search/get-results?companyName=sfgasfjgsdkfhkjdshgjkfdhgkjdhfkghfldgh");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("No results found");
        });
    });

    describe("check it displays an error message if a company name hasn't been entered", () => {
        it("should display an error message if no company name is entered", async () => {
            const resp = await chai.request(testApp)
                .get("/alphabetical-search/get-results?companyName=");

            chai.expect(resp.status).to.equal(200);
        });
    });
});

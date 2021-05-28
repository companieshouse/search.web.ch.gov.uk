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
                .returns(Promise.resolve(mockUtils.getDummyCompanyResource("nab", "nabAlphaKey", "topHitNabAlphaKey")));

            const resp = await chai.request(testApp)
                .get("/alphabetical-search/get-results?companyName=nab");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("00006400");
        });
    });

    describe("check it escapes any HTML tags that are embeeded in the text", () => {
        it("should escape any HTML tags that are embedded in the text", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getCompanies")
                .returns(Promise.resolve(mockUtils.getDummyCompanyResource("<I>company_name</I>", "nabAlphaKey", "topHitNabAlphaKey")));

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
                .returns(Promise.resolve(mockUtils.getDummyCompanyResource("nab", "nabAlphaKey", "topHitNabAlphaKey")));

            const resp = await chai.request(testApp)
                .get("/alphabetical-search/get-results?companyName=nab");

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("#previousLink").attr("href")).to.include("get-results?companyName=nab&searchBefore=nabAlphaKey0");
            chai.expect($("#nextLink").attr("href")).to.include("get-results?companyName=nab&searchAfter=nabAlphaKey81");
        });
    });

    describe("check that the searched term result is only highlighted using pagination", () => {
        it("check the top_hit search term is highlighted", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getCompanies")
                .returns(Promise.resolve(mockUtils.getDummyCompanyResource("companyNameTest", "testcompany:0650019", "testcompany:065001941")));

            const resp = await chai.request(testApp)
                .get("/alphabetical-search/get-results?companyName=companyNameTest");

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("nearest");
            chai.expect($(".nearest").text()).to.equal("companyNameTest41");
        });

        it("check that no result is highlighted on screen when moving away from the top_hit screen", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getCompanies")
                .returns(Promise.resolve(mockUtils.getDummyCompanyResource("companyNameTest", "companyAlphaKeyWithId5000", "topHitCompanyAlphaKeyWithId5000")));

            const resp = await chai.request(testApp)
                .get("/alphabetical-search/get-results?companyName=companyNameTest");

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

    describe("check it displays the top_hit if the search top_hit is at the start or end of index and highlight correct element", () => {
        it("should display the top_hit if at the start of index and highlight the 1st element", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getCompanies")
                .returns(Promise.resolve(mockUtils.getDummyCompanyResource("nab", "nabAlphaKeyWithId", "nabAlphaKeyWithId0")));

            const resp = await chai.request(testApp)
                .get("/alphabetical-search/get-results?companyName=nab");

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("nab20");
            chai.expect($(".nearest").text()).to.equal("nab0");
        });

        it("should display the top_hit companies if at the end of index and highlight the last element", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getCompanies")
                .returns(Promise.resolve(mockUtils.getDummyCompanyResource("nab", "nabAlphaKeyWithId", "nabAlphaKeyWithId81")));

            const resp = await chai.request(testApp)
                .get("/alphabetical-search/get-results?companyName=nab81");

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("nab61");
            chai.expect($(".nearest").text()).to.equal("nab81");
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

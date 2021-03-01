import * as mockUtils from "../../mock.utils";
import sinon from "sinon";
import chai from "chai";
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
                .returns(Promise.resolve(mockUtils.getDummyCompanyResource()));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=nab");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("test updated message");
            chai.expect(resp.text).to.contain("00006400");
        });
    });

    describe("check it escapes any HTML tags that are embeeded in the text", () => {
        it("should escape any HTML tags that are embedded in the text", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getCompanies")
                .returns(Promise.resolve(mockUtils.getDummyCompanyResource("<I>company_name</I>")));

            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=nab");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("00006400");
            chai.expect(resp.text).to.contain("&lt;I&gt;company_name&lt;/I&gt;");
        });
    });

    describe("check it displays no results found if they have not been found", () => {
        it("should display No results found, if no search results have been found", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getCompanies")
                .returns(Promise.resolve(mockUtils.getDummyCompanyResourceEmpty()));

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

import sinon, { mock } from "sinon";
import chai from "chai";
import ioredis from "ioredis";
import * as mockUtils from "../../MockUtils/advanced-search/mock.util";
import * as apiClient from "../../../client/apiclient";
import { signedInSession } from "../../MockUtils/redis.mocks";

const sandbox = sinon.createSandbox();
let testApp = null;
let getCompanyItemStub;

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

    describe("check it returns a results page successfully", () => {
        it("should return a results page successfully", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test")));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("test");
        });
    });

    describe("check it displays multiple results", () => {
        it("should return and display multiple results", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test")));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("test");
            chai.expect(resp.text).to.contain("test9");
        });
    });

    describe("check it displays no results found if they have not been found", () => {
        it("should display No results found, if no search results have been found", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getEmptyAdvancedDummyCompanyResource()));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=asdasdasdadsadqwdsdvsd&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("No results found");
        });
    });

    describe("check search results company information is present", () => {
        it("company name should display and link should link to the company profile", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test")));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<a class=\"govuk-link\" href=/065000 target=\"_blank\">test1<span class=\"govuk-visually-hidden\">(link opens a new window)</span></a>");
        });

        it("should show the company status", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test")));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Active");
        });

        it("should show the company type", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test")));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Private limited company");
        });

        it("should show the company number", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test")));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("0650000");
        });
    });

    describe("check form values on results page", () => {
        it("should display the search terms in the relevant search fields", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test")));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=testCompanyNameContains&excludesCompanyName=testCompanyNameExcludes");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<input class='govuk-input govuk-!-width-width-full' id='companyNameIncludes' name='companyNameIncludes'");
            chai.expect(resp.text).to.contain("<input class='govuk-input govuk-!-width-width-full' id='companyNameExcludes' name='companyNameExcludes'");
        });
    });
});

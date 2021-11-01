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
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("test");
        });
    });

    describe("check it displays multiple results", () => {
        it("should return and display multiple results", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

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
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<a class=\"govuk-link\" href=/065000 target=\"_blank\">test1<span class=\"govuk-visually-hidden\">(link opens a new window)</span></a>");
        });

        it("should show the company status", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Active");
        });

        it("should show the company type", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Private limited company");
        });

        it("should show the company number", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("0650000");
        });

        it("should show the incorporation date", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");
            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("- Incorporated on 8 February 1981");
        });

        it("should show the dissolution date", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");
            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Dissolved on 12 December 1991");
        });

        it("should show the address", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("premises, test house, test street, cardiff, region, country cf5 6rb");
        });

        it("should show sic codes", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("SIC codes - 8765");
        });
    });

    describe("check form values on results page", () => {
        it("should display the company name search terms in the relevant search fields", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test1+test2&companyNameExcludes=test3+test4");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<input class='govuk-input govuk-!-width-width-full' id='companyNameIncludes' name='companyNameIncludes' type='text' value='test1 test2'");
            chai.expect(resp.text).to.contain("<input class='govuk-input govuk-!-width-width-full' id='companyNameExcludes' name='companyNameExcludes' type='text' value='test3 test4'");
        });

        it("should display the registered office address search term in the relevant search field", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=tesco&companyNameExcludes=&registeredOfficeAddress=london");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<input class='govuk-input govuk-!-width-width-full' id='registeredOfficeAddress' name='registeredOfficeAddress' type='text' value='london'>");
        });
    });

    describe("check that the configurable message is displayed", () => {
        it("should display the last updated message", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("test last updated message");
        });
    });

    describe("check that the validation of incorporation dates displays the correct error message", () => {
        it("should display an error if incorporatedFrom is separated by hyphens", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=&incorporatedFrom=01-01-2009");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`<a href="#incorporatedFrom">Incorporation date must include a day, a month and a year</a>`);
            chai.expect(resp.text).to.contain("<input class='govuk-input govuk-!-width-width-full govuk-input--error' id='incorporatedFrom' name='incorporatedFrom' type='text' value='01-01-2009' aria-describedby='incorporatedFrom-error'>");
        });
        it("should display an error if incorporatedFrom is yyyy/mm/dd format", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=&incorporatedFrom=2009/01/01");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`<a href="#incorporatedFrom">Incorporation date must include a day, a month and a year</a>`);
            chai.expect(resp.text).to.contain("<input class='govuk-input govuk-!-width-width-full govuk-input--error' id='incorporatedFrom' name='incorporatedFrom' type='text' value='2009/01/01' aria-describedby='incorporatedFrom-error'>");
        });
        it("should display an error if incorporatedFrom is mm/yyyy format", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=&incorporatedFrom=01/2009");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`<a href="#incorporatedFrom">Incorporation date must include a day, a month and a year</a>`);
            chai.expect(resp.text).to.contain("<input class='govuk-input govuk-!-width-width-full govuk-input--error' id='incorporatedFrom' name='incorporatedFrom' type='text' value='01/2009' aria-describedby='incorporatedFrom-error'>");
        });
        it("should not display an error if incorporatedFrom is in the correct format", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=&incorporatedFrom=01/01/2009");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<input class='govuk-input govuk-!-width-width-full' id='incorporatedFrom' name='incorporatedFrom' type='text' value='01/01/2009'>");
        });
        it("should display an error if incorporatedTo is separated by hyphens", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=&incorporatedTo=01-01-2009");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`<a href="#incorporatedTo">Incorporation date must include a day, a month and a year</a>`);
            chai.expect(resp.text).to.contain("<input class='govuk-input govuk-!-width-width-full govuk-input--error' id='incorporatedTo' name='incorporatedTo' type='text' value='01-01-2009' aria-describedby='incorporatedTo-error'>");
        });
        it("should display an error if incorporatedTo is yyyy/mm/dd format", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=&incorporatedTo=2009/01/01");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`<a href="#incorporatedTo">Incorporation date must include a day, a month and a year</a>`);
            chai.expect(resp.text).to.contain("<input class='govuk-input govuk-!-width-width-full govuk-input--error' id='incorporatedTo' name='incorporatedTo' type='text' value='2009/01/01' aria-describedby='incorporatedTo-error'>");
        });
        it("should display an error if incorporatedTo is mm/yyyy format", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=&incorporatedTo=01/2009");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`<a href="#incorporatedTo">Incorporation date must include a day, a month and a year</a>`);
            chai.expect(resp.text).to.contain("<input class='govuk-input govuk-!-width-width-full govuk-input--error' id='incorporatedTo' name='incorporatedTo' type='text' value='01/2009' aria-describedby='incorporatedTo-error'>");
        });
        it("should not display an error if incorporatedTo is in the correct format", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=&incorporatedTo=01/01/2009");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<input class='govuk-input govuk-!-width-width-full' id='incorporatedTo' name='incorporatedTo' type='text' value='01/01/2009'>");
        });
        it("should display an error if incorporatedFrom is a later date than incorporatedTo", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=&incorporatedTo=01/01/2009&incorporatedFrom=01/01/2010");
            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`<a href="#incorporatedFrom">The &#39;Companies incorporated before&#39; date must be after the &#39;Companies incorporated after&#39; date</a>`);
            chai.expect(resp.text).to.contain(`<a href="#incorporatedTo">The &#39;Companies incorporated before&#39; date must be after the &#39;Companies incorporated after&#39; date</a>`);
            chai.expect(resp.text).to.contain(`<span id="incorporatedFrom-error" class="govuk-error-message">`);
            chai.expect(resp.text).to.contain(`<span id="incorporatedTo-error" class="govuk-error-message">`);
        });
        it("should display an error if incorporatedFrom is a later date than incorporatedTo", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=&incorporatedFrom=01/01/2010&incorporatedTo=01/01/2009");
            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`<a href="#incorporatedFrom">The &#39;Companies incorporated before&#39; date must be after the &#39;Companies incorporated after&#39; date</a>`);
            chai.expect(resp.text).to.contain(`<a href="#incorporatedTo">The &#39;Companies incorporated before&#39; date must be after the &#39;Companies incorporated after&#39; date</a>`);
            chai.expect(resp.text).to.contain(`<span id="incorporatedFrom-error" class="govuk-error-message">`);
            chai.expect(resp.text).to.contain(`<span id="incorporatedTo-error" class="govuk-error-message">`);
        });
        it("should display an error message if incorporatedFrom is in the future", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=&incorporatedFrom=01/01/2030");
            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`<a href="#incorporatedFrom">The incorporation date must be in the past</a>`);
            chai.expect(resp.text).to.contain(`<span id="incorporatedFrom-error" class="govuk-error-message">`);
        });
        it("should display an error message if incorporatedTo is in the future", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=test&excludesCompanyName=&incorporatedTo=01/01/2030");
            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`<a href="#incorporatedTo">The incorporation date must be in the past</a>`);
            chai.expect(resp.text).to.contain(`<span id="incorporatedTo-error" class="govuk-error-message">`);
        });
    });

    describe("check advanced search pagination ", () => {
        it("should display the correct number of page links - 50 results = 3 pages", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 50)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test&page=1");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("page-3");
            chai.expect(resp.text).to.not.contain("page-4");
        });

        it("should check that the correct css class is assigned to the current page", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 50)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test&page=1");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<span class=\"active\">1</span>");
        });

        it("should show the previous and next links if on any middle page", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies")
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 50)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test&page=2");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Previous");
            chai.expect(resp.text).to.contain("Next");
        });

        it("should not show the previous link if on the 1st page", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 50)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test&page=1");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("Previous");
        });

        it("should not show the next link if on the last page", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 50)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test&page=3");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("Next");
        });
    });
});

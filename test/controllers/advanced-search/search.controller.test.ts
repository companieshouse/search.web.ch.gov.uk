import sinon, { mock } from "sinon";
import chai from "chai";
import ioredis from "ioredis";
import * as mockUtils from "../../MockUtils/advanced-search/mock.util";
import * as apiClient from "../../../src/client/apiclient";
import { signedInSession } from "../../MockUtils/redis.mocks";

const sandbox = sinon.createSandbox();
let testApp = null;
let getCompanyItemStub;

describe("advanced search search.controller.test", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));
        testApp = require("../../../src/app").default;
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
                .get("/advanced-search/get-results?companyNameIncludes=test");

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
                .get("/advanced-search/get-results?companyNameIncludes=asdasdasdadsadqwdsdvsd&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("No results found");
        });
    });

    describe("check search results company information is present", () => {
        it("company name should display and link should link to the company profile", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<a class=\"govuk-link\" href=/065000 target=\"_blank\">test1<span class=\"govuk-visually-hidden\">(link opens a new window)</span></a>");
        });

        it("should show the company status", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Active");
        });

        it("should show the company type", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Private limited company");
        });

        it("should show the company subtype", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Community Interest Company (CIC)");
        });

        it("should not show the company subtype where undefined", async () => {
            const resource = mockUtils.getDummyAdvancedCompanyResource("test", 1);
            // @ts-ignore
            resource.items[0].company_subtype = undefined;
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(resource));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("undefined");
        });

        it("should show the company number", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("0650000");
        });

        it("should show the incorporation date", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test&excludesCompanyName=");
            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("- Incorporated on 8 February 1981");
        });

        it("should show the dissolution date", async () => {
            const data = Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 1));
            (await data).items[0].company_status = "dissolved";

            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(data);

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test&excludesCompanyName=&dissolvedFromDay=12&dissolvedFromMonth=12&dissolvedFromYear=1991");
            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Dissolved on 12 December 1991");
        });
        it("should display no errors if dissolvedFrom date is a valid leap year", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=29&dissolvedFromMonth=02&dissolvedFromYear=2020");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("There is a problem");
        });
        it("should display no errors if dissolvedFrom date day and month are entered as single characters", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=2&dissolvedFromMonth=2&dissolvedFromYear=2020");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("There is a problem");
        });
        it("should display no errors if dissolvedTo date is a valid leap year", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedToDay=29&dissolvedToMonth=02&dissolvedToYear=2020");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("There is a problem");
        });
        it("should display no errors if dissolvedTo date day and month are entered as single characters", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedToDay=2&dissolvedToMonth=2&dissolvedToYear=2020");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("There is a problem");
        });
        it("should show the address", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?registeredOfficeAddress=test");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("premises, test house, test street, cardiff, region, country cf5 6rb");
        });

        it("should show sic codes", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?sicCodes=01120");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("SIC codes - 01120");
        });

        it("should display Incorporated on and Dissolved on as company type is not ROE", async () => {
            const data = Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 1));
            (await data).items[0].company_status = "dissolved";

            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(data);

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Incorporated on");
            chai.expect(resp.text).to.contain("Dissolved on");
        });

        it("should display Registered on and Removed on as company type is ROE", async () => {
            const data = Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 1));
            (await data).items[0].company_type = "registered-overseas-entity";
            (await data).items[0].company_status = "removed";

            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(data);

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Registered on");
            chai.expect(resp.text).to.contain("Removed on");
        });

        it("should not display Incorporation date as company type is protected cell company", async () => {
            const data = Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 1));
            (await data).items[0].company_type = "protected-cell-company";

            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(data);

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain("13 August 1980");
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

        it("should display the company status checked for active and dissolved companies", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?status=active&status=dissolved");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<input class='govuk-checkboxes__input' id='activeCompanies' name='status' type='checkbox' value='active' checked>");
            chai.expect(resp.text).to.contain("<input class='govuk-checkboxes__input' id='dissolvedCompanies' name='status' type='checkbox' value='dissolved' checked>");
            chai.expect(resp.text).to.not.contain("<input class='govuk-checkboxes__input' id='openCompanies' name='status' type='checkbox' value='open' checked>");
        });

        it("should display the sic codes search term in the relevant search field", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?sicCodes=07210");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<input class='govuk-input govuk-!-width-full' id='sicCodes' name='sicCodes' type='text' value='07210'>");
        });

        it("should display the dissolved search terms in the relevant search field", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=13&dissolvedFromMonth=4&dissolvedFromYear=2011&dissolvedToDay=29&dissolvedToMonth=05&dissolvedToYear=2012");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("id='dissolved-from-day' name='dissolvedFromDay' value='13'");
            chai.expect(resp.text).to.contain("id='dissolved-from-month' name='dissolvedFromMonth' value='4'");
            chai.expect(resp.text).to.contain("id='dissolved-from-year' name='dissolvedFromYear' value='2011'");
            chai.expect(resp.text).to.contain("id='dissolved-to-day' name='dissolvedToDay' value='29'");
            chai.expect(resp.text).to.contain("id='dissolved-to-month' name='dissolvedToMonth' value='05'");
            chai.expect(resp.text).to.contain("id='dissolved-to-year' name='dissolvedToYear' value='2012'");
        });

        it("should display the company types search term is checked", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?type=limited-partnership");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<input class='govuk-checkboxes__input' id='limited-partnership' name='type' type='checkbox' value='limited-partnership' checked>");
        });

        it("should display the company subtypes search term is checked", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 20)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?subtype=community-interest-company");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<input class='govuk-checkboxes__input' id='community-interest-company' name='subtype' type='checkbox' value='community-interest-company' checked>");
        });
    });

    describe("check that the validation of incorporation from dates displays the correct error messages", () => {
        it("should display an error if incorporationFrom date has an invalid character", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationFromDay=e&incorporationFromMonth=01&incorporationFromYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation &#39;from&#39; date must be a real date");
        });
        it("should display an error if incorporationFrom date has a month > 12", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationFromDay=01&incorporationFromMonth=13&incorporationFromYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation &#39;from&#39; date must be a real date");
        });
        it("should display an error if incorporationFrom date is after the incorporationTo date", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationFromDay=01&incorporationFromMonth=01&incorporationFromYear=2012&incorporationToDay=02&incorporationToMonth=02&incorporationToYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation &#39;from&#39; date must be the same as or before the &#39;to&#39; date");
        });
        it("should display an error if incorporationFrom date is in the future", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationFromDay=01&incorporationFromMonth=01&incorporationFromYear=2055");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation date must be in the past");
        });
        it("should display an error if incorporationFrom date is in invalid as it is not a leap year", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationFromDay=29&incorporationFromMonth=02&incorporationFromYear=2021");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation &#39;from&#39; date must be a real date");
        });
        it("should display an error if incorporationFrom date day is missing but the other parts of date are present", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationFromDay=&incorporationFromMonth=01&incorporationFromYear=2014");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation from date must include a day");
        });
        it("should display multiple errors if incorporationFrom date day and month are missing but a year is present", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationFromDay=&incorporationFromMonth=&incorporationFromYear=2014");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation from date must include a day");
            chai.expect(resp.text).to.contain("The incorporation from date must include a month");
        });
    });

    describe("check that the validation of incorporation from dates displays the correct error messages", () => {
        it("should display an error if incorporationFrom date has an invalid character", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationFromDay=e&incorporationFromMonth=01&incorporationFromYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation &#39;from&#39; date must be a real date");
        });
        it("should display an error if incorporationFrom date has a month > 12", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationFromDay=01&incorporationFromMonth=13&incorporationFromYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation &#39;from&#39; date must be a real date");
        });
        it("should display an error if incorporationFrom date is after the incorporationTo date", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationFromDay=01&incorporationFromMonth=01&incorporationFromYear=2012&incorporationToDay=02&incorporationToMonth=02&incorporationToYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation &#39;from&#39; date must be the same as or before the &#39;to&#39; date");
        });
        it("should display an error if incorporationFrom date is in the future", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationFromDay=01&incorporationFromMonth=01&incorporationFromYear=2055");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation date must be in the past");
        });
        it("should display an error if incorporationFrom date is in invalid as it is not a leap year", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationFromDay=29&incorporationFromMonth=02&incorporationFromYear=2021");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation &#39;from&#39; date must be a real date");
        });
        it("should display an error if incorporationFrom date day is missing but the other parts of date are present", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationFromDay=&incorporationFromMonth=01&incorporationFromYear=2014");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation from date must include a day");
        });
        it("should display multiple errors if incorporationFrom date day and month are missing but a year is present", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationFromDay=&incorporationFromMonth=&incorporationFromYear=2014");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation from date must include a day");
            chai.expect(resp.text).to.contain("The incorporation from date must include a month");
        });
    });

    describe("check that the validation of incorporation to dates displays the correct error messages", () => {
        it("should display an error if incorporationTo date has an invalid character", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationToDay=e&incorporationToMonth=01&incorporationToYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation &#39;to&#39; date must be a real date");
        });
        it("should display an error if incorporationTo date has a month > 12", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationToDay=01&incorporationToMonth=13&incorporationToYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation &#39;to&#39; date must be a real date");
        });
        it("should display an error if incorporationTo date is in the future", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationToDay=01&incorporationToMonth=01&incorporationToYear=2055");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation date must be in the past");
        });
        it("should display an error if incorporationTo date is in invalid as it is not a leap year", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationToDay=29&incorporationToMonth=02&incorporationToYear=2021");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation &#39;to&#39; date must be a real date");
        });
        it("should display an error if incorporationTo date day is missing but the other parts of date are present", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationToDay=&incorporationToMonth=01&incorporationToYear=2014");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation to date must include a day");
        });
        it("should display multiple errors if incorporationTo date day and month are missing but a year is present", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporationToDay=&incorporationToMonth=&incorporationToYear=2014");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The incorporation to date must include a day");
            chai.expect(resp.text).to.contain("The incorporation to date must include a month");
        });
    });

    describe("check that the validation of sic codes displays the correct error message", () => {
        it("should display an error if sicCode provided is invalid with less than 4 digits", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?sicCodes=1");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`<a href="#sicCodes">Enter a valid SIC code</a>`);
            chai.expect(resp.text).to.contain("<span id='sicCodes-error'class='govuk-error-message'>");
        });

        it("should display an error if sicCode provided is is invalid with greater than 5 digits", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?sicCodes=1234567");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`<a href="#sicCodes">Enter a valid SIC code</a>`);
            chai.expect(resp.text).to.contain("<span id='sicCodes-error'class='govuk-error-message'>");
        });

        it("should display an error if sicCode provided is invalid with non numeric", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?sicCodes=ABCDE");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`<a href="#sicCodes">Enter a valid SIC code</a>`);
            chai.expect(resp.text).to.contain("<span id='sicCodes-error'class='govuk-error-message'>");
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

        it("should not display any pages beyond 500 due to max ES resource of 10000 company profiles", async () => {
            const resourceWithHighHits = mockUtils.getDummyAdvancedCompanyResource("test", 50);
            resourceWithHighHits.hits = 20000;
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(resourceWithHighHits));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test&page=500");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<span class=\"active\">500</span>");
            chai.expect(resp.text).to.not.contain("page-501");
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
            getCompanyItemStub = sandbox.stub(apiClient, "getDissolvedCompanies");
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

    describe("check that the validation of dissolution from dates displays the correct error messages", () => {
        it("should display an error if dissolvedFrom date has an invalid character", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=e&dissolvedFromMonth=01&dissolvedFromYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved &#39;from&#39; date must be a real date");
        });
        it("should display an error if dissolvedFrom date has a month > 12", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=01&dissolvedFromMonth=13&dissolvedFromYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved &#39;from&#39; date must be a real date");
        });
        it("should display an error if dissolvedFrom date is after the dissolvedTo date", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=01&dissolvedFromMonth=01&dissolvedFromYear=2012&dissolvedToDay=02&dissolvedToMonth=02&dissolvedToYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved &#39;from&#39; date must be the same as or before the &#39;to&#39; date");
        });
        it("should display an error if dissolvedFrom date is in the future", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=01&dissolvedFromMonth=01&dissolvedFromYear=2055");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved date must be in the past");
        });
        it("should display an error if dissolvedFrom date is in invalid as it is not a leap year", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=29&dissolvedFromMonth=02&dissolvedFromYear=2021");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved &#39;from&#39; date must be a real date");
        });
        it("should display an error if dissolvedFrom date day is missing but the other parts of date are present", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=&dissolvedFromMonth=01&dissolvedFromYear=2014");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved from date must include a day");
        });
        it("should display multiple errors if dissolvedFrom date day and month are missing but a year is present", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=&dissolvedFromMonth=&dissolvedFromYear=2014");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved from date must include a day");
            chai.expect(resp.text).to.contain("The dissolved from date must include a month");
        });
    });

    describe("check that the validation of dissolution from dates displays the correct error messages", () => {
        it("should display an error if dissolvedFrom date has an invalid character", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=e&dissolvedFromMonth=01&dissolvedFromYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved &#39;from&#39; date must be a real date");
        });
        it("should display an error if dissolvedFrom date has a month > 12", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=01&dissolvedFromMonth=13&dissolvedFromYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved &#39;from&#39; date must be a real date");
        });
        it("should display an error if dissolvedFrom date is after the dissolvedTo date", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=01&dissolvedFromMonth=01&dissolvedFromYear=2012&dissolvedToDay=02&dissolvedToMonth=02&dissolvedToYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved &#39;from&#39; date must be the same as or before the &#39;to&#39; date");
        });
        it("should display an error if dissolvedFrom date is in the future", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=01&dissolvedFromMonth=01&dissolvedFromYear=2055");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved date must be in the past");
        });
        it("should display an error if dissolvedFrom date is in invalid as it is not a leap year", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=29&dissolvedFromMonth=02&dissolvedFromYear=2021");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved &#39;from&#39; date must be a real date");
        });
        it("should display an error if dissolvedFrom date day is missing but the other parts of date are present", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=&dissolvedFromMonth=01&dissolvedFromYear=2014");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved from date must include a day");
        });
        it("should display multiple errors if dissolvedFrom date day and month are missing but a year is present", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedFromDay=&dissolvedFromMonth=&dissolvedFromYear=2014");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved from date must include a day");
            chai.expect(resp.text).to.contain("The dissolved from date must include a month");
        });
    });
    describe("check that the validation of dissolution to dates displays the correct error messages", () => {
        it("should display an error if dissolvedTo date has an invalid character", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedToDay=e&dissolvedToMonth=01&dissolvedToYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved &#39;to&#39; date must be a real date");
        });
        it("should display an error if dissolvedTo date has a month > 12", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedToDay=01&dissolvedToMonth=13&dissolvedToYear=2011");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved &#39;to&#39; date must be a real date");
        });
        it("should display an error if dissolvedTo date is in the future", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedToDay=01&dissolvedToMonth=01&dissolvedToYear=2055");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved date must be in the past");
        });
        it("should display an error if dissolvedTo date is in invalid as it is not a leap year", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedToDay=29&dissolvedToMonth=02&dissolvedToYear=2021");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved &#39;to&#39; date must be a real date");
        });
        it("should display an error if dissolvedTo date day is missing but the other parts of date are present", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedToDay=&dissolvedToMonth=01&dissolvedToYear=2014");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved to date must include a day");
        });
        it("should display multiple errors if dissolvedTo date day and month are missing but a year is present", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?dissolvedToDay=&dissolvedToMonth=&dissolvedToYear=2014");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("The dissolved to date must include a day");
            chai.expect(resp.text).to.contain("The dissolved to date must include a month");
        });
    });

    describe("Total returned hits displayed", () => {
        it("should update result text if total hits returned to the api query equals one", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 1)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<p class=\"govuk-heading-m\">1 result</p>");
        });
        it("should show the number of total hits returned to the api query with a comma if over 999", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 1001)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<p class=\"govuk-heading-m\">1,001 results</p>");
        });
    });

    describe("Total returned hits displayed", () => {
        it("should update result text if total hits returned from the api query equals one", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 1)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<p class=\"govuk-heading-m\">1 result</p>");
        });
        it("should show the number of total hits returned from the api query with a comma if over 999", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 1001)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(" <p class=\"govuk-heading-m\">1,001 results</p>");
        });
    });

    describe("Download button", () => {
        it("should show an active download button", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 50)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<div class=\"govuk-button-group download-button\">\n                <button class=\"govuk-button\" data-module=\"govuk-button\" data-event-id=advanced-search-results-page-download-results>\n                Download results\n                </button>");
        });

        it("should show an inactive download button if there are no results", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 50)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<button disabled=\"disabled\" aria-disabled=\"true\" class=\"govuk-button govuk-button--disabled\" data-module=\"govuk-button\" data-event-id=\"advanced-search-results-page-download-results-disabled\">\n            Download results\n          </button>");
        });

        it("should show an inactive download button if there is a validation error", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 50)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?incorporatedFrom=invalid");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<button disabled=\"disabled\" aria-disabled=\"true\" class=\"govuk-button govuk-button--disabled\" data-module=\"govuk-button\" data-event-id=\"advanced-search-results-page-download-results-disabled\">\n            Download results\n          </button>");
        });

        it("the hidden download form fields should have the same values as the search queries from the main search form", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 50)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?companyNameIncludes=test" +
                    "&companyNameExcludes=one" +
                    "&registeredOfficeAddress=kings+road" +
                    "&incorporationFromDay=13" +
                    "&incorporationFromMonth=4" +
                    "&incorporationFromYear=2011" +
                    "&incorporationToDay=29" +
                    "&incorporationToMonth=05" +
                    "&incorporationToYear=2012" +
                    "&status=active&sicCodes=01120" +
                    "&type=llp" +
                    "&subtype=community-interest-company" +
                    "&subtype=private-fund-limited-partnership" +
                    "&dissolvedFromDay=13" +
                    "&dissolvedFromMonth=4" +
                    "&dissolvedFromYear=2011" +
                    "&dissolvedToDay=29" +
                    "&dissolvedToMonth=05" +
                    "&dissolvedToYear=2012");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-!-width-width-full' name='companyNameIncludes' type='text' value='test'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-!-width-width-full' name='companyNameExcludes' type='text' value='one'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-!-width-width-full' name='registeredOfficeAddress' type='text' value='kings road'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-input--width-10' name='incorporationFromDay' type='text' value='13'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-input--width-10' name='incorporationFromMonth' type='text' value='4'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-input--width-10' name='incorporationFromYear' type='text' value='2011'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-input--width-10' name='incorporationToDay' type='text' value='29'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-input--width-10' name='incorporationToMonth' type='text' value='05'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-input--width-10' name='incorporationToYear' type='text' value='2012'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-checkboxes__input' name='status' type='checkbox' value='active'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-!-width-full' name='sicCodes' type='text' value='01120'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-checkboxes__input' name='type' type='checkbox' value='llp' checked");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-checkboxes__input' name='subtype' type='checkbox' value='community-interest-company' checked");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-checkboxes__input' name='subtype' type='checkbox' value='private-fund-limited-partnership' checked");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-input--width-10' name='dissolvedFromDay' type='text' value='13'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-input--width-10' name='dissolvedFromMonth' type='text' value='4'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-input--width-10' name='dissolvedFromYear' type='text' value='2011'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-input--width-10' name='dissolvedToDay' type='text' value='29'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-input--width-10' name='dissolvedToMonth' type='text' value='05'");
            chai.expect(resp.text).to.contain("<input class='hidden govuk-input govuk-input--width-10' name='dissolvedToYear' type='text' value='2012'");
        });
    });
});

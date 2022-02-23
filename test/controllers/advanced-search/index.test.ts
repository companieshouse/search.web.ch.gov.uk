import sinon, { mock } from "sinon";
import chai from "chai";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { signedInSession } from "../../MockUtils/redis.mocks";

const sandbox = sinon.createSandbox();
let testApp = null;
let getCompanyItemStub;

describe("search.controller.test", () => {
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

    describe("check advanced search start page", () => {
        it("should return the start search page successfully", async () => {
            const resp = await chai.request(testApp)
                .get("/advanced-search");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Advanced company search");
        });

        it("should display the company name section", async () => {
            const resp = await chai.request(testApp)
                .get("/advanced-search");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Company name");
            chai.expect(resp.text).to.contain("Company names that contain");
            chai.expect(resp.text).to.contain("Exclude company names that contain");
        });

        it("should display the address search section", async () => {
            const resp = await chai.request(testApp)
                .get("/advanced-search");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Registered office address");
            chai.expect(resp.text).to.contain("Enter a full or partial address");
        });

        it("should display the incorporation date section", async () => {
            const resp = await chai.request(testApp)
                .get("/advanced-search");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Incorporation date");
            chai.expect(resp.text).to.contain("<label class='govuk-label govuk-date-input__label' for='incorporated-from-day' aria-label='Companies incorporated from day'>\n                              Day\n                            </label>");
            chai.expect(resp.text).to.contain("<label class='govuk-label govuk-date-input__label' for='incorporated-from-month' aria-label='Companies incorporated from month'>\n                              Month\n                            </label>");
            chai.expect(resp.text).to.contain("<label class='govuk-label govuk-date-input__label' for='incorporated-from-year' aria-label='Companies incorporated from year'>\n                              Year\n                            </label>");
            chai.expect(resp.text).to.contain("<label class='govuk-label govuk-date-input__label' for='incorporated-to-day' aria-label='Companies incorporated to day'>\n                              Day\n                            </label>");
            chai.expect(resp.text).to.contain("<label class='govuk-label govuk-date-input__label' for='incorporated-to-month' aria-label='Companies incorporated to month'>\n                              Month\n                            </label>");
            chai.expect(resp.text).to.contain("<label class='govuk-label govuk-date-input__label' for='incorporated-to-year' aria-label='Companies incorporated to year'>\n                              Year\n                            </label>");
        });

        it("should display the company status section", async () => {
            const resp = await chai.request(testApp)
                .get("/advanced-search");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Company status");
        });

        it("should display the nature of business section", async () => {
            const resp = await chai.request(testApp)
                .get("/advanced-search");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Nature of business");
        });

        it("should display the dissolved date section", async () => {
            const resp = await chai.request(testApp)
                .get("/advanced-search");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Dissolved date");
            chai.expect(resp.text).to.contain("We can only show companies dissolved since 01/01/2010.");
        });
    });

    describe("populate feedback link with the advanced-search source url", () => {
        it("should contain dissolved-search", async () => {
            const resp = await chai.request(testApp)
                .get("/advanced-search");

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("help/feedback?sourceurl=advanced-search");
        });
    });
});

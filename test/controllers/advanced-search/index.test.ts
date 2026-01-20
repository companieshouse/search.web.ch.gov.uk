import sinon from "sinon";
import chai from "chai";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { signedInSession } from "../../MockUtils/redis.mocks";
import { getAppWithMockedCsrf } from "../../MockUtils/csrf.mocks";

const sandbox = sinon.createSandbox();
let testApp: null = null;

describe("advanced search search.controller.test", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));
        testApp = getAppWithMockedCsrf(sandbox);
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
            chai.expect(resp.text).to.contain("<label class='govuk-label govuk-date-input__label' for='incorporation-from-day' aria-label='Companies incorporation from day'>\n                                    Day\n                                  </label>");
            chai.expect(resp.text).to.contain("<label class='govuk-label govuk-date-input__label' for='incorporation-from-month' aria-label='Companies incorporation from month'>\n                                    Month\n                                  </label>");
            chai.expect(resp.text).to.contain("<label class='govuk-label govuk-date-input__label' for='incorporation-from-year' aria-label='Companies incorporation from year'>\n                                    Year\n                                  </label>");
            chai.expect(resp.text).to.contain("<label class='govuk-label govuk-date-input__label' for='incorporation-to-day' aria-label='Companies incorporation to day'>\n                                    Day\n                                  </label>");
            chai.expect(resp.text).to.contain("<label class='govuk-label govuk-date-input__label' for='incorporation-to-month' aria-label='Companies incorporation to month'>\n                                    Month\n                                  </label>");
            chai.expect(resp.text).to.contain("<label class='govuk-label govuk-date-input__label' for='incorporation-to-year' aria-label='Companies incorporation to year'>\n                                    Year\n                                  </label>");
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
            cheerio.load(resp.text);
            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("help/feedback?sourceurl=advanced-search");
        });
    });
});

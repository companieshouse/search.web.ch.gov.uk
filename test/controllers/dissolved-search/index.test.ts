import sinon from "sinon";
import chai from "chai";
import cheerio from "cheerio";
import { getAppWithMockedCsrf } from "../../MockUtils/csrf.mocks";

const sandbox = sinon.createSandbox();
let testApp = null;

describe("index.test", () => {
    beforeEach((done) => {
        testApp = getAppWithMockedCsrf(sandbox);
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("check default of dissolved search options", () => {
        it("should have 'company name when they were dissolved' radio button selected by default", async () => {
            const resp = await chai.request(testApp)
                .get("/dissolved-search");

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Search for a dissolved company");
            chai.expect($("#changed-name").prop("checked")).to.equal(true);
        });
    });

    describe("display error message when previous company name and alphabetical options are selected for non JS users", () => {
        it("should display error message", async () => {
            const resp = await chai.request(testApp)
                .get("/dissolved-search/get-results?companyName=telesa&searchType=alphabetical&changedName=previousNameDissolved");

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("There is a problem");
        });
    });

    describe("populate feedback link with the dissolved-search source url", () => {
        it("should contain dissolved-search", async () => {
            const resp = await chai.request(testApp)
                .get("/dissolved-search");

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("help/feedback?sourceurl=dissolved-search");
        });
    });
});

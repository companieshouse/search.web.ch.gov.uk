import sinon from "sinon";
import chai from "chai";
import cheerio from "cheerio";

const sandbox = sinon.createSandbox();
let testApp = null;

describe("index.spec.unit", () => {
    beforeEach((done) => {
        testApp = require("../../../../src/app").default;
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
            chai.expect($("#changed-name").prop("checked")).be.true;
        });
    });
});

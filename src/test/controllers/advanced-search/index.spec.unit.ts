import sinon, { mock } from "sinon";
import chai from "chai";
import ioredis from "ioredis";
import cheerio from "cheerio";
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

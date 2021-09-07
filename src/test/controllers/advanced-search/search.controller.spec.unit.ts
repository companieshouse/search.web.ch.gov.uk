import sinon from "sinon";
import chai from "chai";

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
            const resp = await chai.request(testApp)
                .get("/advanced-search/get-results?containsCompanyName=&excludesCompanyName=");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("results");
        });
    });
});

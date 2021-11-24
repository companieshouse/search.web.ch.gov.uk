import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import { signedInSession } from "../MockUtils/redis.mocks";

let testApp = null;
const sandbox = sinon.createSandbox();

describe("routes.test", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));

        testApp = require("../../src/app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("Basic URL Tests", () => {
        it("should find the alphabetical search page url", async () => {
            const resp = await chai.request(testApp)
                .get("/alphabetical-search/");
            chai.expect(resp.status).to.equal(200);
        });

        it("should find the dissolved search page url", async () => {
            const resp = await chai.request(testApp)
                .get("/dissolved-search/");
            chai.expect(resp.status).to.equal(200);
        });

        it("should find the advanced search page url", async () => {
            const resp = await chai.request(testApp)
                .get("/advanced-search/");
            chai.expect(resp.status).to.equal(200);
        });

        it("should return 404 if page doesnt exist", async () => {
            const response = await chai.request(testApp)
                .get("/gibberish");

            chai.expect(response.status).to.equal(404);
        });
    });
});

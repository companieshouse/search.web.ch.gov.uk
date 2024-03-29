import sinon from "sinon";
import ioredis from "ioredis";
import {
    SIGNED_IN_ID,
    SIGNED_OUT_ID,
    signedInSession,
    signedOutSession
} from "../MockUtils/redis.mocks";
import { checkSignInSignOutNavBar } from "../test.utils";

import * as chai from "chai";
import chaiHttp = require("chai-http");
chai.use(chaiHttp);

let testApp = null;
const sandbox = sinon.createSandbox();

describe("routes.test", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get")
            .withArgs(SIGNED_IN_ID).returns(Promise.resolve(signedInSession))
            .withArgs(SIGNED_OUT_ID).returns(Promise.resolve(signedOutSession));

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

    checkSignInSignOutNavBar(sandbox, "dissolved search", "home", "/dissolved-search");
    checkSignInSignOutNavBar(sandbox, "alphabetical search", "home", "/alphabetical-search");
    checkSignInSignOutNavBar(sandbox, "advanced search", "home", "/advanced-search");
});

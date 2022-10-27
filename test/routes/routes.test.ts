import sinon from "sinon";
import ioredis from "ioredis";
import {
    SIGNED_IN_COOKIE,
    SIGNED_IN_ID,
    SIGNED_OUT_COOKIE,
    SIGNED_OUT_ID,
    signedInSession,
    signedOutSession
} from "../MockUtils/redis.mocks";
import * as apiClient from "../../src/client/apiclient";
import * as mockUtils from "../MockUtils/dissolved-search/mock.util";
import { getDummyBasket } from "../MockUtils/dissolved-search/mock.util";

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

    describe("check the sign in/sign out nav bar on dissolved search home page", () => {
        it("should show the sign in/sign out nav bar for signed in user", async () => {
            sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 1, 2)));
            sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(getDummyBasket(false)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text)
                .to.contain("Your details").and
                .to.contain("Your filings").and
                .to.contain("Companies you follow").and
                .to.contain("Sign out");
        });

        it("should not show the sign in/sign out nav bar for signed out user", async () => {
            sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 1, 2)));
            sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(getDummyBasket(false)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search")
                .set("Cookie", [`__SID=${SIGNED_OUT_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Sign in / Register");
        });

        it("should show basket link for enrolled user", async () => {
            sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 1, 2)));
            sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(getDummyBasket(true)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`Basket (1)`);
        });

        it("should not show basket link for un-enrolled user", async () => {
            sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 1, 2)));
            sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(getDummyBasket(false)));

            const resp = await chai.request(testApp)
                .get("/dissolved-search")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain(`Basket (`);
        });
    });
});

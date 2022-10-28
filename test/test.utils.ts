import * as apiClient from "../src/client/apiclient";
import * as mockUtils from "./MockUtils/dissolved-search/mock.util";
import { getDummyBasket } from "./MockUtils/dissolved-search/mock.util";
import { SIGNED_IN_COOKIE, SIGNED_OUT_COOKIE } from "./MockUtils/redis.mocks";
import { SinonSandbox } from "sinon";
import createError from "http-errors";

import * as chai from "chai";
import chaiHttp = require("chai-http");
chai.use(chaiHttp);

let testApp = null;

export const checkSignInSignOutNavBar = (sandbox: SinonSandbox, pageName: string, pagePath: string) => {
    testApp = require("../src/app").default;

    describe(`check the sign in/sign out nav bar on dissolved search ${pageName} page`, () => {
        it("should show the sign in/sign out nav bar for signed in user", async () => {
            sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 1, 2)));
            sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(getDummyBasket(false)));

            const resp = await chai.request(testApp)
                .get(pagePath)
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
                .get(pagePath)
                .set("Cookie", [`__SID=${SIGNED_OUT_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("Sign in / Register");
        });

        it("should show basket link for enrolled user", async () => {
            sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 1, 2)));
            sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(getDummyBasket(true)));

            const resp = await chai.request(testApp)
                .get(pagePath)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`Basket (1)`);
        });

        it("should not show basket link for un-enrolled user", async () => {
            sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 1, 2)));
            sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(getDummyBasket(false)));

            const resp = await chai.request(testApp)
                .get(pagePath)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.not.contain(`Basket (`);
        });

        it("should show the service error page for a 404 response from the basket API?", async () => {
            sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 1, 2)));
            sandbox.stub(apiClient, "getBasket").returns(Promise.reject(createError(404)));

            const resp = await chai.request(testApp)
                .get(pagePath)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(500);
            chai.expect(resp.text).to.contain("Sorry, there is a problem with the service");
        });

        it("should show the service error page for a 502 response from the basket API?", async () => {
            sandbox.stub(apiClient, "getDissolvedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyDissolvedCompanyResource("tetso", 1, 2)));
            sandbox.stub(apiClient, "getBasket").returns(Promise.reject(createError(502)));

            const resp = await chai.request(testApp)
                .get(pagePath)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(500);
            chai.expect(resp.text).to.contain("Sorry, there is a problem with the service");
        });
    });
};

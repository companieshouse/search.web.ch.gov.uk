import sinon, { mock } from "sinon";
import chai from "chai";
import ioredis from "ioredis";
import * as mockUtils from "../../MockUtils/advanced-search/mock.util";
import * as apiClient from "../../../src/client/apiclient";
import { signedInSession } from "../../MockUtils/redis.mocks";

const sandbox = sinon.createSandbox();
let testApp = null;
let getCompanyItemStub;

describe("search.controller.spec.unit", () => {
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

    describe("check it returns parsed data csv format", () => {
        it("should return csv file", async () => {
            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 1)));

            const resp = await chai.request(testApp)
                .get("/advanced-search/download")
                .set("Content-Type", "text/csv");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("company_name,company_number,company_status,company_type,dissolution_date,incorporation_date,nature_of_business,registered_office_address");
            chai.expect(resp.text).to.contain("test0,06500000,Active,Private limited company,1991-12-12T00:00:00.000Z,1981-02-08T00:00:00.000Z,01120,test house test street cardiff cf5 6rb");
        });
    });
});

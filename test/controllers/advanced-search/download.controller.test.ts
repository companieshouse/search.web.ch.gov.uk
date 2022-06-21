import sinon from "sinon";
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
            const data = Promise.resolve(mockUtils.getDummyAdvancedCompanyResource("test", 3));
            (await data).items[1].company_type = "registered-overseas-entity";
            (await data).items[1].company_status = "removed";
            (await data).items[2].company_type = "protected-cell-company";

            getCompanyItemStub = sandbox.stub(apiClient, "getAdvancedCompanies")
                .returns(data);

            const resp = await chai.request(testApp)
                .get("/advanced-search/download")
                .set("Content-Type", "text/csv");

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("company_name,company_number,company_status,company_type,company_subtype,dissolution_date,incorporation_date,removed_date,registered_date,nature_of_business,registered_office_address");
            chai.expect(resp.text).to.contain("test0,06500000,Active,Private limited company,Community Interest Company (CIC),1991-12-12T00:00:00.000Z,1981-02-08T00:00:00.000Z,,,01120,test house test street cardiff cf5 6rb");
            chai.expect(resp.text).to.contain("test1,06500001,Removed,Overseas entity,Community Interest Company (CIC),,,1991-12-12T00:00:00.000Z,1981-02-08T00:00:00.000Z,01120,test house test street cardiff cf5 6rb");
            chai.expect(resp.text).to.contain("test2,06500002,Active,Protected cell company,Community Interest Company (CIC),1991-12-12T00:00:00.000Z,,,,01120,test house test street cardiff cf5 6rb");
        });
    });
});

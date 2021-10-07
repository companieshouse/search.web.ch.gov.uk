import { expect } from "chai";

import { getCompanyStatusConstant } from "../../config/api.enumerations";

describe("api.enumerations.unit", () => {
    describe("getCompanyStatusConstant", () => {
        it("should load the constants file from api-enumeration correctly and load data from it", () => {
            const result = getCompanyStatusConstant("voluntary-arrangement");
            expect(result).to.equal("Voluntary Arrangement");
        });

        it("should return the same input passed in if company status value is not present", () => {
            const result = getCompanyStatusConstant("actve");
            expect(result).to.equal("actve");
        });
    });
});

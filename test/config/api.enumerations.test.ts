import { expect } from "chai";

import { getCompanyConstant, COMPANY_STATUS_CONSTANT, COMPANY_TYPE_CONSTANT } from "../../src/config/api.enumerations";

describe("api.enumerations.unit", () => {
    describe("getCompanyConstant", () => {
        it("should load the constants file from api-enumeration correctly and load data from it", () => {
            const result = getCompanyConstant(COMPANY_STATUS_CONSTANT, "voluntary-arrangement");
            expect(result).to.equal("Voluntary Arrangement");
        });

        it("should return the same input passed in if company status value is not present", () => {
            const result = getCompanyConstant(COMPANY_STATUS_CONSTANT, "actve");
            expect(result).to.equal("actve");
        });

        it("should load the constants file from api-enumeration and load the company-type value from it", () => {
            const result = getCompanyConstant(COMPANY_TYPE_CONSTANT, "ltd");
            expect(result).to.equal("Private limited company");
        });

        it("should return the same input passed in if company type value is not present", () => {
            const result = getCompanyConstant(COMPANY_TYPE_CONSTANT, "pub-ltd-comp");
            expect(result).to.equal("pub-ltd-comp");
        });
    });
});

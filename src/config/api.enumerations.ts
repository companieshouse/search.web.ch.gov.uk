import fs from "fs";
import yaml from "js-yaml";

const COMPANY_STATUS_CONSTANTS_PATH: string = "api-enumerations/constants.yml";
const COMPANY_STATUS_CONSTANT: string = "company_status";

const companyStatusConstants = yaml.safeLoad(fs.readFileSync(COMPANY_STATUS_CONSTANTS_PATH, "utf8"));

export const getCompanyStatusConstant = (descriptionKey: string): string => {
    if (companyStatusConstants === undefined) {
        return descriptionKey;
    } else {
        return companyStatusConstants[COMPANY_STATUS_CONSTANT][descriptionKey] || descriptionKey;
    }
};

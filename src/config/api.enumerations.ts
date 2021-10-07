import fs from "fs";
import yaml from "js-yaml";

const COMPANY_CONSTANTS_PATH: string = "api-enumerations/constants.yml";
export const COMPANY_STATUS_CONSTANT: string = "company_status";
export const COMPANY_TYPE_CONSTANT: string = "company_type";

const companyConstants = yaml.safeLoad(fs.readFileSync(COMPANY_CONSTANTS_PATH, "utf8"));

export const getCompanyConstant = (enumerationCategory: string, descriptionKey: string): string => {
    if (companyConstants === undefined) {
        return descriptionKey;
    } else {
        return companyConstants[enumerationCategory][descriptionKey] || descriptionKey;
    }
}

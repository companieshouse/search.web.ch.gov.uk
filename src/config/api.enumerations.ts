import fs from "fs";
import yaml from "js-yaml";

const COMPANY_CONSTANTS_PATH: string = "api-enumerations/constants.yml";
export const COMPANY_STATUS_CONSTANT: string = "company_status";
export const COMPANY_TYPE_CONSTANT: string = "company_type";
export const COMPANY_SUBTYPE_CONSTANT: string = "company_subtype";
export const COMPANY_BIRTH_TYPE_CONSTANT: string = "company_birth_type";
export const CESSATION_LABEL_CONSTANT: string = "cessation_label_for_status";
export const COMPANY_SIC_CODES_CONSTANT: string = "sic_descriptions";

const companyConstants = yaml.safeLoad(fs.readFileSync(COMPANY_CONSTANTS_PATH, "utf8"));

export const getCompanyConstant = (enumerationCategory: string, descriptionKey: string): string => {
    if (companyConstants === undefined) {
        return descriptionKey;
    } else {
        return companyConstants[enumerationCategory][descriptionKey] || descriptionKey;
    }
};

export const getCompanySicCodes = (): string[] | null => {
    if (companyConstants === undefined) {
        return null;
    } else {
        const sicCodeList = Object.keys(companyConstants[COMPANY_SIC_CODES_CONSTANT]);
        return sicCodeList;
    }
};

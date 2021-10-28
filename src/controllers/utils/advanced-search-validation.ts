import { check, param } from "express-validator";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";
import { validateDate } from "./utils";

const INCORPORATED_FROM_FIELD: string = "incorporatedFrom";
const INCORPORATED_TO_FIELD: string = "incorporatedTo";

const INVALID_DATE_ERROR_MESSAGE = "You must enter a valid date, for example, 01/01/2009";
const TO_DATE_BEFORE_FROM_DATE = "The incorported from date should be earlier than the incorporated to date";

export const advancedSearchValidationRules =
    [
        check(INCORPORATED_FROM_FIELD)
            .custom((date) => {
                if (date !== null && date !== undefined && date.length > 0) {
                    const validDate = validateDate(date);
                    if (!validDate) {
                        throw Error(INVALID_DATE_ERROR_MESSAGE);
                    }
                }
                return true;
            }),
        check(INCORPORATED_TO_FIELD)
            .custom((date) => {
                if (date !== null && date !== undefined && date.length > 0) {
                    const validDate = validateDate(date);
                    if (!validDate) {
                        throw Error(INVALID_DATE_ERROR_MESSAGE);
                    }
                }
                return true;
            }),
        check(INCORPORATED_FROM_FIELD)
            .custom(async (from, {req}) => {
                let fromDate = new Date(from);
                let toDate = new Date(req.query?.incorporatedTo);
                console.log(`fromDate = ${fromDate} and toDate = ${toDate}`)
                if (toDate < fromDate) {
                    throw Error(TO_DATE_BEFORE_FROM_DATE);
                }
            }),
        check(INCORPORATED_TO_FIELD)
            .custom(async (to, {req}) => {
                let toDate = new Date(to);
                let fromDate = new Date(req.query?.incorporatedFrom);
                console.log(`fromDate = ${fromDate} and toDate = ${toDate}`)
                if (toDate < fromDate) {
                    throw Error(TO_DATE_BEFORE_FROM_DATE);
                }
            })
    ];

export const validate = (validationErrors) => {
    let incorporatedFromError;
    let incorporatedToError;
    const validationErrorList = validationErrors.array({ onlyFirstError: true }).map((error) => {
        const govUkErrorData: GovUkErrorData = createGovUkErrorData(error.msg, "#" + error.param, true, "");
        switch (error.param) {
        case INCORPORATED_FROM_FIELD:
            incorporatedFromError = govUkErrorData;
            break;
        case INCORPORATED_TO_FIELD:
            incorporatedToError = govUkErrorData;
            break;
        }
        return govUkErrorData;
    });
    return {
        errorList: validationErrorList,
        incorporatedFromError,
        incorporatedToError
    };
};

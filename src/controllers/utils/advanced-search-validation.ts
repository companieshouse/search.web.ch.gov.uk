import { check, param } from "express-validator";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";
import { validateDate } from "./utils";

const INCORPORATED_FROM_FIELD: string = "incorporatedFrom";
const INCORPORATED_TO_FIELD: string = "incorporatedTo";

const INVALID_DATE_ERROR_MESSAGE = "You must enter a valid date, for example, 01/01/2009";
const TO_DATE_BEFORE_FROM_DATE = "The incorporated from date should be earlier than the incorporated to date";

export const advancedSearchValidationRules =
    [
        check(INCORPORATED_FROM_FIELD)
            .custom((date, {req}) => {
                if (checkStringNotNullOrEmpty(date)) {
                    const validDate = validateDate(date);
                    if (!validDate) {
                        throw Error(INVALID_DATE_ERROR_MESSAGE);
                    }
                    let toDate = req.query?.incorporatedTo;
                    if(checkStringNotNullOrEmpty(toDate)) {
        
                        if (checkDateBeforeInitial(toDate, date)) {
                            throw Error(TO_DATE_BEFORE_FROM_DATE);
                        }
                    }
                }
                return true;
            }),
        check(INCORPORATED_TO_FIELD)
            .custom((date, {req}) => {
                if (checkStringNotNullOrEmpty(date)) {
                    const validDate = validateDate(date);
                    if (!validDate) {
                        throw Error(INVALID_DATE_ERROR_MESSAGE);
                    }
                    let fromDate = req.query?.incorporatedFrom;
                    if(checkStringNotNullOrEmpty(fromDate)) {
        
                        if (checkDateBeforeInitial(date, fromDate)) {
                            throw Error(TO_DATE_BEFORE_FROM_DATE);
                        }
                    }
                }
                return true;
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

function checkDateBeforeInitial(initialDate, checkDate) {
    let firstDate = new Date(initialDate);
    let secondDate = new Date(checkDate);
    return firstDate < secondDate;
 }
 
 function checkStringNotNullOrEmpty(checkString) {
    return checkString !== null && checkString !== undefined && checkString.length > 0;
 }

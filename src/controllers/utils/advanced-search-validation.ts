import { check, param } from "express-validator";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";
import { validateDate } from "./utils";
import moment from "moment";

const INCORPORATED_FROM_FIELD: string = "incorporatedFrom";
const INCORPORATED_TO_FIELD: string = "incorporatedTo";

const INVALID_DATE_ERROR_MESSAGE = "You must enter a valid date, for example, 01/01/2009";
const TO_DATE_BEFORE_FROM_DATE = "The 'Companies incorporated before' date must be after the 'Companies incorporated after' date";
const INCORPORATION_DATE_IN_FUTURE = "The incorporation date must be in the past";

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
                    if (checkIfDateInFuture(date)) {
                        throw Error(INCORPORATION_DATE_IN_FUTURE);
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
                    if (checkIfDateInFuture(date)) {
                        throw Error(INCORPORATION_DATE_IN_FUTURE);
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

function checkDateBeforeInitial(initialDate: string, checkDate: string) {
    let firstMoment = moment(initialDate, "DD/MM/YYYY");
    let secondMoment = moment(checkDate, "DD/MM/YYYY");
    let firstDate = firstMoment.toDate();
    let secondDate = secondMoment.toDate();
    return firstDate < secondDate;
 }
 
 function checkStringNotNullOrEmpty(checkString: string) {
    return checkString !== null && checkString !== undefined && checkString.length > 0;
 }

 function checkIfDateInFuture(date: string) {
    let dateMoment = moment(date, "DD/MM/YYYY");
    let checkDate = dateMoment.toDate();
    let now = new Date();
    return now < checkDate;
 }

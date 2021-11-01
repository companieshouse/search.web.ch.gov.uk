import { check } from "express-validator";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";
import { validateDate } from "./utils";
import moment from "moment";

const INCORPORATED_FROM_FIELD: string = "incorporatedFrom";
const INCORPORATED_TO_FIELD: string = "incorporatedTo";

const INVALID_DATE_ERROR_MESSAGE = "Incorporation date must include a day, a month and a year";
const TO_DATE_BEFORE_FROM_DATE = "The 'Companies incorporated before' date must be after the 'Companies incorporated after' date";
const INCORPORATION_DATE_IN_FUTURE = "The incorporation date must be in the past";

export const advancedSearchValidationRules =
    [
        check(INCORPORATED_FROM_FIELD)
            .custom((date, { req }) => {
                if (isStringNotNullOrEmpty(date)) {
                    const validDate = validateDate(date);
                    if (!validDate) {
                        throw Error(INVALID_DATE_ERROR_MESSAGE);
                    }
                    const toDate = req.query?.incorporatedTo;
                    if (isStringNotNullOrEmpty(toDate)) {
                        if (isDateBeforeInitial(toDate, date)) {
                            throw Error(TO_DATE_BEFORE_FROM_DATE);
                        }
                    }
                    if (isDateInFuture(date)) {
                        throw Error(INCORPORATION_DATE_IN_FUTURE);
                    }
                }
                return true;
            }),
        check(INCORPORATED_TO_FIELD)
            .custom((date, { req }) => {
                if (isStringNotNullOrEmpty(date)) {
                    const validDate = validateDate(date);
                    if (!validDate) {
                        throw Error(INVALID_DATE_ERROR_MESSAGE);
                    }
                    const fromDate = req.query?.incorporatedFrom;
                    if (isStringNotNullOrEmpty(fromDate)) {
                        if (isDateBeforeInitial(date, fromDate)) {
                            throw Error(TO_DATE_BEFORE_FROM_DATE);
                        }
                    }
                    if (isDateInFuture(date)) {
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

function isDateBeforeInitial (initialDate: string, checkDate: string) : boolean {
    const firstMoment = moment(initialDate, "DD/MM/YYYY");
    const secondMoment = moment(checkDate, "DD/MM/YYYY");
    const firstDate = firstMoment.toDate();
    const secondDate = secondMoment.toDate();
    return firstDate < secondDate;
}

function isStringNotNullOrEmpty (checkString: string) : boolean {
    return checkString !== null && checkString !== undefined && checkString.length > 0;
}

function isDateInFuture (date: string) : boolean {
    const dateMoment = moment(date, "DD/MM/YYYY");
    const checkDate = dateMoment.toDate();
    const now = new Date();
    return now < checkDate;
}

import { check } from "express-validator";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";
import moment from "moment";
import { getCompanySicCodes } from "../../config/api.enumerations";

const INCORPORATED_FROM_FIELD: string = "incorporatedFrom";
const INCORPORATED_TO_FIELD: string = "incorporatedTo";
const SIC_CODES_FIELD: string = "sicCodes";

const INVALID_DATE_ERROR_MESSAGE = "Incorporation date must include a day, a month and a year";
const TO_DATE_BEFORE_FROM_DATE = "The incorporation 'from' date must be the same as or before the 'to' date";
const INCORPORATION_DATE_IN_FUTURE = "The incorporation date must be in the past";
const FROM_MUST_BE_REAL_DATE = "Incorporation 'from' must be a real date";
const TO_MUST_BE_REAL_DATE = "Incorporation 'to' must be a real date";
const INVALID_SIC_CODE_FORMAT = "Enter a valid SIC code";

export const advancedSearchValidationRules =
    [
        check(INCORPORATED_FROM_FIELD)
            .custom((date, { req }) => {
                if (isStringNotNullOrEmpty(date)) {
                    if (!isDateFormattedProperly(date)) {
                        throw Error(INVALID_DATE_ERROR_MESSAGE);
                    }
                    if (!isDateValid(date)) {
                        throw Error(FROM_MUST_BE_REAL_DATE);
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
                    if (!isDateFormattedProperly(date)) {
                        throw Error(INVALID_DATE_ERROR_MESSAGE);
                    }
                    if (!isDateValid(date)) {
                        throw Error(TO_MUST_BE_REAL_DATE);
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
            }),
        check(SIC_CODES_FIELD)
            .custom((sicCode, { req }) => {
                if (isStringNotNullOrEmpty(sicCode)) {
                    if (!checkSicCode(sicCode)) {
                        throw Error(INVALID_SIC_CODE_FORMAT);
                    }
                }
                return true;
            })
    ];

export const validate = (validationErrors) => {
    let incorporatedFromError;
    let incorporatedToError;
    let sicCodesError;
    const validationErrorList = validationErrors.array({ onlyFirstError: true }).map((error) => {
        const govUkErrorData: GovUkErrorData = createGovUkErrorData(error.msg, "#" + error.param, true, "");
        switch (error.param) {
        case INCORPORATED_FROM_FIELD:
            incorporatedFromError = govUkErrorData;
            break;
        case INCORPORATED_TO_FIELD:
            incorporatedToError = govUkErrorData;
            break;
        case SIC_CODES_FIELD:
            sicCodesError = govUkErrorData;
            break;
        }
        return govUkErrorData;
    });
    return {
        errorList: validationErrorList,
        incorporatedFromError,
        incorporatedToError,
        sicCodesError
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

<<<<<<< HEAD
function isSicCodeFormatCorrect (value: string): boolean {
    const isNumeric = /^-?\d+$/.test(value);

    return isNumeric && value.length >= 4 && value.length <= 5;
=======
function checkSicCode(value: string): boolean {
    const SIC_CODES = getCompanySicCodes()
    const trimmedValue = value.trim();
    return SIC_CODES?.includes(trimmedValue) ? true : false;
>>>>>>> master
}

function getDaysInMonth (month: string, year: string) : number {
    const yearAsNumber = +year;
    switch (month) {
    case "02":
        return (yearAsNumber % 4 === 0 && yearAsNumber % 100) || yearAsNumber % 400 === 0 ? 29 : 28;
    case "04": case "06": case "09": case "11":
        return 30;
    default:
        return 31;
    }
}

function isDateValid (date: string) : boolean {
    const [day, month, year] = date.split("/");
    const daysInMonth = getDaysInMonth(month, year);
    const monthAsNumber = +month;
    const dayAsNumber = +day;
    if (monthAsNumber < 1 || monthAsNumber > 12 || dayAsNumber < 1 || dayAsNumber > daysInMonth) {
        return false;
    } else {
        return true;
    }
}

function isDateFormattedProperly (date: string) : boolean {
    const pattern = /^\d{2}\/\d{2}\/\d{4}$/;
    return pattern.test(date);
}

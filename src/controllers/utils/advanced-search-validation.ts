import { check } from "express-validator";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";
import moment from "moment";
import { getCompanySicCodes } from "../../config/api.enumerations";

const INCORPORATED_FROM_FIELD: string = "incorporatedFrom";
const INCORPORATED_TO_FIELD: string = "incorporatedTo";
const SIC_CODES_FIELD: string = "sicCodes";
const DISSOLVED_FROM_FIELD: string = "dissolvedFrom";
const DISSOLVED_FROM_DAY_FIELD: string = "dissolved-from-day";
const DISSOLVED_FROM_MONTH_FIELD: string = "dissolved-from-month";
const DISSOLVED_FROM_YEAR_FIELD: string = "dissolved-from-year";
const DISSOLVED_TO_FIELD: string = "dissolvedTo";
const DISSOLVED_TO_DAY_FIELD: string = "dissolved-to-day";
const DISSOLVED_TO_MONTH_FIELD: string = "dissolved-to-month";
const DISSOLVED_TO_YEAR_FIELD: string = "dissolved-to-year";

const INVALID_DATE_ERROR_MESSAGE = "The incorporation date must include a day, a month and a year";
const TO_DATE_BEFORE_FROM_DATE = "The incorporation 'from' date must be the same as or before the 'to' date";
const INCORPORATION_DATE_IN_FUTURE = "The incorporation date must be in the past";
const FROM_MUST_BE_REAL_DATE = "The incorporation 'from' must be a real date";
const TO_MUST_BE_REAL_DATE = "The incorporation 'to' must be a real date";
const INVALID_SIC_CODE_FORMAT = "Enter a valid SIC code";
const DISSOLVED_TO_DATE_BEFORE_FROM_DATE = "The dissolved 'from' date must be the same as or before the 'to' date";
const DISSOLVED_DATE_IN_FUTURE = "The dissolved date must be in the past";
const DISSOLVED_FROM_MUST_BE_REAL_DATE = "The dissolved 'from' date must be a real date";
const DISSOLVED_TO_MUST_BE_REAL_DATE = "The dissolved 'to' date must be a real date";
const DISSOLVED_FROM_DATE_MUST_INCLUDE_DAY = "The dissolved from date must include a day";
const DISSOLVED_FROM_DATE_MUST_INCLUDE_MONTH = "The dissolved from date must include a month";
const DISSOLVED_FROM_DATE_MUST_INCLUDE_YEAR = "The dissolved from date must include a year";
const DISSOLVED_TO_DATE_MUST_INCLUDE_DAY = "The dissolved to date must include a day";
const DISSOLVED_TO_DATE_MUST_INCLUDE_MONTH = "The dissolved to date must include a month";
const DISSOLVED_TO_DATE_MUST_INCLUDE_YEAR = "The dissolved to date must include a year";

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
            }),
        check(DISSOLVED_FROM_DAY_FIELD)
            .custom((date, { req }) => {
                const dissolvedFromDay = req.query?.dissolvedFromDay as string;
                const dissolvedFromMonth = req.query?.dissolvedFromMonth as string;
                const dissolvedFromYear = req.query?.dissolvedFromYear as string;

                if (isDayPortionOfDateMissing(dissolvedFromDay, dissolvedFromMonth, dissolvedFromYear)) {
                    throw Error(DISSOLVED_FROM_DATE_MUST_INCLUDE_DAY);
                }
                return true;
            }),
        check(DISSOLVED_FROM_MONTH_FIELD)
            .custom((date, { req }) => {
                const dissolvedFromDay = req.query?.dissolvedFromDay as string;
                const dissolvedFromMonth = req.query?.dissolvedFromMonth as string;
                const dissolvedFromYear = req.query?.dissolvedFromYear as string;

                if (isMonthPortionOfDateMissing(dissolvedFromDay, dissolvedFromMonth, dissolvedFromYear)) {
                    throw Error(DISSOLVED_FROM_DATE_MUST_INCLUDE_MONTH);
                }
                return true;
            }),
        check(DISSOLVED_FROM_YEAR_FIELD)
            .custom((date, { req }) => {
                const dissolvedFromDay = req.query?.dissolvedFromDay as string;
                const dissolvedFromMonth = req.query?.dissolvedFromMonth as string;
                const dissolvedFromYear = req.query?.dissolvedFromYear as string;

                if (isYearPortionOfDateMissing(dissolvedFromDay, dissolvedFromMonth, dissolvedFromYear)) {
                    throw Error(DISSOLVED_FROM_DATE_MUST_INCLUDE_YEAR);
                }
                return true;
            }),
        check(DISSOLVED_FROM_FIELD)
            .custom((date, { req }) => {
                const dissolvedFromDay = req.query?.dissolvedFromDay as string;
                const dissolvedFromMonth = req.query?.dissolvedFromMonth as string;
                const dissolvedFromYear = req.query?.dissolvedFromYear as string;
                const dissolvedToDay = req.query?.dissolvedToDay as string;
                const dissolvedToMonth = req.query?.dissolvedToMonth as string;
                const dissolvedToYear = req.query?.dissolvedToYear as string;
                const dissolvedFromDate = `${dissolvedFromDay}/${dissolvedFromMonth}/${dissolvedFromYear}`;
                const dissolvedToDate = `${dissolvedToDay}/${dissolvedToMonth}/${dissolvedToYear}`;

                if (isStringNotNullOrEmpty(dissolvedFromDay) && isStringNotNullOrEmpty(dissolvedFromMonth) && isStringNotNullOrEmpty(dissolvedFromYear)) {
                    if (!isDateValid(dissolvedFromDate)) {
                        throw Error(DISSOLVED_FROM_MUST_BE_REAL_DATE);
                    }
                    if (isDateValid(dissolvedToDate) && isDateValid(dissolvedFromDate) && isDateBeforeInitial(dissolvedToDate, dissolvedFromDate)) {
                        throw Error(DISSOLVED_TO_DATE_BEFORE_FROM_DATE);
                    }
                    if (isDateValid(dissolvedFromDate) && isDateInFuture(dissolvedFromDate)) {
                        throw Error(DISSOLVED_DATE_IN_FUTURE);
                    }
                }
                return true;
            }),
        check(DISSOLVED_TO_DAY_FIELD)
            .custom((date, { req }) => {
                const dissolvedToDay = req.query?.dissolvedToDay as string;
                const dissolvedToMonth = req.query?.dissolvedToMonth as string;
                const dissolvedToYear = req.query?.dissolvedToYear as string;

                if (isDayPortionOfDateMissing(dissolvedToDay, dissolvedToMonth, dissolvedToYear)) {
                    throw Error(DISSOLVED_TO_DATE_MUST_INCLUDE_DAY);
                }
                return true;
            }),
        check(DISSOLVED_TO_MONTH_FIELD)
            .custom((date, { req }) => {
                const dissolvedToDay = req.query?.dissolvedToDay as string;
                const dissolvedToMonth = req.query?.dissolvedToMonth as string;
                const dissolvedToYear = req.query?.dissolvedToYear as string;

                if (isMonthPortionOfDateMissing(dissolvedToDay, dissolvedToMonth, dissolvedToYear)) {
                    throw Error(DISSOLVED_TO_DATE_MUST_INCLUDE_MONTH);
                }
                return true;
            }),
        check(DISSOLVED_TO_YEAR_FIELD)
            .custom((date, { req }) => {
                const dissolvedToDay = req.query?.dissolvedToDay as string;
                const dissolvedToMonth = req.query?.dissolvedToMonth as string;
                const dissolvedToYear = req.query?.dissolvedToYear as string;

                if (isYearPortionOfDateMissing(dissolvedToDay, dissolvedToMonth, dissolvedToYear)) {
                    throw Error(DISSOLVED_TO_DATE_MUST_INCLUDE_YEAR);
                }
                return true;
            }),
        check(DISSOLVED_TO_FIELD)
            .custom((date, { req }) => {
                const dissolvedFromDay = req.query?.dissolvedFromDay as string;
                const dissolvedFromMonth = req.query?.dissolvedFromMonth as string;
                const dissolvedFromYear = req.query?.dissolvedFromYear as string;
                const dissolvedToDay = req.query?.dissolvedToDay as string;
                const dissolvedToMonth = req.query?.dissolvedToMonth as string;
                const dissolvedToYear = req.query?.dissolvedToYear as string;
                const dissolvedFromDate = `${dissolvedFromDay}/${dissolvedFromMonth}/${dissolvedFromYear}`;
                const dissolvedToDate = `${dissolvedToDay}/${dissolvedToMonth}/${dissolvedToYear}`;

                if (isStringNotNullOrEmpty(dissolvedToDay) && isStringNotNullOrEmpty(dissolvedToMonth) && isStringNotNullOrEmpty(dissolvedToYear)) {
                    if (!isDateValid(dissolvedToDate)) {
                        throw Error(DISSOLVED_TO_MUST_BE_REAL_DATE);
                    }
                    if (isDateValid(dissolvedToDate) && isDateValid(dissolvedFromDate) && isDateBeforeInitial(dissolvedToDate, dissolvedFromDate)) {
                        throw Error(DISSOLVED_TO_DATE_BEFORE_FROM_DATE);
                    }
                    if (isDateValid(dissolvedToDate) && isDateInFuture(dissolvedToDate)) {
                        throw Error(DISSOLVED_DATE_IN_FUTURE);
                    }
                }
                return true;
            })
    ];

export const validate = (validationErrors) => {
    let incorporatedFromError;
    let incorporatedToError;
    let sicCodesError;
    let dissolvedFromError;
    let dissolvedFromDayError;
    let dissolvedFromMonthError;
    let dissolvedFromYearError;
    let dissolvedToError;
    let dissolvedToDayError;
    let dissolvedToMonthError;
    let dissolvedToYearError;
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
        case DISSOLVED_FROM_FIELD:
            dissolvedFromError = govUkErrorData;
            break;
        case DISSOLVED_FROM_DAY_FIELD:
            dissolvedFromDayError = govUkErrorData;
            break;
        case DISSOLVED_FROM_MONTH_FIELD:
            dissolvedFromMonthError = govUkErrorData;
            break;
        case DISSOLVED_FROM_YEAR_FIELD:
            dissolvedFromYearError = govUkErrorData;
            break;
        case DISSOLVED_TO_FIELD:
            dissolvedToError = govUkErrorData;
            break;
        case DISSOLVED_TO_DAY_FIELD:
            dissolvedToDayError = govUkErrorData;
            break;
        case DISSOLVED_TO_MONTH_FIELD:
            dissolvedToMonthError = govUkErrorData;
            break;
        case DISSOLVED_TO_YEAR_FIELD:
            dissolvedToYearError = govUkErrorData;
            break;
        }
        return govUkErrorData;
    });
    return {
        errorList: validationErrorList,
        incorporatedFromError,
        incorporatedToError,
        sicCodesError,
        dissolvedFromError,
        dissolvedFromDayError,
        dissolvedFromMonthError,
        dissolvedFromYearError,
        dissolvedToError,
        dissolvedToDayError,
        dissolvedToMonthError,
        dissolvedToYearError
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

function checkSicCode (value: string): boolean {
    const SIC_CODES = getCompanySicCodes();
    const trimmedValue = value.trim();
    return SIC_CODES?.includes(trimmedValue) ? true : false;
}

function isDateValid (date: string) : boolean {
    const momentDate = moment(date, "DD/MM/YYYY");
    if (isDateFormattedProperly(date)) {
        return momentDate.isValid();
    }
    return false;
}

function isDateFormattedProperly (date: string) : boolean {
    const pattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    return pattern.test(date);
}

function isDayPortionOfDateMissing (day: string, month: string, year: string): boolean {
    if ((isStringNotNullOrEmpty(month) || isStringNotNullOrEmpty(year)) && !isStringNotNullOrEmpty(day)) {
        return true;
    }
    return false;
}

function isMonthPortionOfDateMissing (day: string, month: string, year: string): boolean {
    if ((isStringNotNullOrEmpty(day) || isStringNotNullOrEmpty(year)) && !isStringNotNullOrEmpty(month)) {
        return true;
    }
    return false;
}

function isYearPortionOfDateMissing (day: string, month: string, year: string): boolean {
    if ((isStringNotNullOrEmpty(day) || isStringNotNullOrEmpty(month)) && !isStringNotNullOrEmpty(year)) {
        return true;
    }
    return false;
}

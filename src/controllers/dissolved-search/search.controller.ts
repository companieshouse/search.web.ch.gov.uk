import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/types";
import { createLogger } from "@companieshouse/structured-logging-node";
import { SEARCH_WEB_COOKIE_NAME, API_KEY, APPLICATION_NAME } from "../../config/config";
import { getDissolvedCompanies } from "../../client/apiclient";
import * as templatePaths from "../../model/template.paths";
import * as errorMessages from "../../model/error.messages";
import Cookies = require("cookies");

const logger = createLogger(APPLICATION_NAME);

const validators = [
    check("companyName").not().isEmpty().withMessage(errorMessages.COMPANY_NAME_EMPTY)
];

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        const companyNameRequestParam: string = req.query.companyName as string;
        const companyName: string = companyNameRequestParam;
        Date();
        let searchResults;

        try {
            const companyResource: CompaniesResource =
                await getDissolvedCompanies(API_KEY, companyName, cookies.get(SEARCH_WEB_COOKIE_NAME));
            searchResults = companyResource.items.map((result) => {
                return [
                    {
                        text: result.company_name
                    },
                    {
                        text: result.company_number
                    },
                    {
                        text: formatDate(result.date_of_creation)
                    },
                    {
                        text: formatDate(result.date_of_cessation)
                    },
                    {
                        text: formatPostCode(result.address.postal_code)
                    }
                ];
            });
        } catch (err) {
            searchResults = [];
            logger.error(`${err}`);
        }

        res.render(templatePaths.DISSOLVED_SEARCH_RESULTS, {
            searchResults, searchTerm: companyName, templateName: templatePaths.DISSOLVED_SEARCH_RESULTS
        });
    } else {
        const errorText = errors.array().map((err) => err.msg).pop() as string;
        const companyNameErrorData: GovUkErrorData = createGovUkErrorData(errorText, "#companyName", true, "");
        res.render(templatePaths.DISSOLVED_INDEX, {
            companyNameErrorData,
            errorList: [companyNameErrorData],
            templateName: templatePaths.NO_RESULTS
        });
    }

};

export const formatPostCode = (postCode) => {
    let halfPostCode;
    let trimmedPostCode;

    if (postCode != null) {
        const newPostCode = postCode.split(" "); 
        halfPostCode = newPostCode[0];

        trimmedPostCode = halfPostCode.slice(0, 4);
    }

    return trimmedPostCode;
}

export const formatDate = (date) => {
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);
    let monthWord;

    switch (month) {
    case "01":
        monthWord = "Jan";
        break;
    case "02":
        monthWord = "Feb";
        break;
    case "03":
        monthWord = "Mar";
        break;
    case "04":
        monthWord = "Apr";
        break;
    case "05":
        monthWord = "May";
        break;
    case "06":
        monthWord = "Jun";
        break;
    case "07":
        monthWord = "Jul";
        break;
    case "08":
        monthWord = "Aug";
        break;
    case "09":
        monthWord = "Sep";
        break;
    case "10":
        monthWord = "Oct";
        break;
    case "11":
        monthWord = "Nov";
        break;
    case "12":
        monthWord = "Dec";
        break;
    default:
        monthWord = month;
    }

    const dateToReturn = [day, monthWord, year].join(" ");

    return dateToReturn;
}

export default [...validators, route];

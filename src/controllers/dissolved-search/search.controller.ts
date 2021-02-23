import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/types";
import { createLogger } from "@companieshouse/structured-logging-node";
import { SEARCH_WEB_COOKIE_NAME, API_KEY, APPLICATION_NAME } from "../../config/config";
import { getDissolvedCompanies } from "../../client/apiclient";
import * as templatePaths from "../../model/template.paths";
import * as errorMessages from "../../model/error.messages";

import escape from "escape-html";
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
        let postCode, halfPostCode;
        let town;
        let incorpDate, incorpDateFormatted, dissolvedDate;

        function formatDate(date){
            
            let year = date.slice(0, 4);
            let month = date.slice(4, 6);
            let day = date.slice(6, 8);

            let dateToReturn = [day, month, year].join(" ");

            var d = new Date(dateToReturn);

            return dateToReturn;

        }

        try {
            const companyResource: CompaniesResource =
                await getDissolvedCompanies(API_KEY, companyName, cookies.get(SEARCH_WEB_COOKIE_NAME));
            const topHit: object = companyResource.top_hit;
            let noNearestMatch: boolean = true;
            searchResults = companyResource.items.map((result) => {

                if (result.address.postal_code != null){
                    postCode = result.address.postal_code.split(" ");
                    halfPostCode = postCode[0];
                }

                if (result.address.locality == null) {
                    town = " ";
                }
                else {
                    town = result.address.locality;
                }

                incorpDate = result.date_of_creation;
                incorpDateFormatted = new Date(incorpDate);

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
                        text: town
                    },
                    {
                        text: halfPostCode
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
    };
};

export default [...validators, route];

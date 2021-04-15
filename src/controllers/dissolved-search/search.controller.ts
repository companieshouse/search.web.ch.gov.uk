import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/dissolved-search/types";
import { createLogger } from "@companieshouse/structured-logging-node";
import { getDissolvedCompanies } from "../../client/apiclient";

import { SEARCH_WEB_COOKIE_NAME, API_KEY, APPLICATION_NAME, LAST_UPDATED_MESSAGE } from "../../config/config";
import { formatDate, formatPostCode, sanitiseCompanyName } from "../utils";
import * as templatePaths from "../../model/template.paths";
import * as errorMessages from "../../model/error.messages";
import Cookies = require("cookies");

const logger = createLogger(APPLICATION_NAME);

const validators = [
    check("companyName").not().isEmpty().withMessage(errorMessages.COMPANY_NAME_EMPTY)
];

const ALPHABETICAL_SEARCH_TYPE: string = "alphabetical";
const BEST_MATCH_SEARCH_TYPE: string = "bestMatch";
const PREVIOUS_NAME_SEARCH_TYPE: string = "previousNameDissolved";

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        const companyNameRequestParam: string = req.query.companyName as string;
        const searchTypeRequestParam: string = req.query.searchType as string;
        const changeNameTypeParam: string = req.query.changedName as string;
        const companyName: string = companyNameRequestParam;
        const encodedCompanyName: string = encodeURIComponent(companyName);
        Date();
        const lastUpdatedMessage: string = LAST_UPDATED_MESSAGE;

        let searchResults;
        let searchType: string;

        try {
            if (searchTypeRequestParam === ALPHABETICAL_SEARCH_TYPE && changeNameTypeParam === BEST_MATCH_SEARCH_TYPE) {
                searchType = ALPHABETICAL_SEARCH_TYPE;
            } 
             else if (changeNameTypeParam === PREVIOUS_NAME_SEARCH_TYPE) {
                searchType = PREVIOUS_NAME_SEARCH_TYPE;
            } else {
                searchType = BEST_MATCH_SEARCH_TYPE;
            }

            const companyResource: CompaniesResource =
                await getDissolvedCompanies(API_KEY, encodedCompanyName, cookies.get(SEARCH_WEB_COOKIE_NAME), searchType);

            const topHit = companyResource.top_hit;
            let noNearestMatch: boolean = true;
            searchResults = companyResource.items.map((result) => {
                let nearestClass: string = "";

                if (result.company_name === topHit.company_name && noNearestMatch && searchType === ALPHABETICAL_SEARCH_TYPE) {
                    nearestClass = "nearest";
                    noNearestMatch = false;
                }
                if (searchType === PREVIOUS_NAME_SEARCH_TYPE) {
                    for (var value in result.previous_company_names) {
                        let previousCompanyName = result.previous_company_names[value].name;
                        console.log("*************************");
                        console.log(value);
                        console.log(previousCompanyName);
                        console.log(companyNameRequestParam);
                        if (previousCompanyName.toLowerCase().includes(companyNameRequestParam.toLowerCase())) {
                            console.log("AHAH! I have found a match.");
                            console.log("The match is: " + previousCompanyName);
                            //What if in here we append to a new array, and then print all the names in the array corresponding to a certain company?
                            return [
                                {
                                    html: sanitiseCompanyName(previousCompanyName)
                                },
                                {
                                    html: sanitiseCompanyName(result.company_name)
                                },
                                {
                                    text: result.company_number
                                },
                                {
                                    text: formatDate(result.date_of_creation)
                                },
                                {
                                    text: formatDate(result.date_of_cessation),
                                    classes: "govuk-table__cell no-wrap"
                                },
                                {
                                    text: formatPostCode(result.address.postal_code)
                                }
                            ];
                        }
                        continue;
                    }
                } else {
                    return [
                        {
                            classes: nearestClass,
                            html: sanitiseCompanyName(result.company_name)
                        },
                        {
                            text: result.company_number
                        },
                        {
                            text: formatDate(result.date_of_creation)
                        },
                        {
                            text: formatDate(result.date_of_cessation),
                            classes: "govuk-table__cell no-wrap"
                        },
                        {
                            text: formatPostCode(result.address.postal_code)
                        }
                    ];
                }
            });
        } catch (err) {
            searchResults = [];
            logger.error(`${err}`);
        }

        if (changeNameTypeParam === PREVIOUS_NAME_SEARCH_TYPE){
            res.render(templatePaths.DISSOLVED_SEARCH_RESULTS_PREVIOUS_NAME, {
                searchResults, searchedName: companyName, templateName: templatePaths.DISSOLVED_SEARCH_RESULTS_PREVIOUS_NAME, lastUpdatedMessage
            });
        };

        res.render(templatePaths.DISSOLVED_SEARCH_RESULTS, {
            searchResults, searchedName: companyName, templateName: templatePaths.DISSOLVED_SEARCH_RESULTS, lastUpdatedMessage
        });
    } else {
        const errorText = errors.array().map((err) => err.msg).pop() as string;
        const companyNameErrorData: GovUkErrorData = createGovUkErrorData(errorText, "#companyName", true, "");
        res.render(templatePaths.DISSOLVED_INDEX, {
            companyNameErrorData,
            errorList: [companyNameErrorData]
        });
    }
};

export default [...validators, route];

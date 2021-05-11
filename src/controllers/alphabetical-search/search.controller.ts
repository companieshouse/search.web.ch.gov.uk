import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";
import { CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/types";
import { createLogger } from "@companieshouse/structured-logging-node";
import { SEARCH_WEB_COOKIE_NAME, API_KEY, APPLICATION_NAME } from "../../config/config";
import { getCompanies } from "../../client/apiclient";
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
        const encodedCompanyName: string = encodeURIComponent(companyName);
        let searchResults;
        let previousUrl;
        let nextUrl;
        let showPrevLink;
        let showNextLink;
        let slicedCompanyResource;

        try {
            const companyResource: CompaniesResource =
                await getCompanies(API_KEY, encodedCompanyName, cookies.get(SEARCH_WEB_COOKIE_NAME));

            const topHit: string = companyResource.topHit;
            const lastIndexPosition = companyResource.results.length - 1;
            let noNearestMatch: boolean = true;
            let originalCompanyNumber;

            if (companyResource.results.length > 20) {
                slicedCompanyResource = companyResource.results.slice(20, 61);
            }

            searchResults = slicedCompanyResource.map((result) => {
                const status = result?.items.company_status;
                let capitalisedStatus: string = "";
                let nearestClass: string = "";

                if (status !== undefined) {
                    capitalisedStatus = status.charAt(0).toUpperCase() + status.slice(1);
                }

                if (result.items.corporate_name === topHit && noNearestMatch) {
                    if (!req.query.originalCompanyNumber) {
                        originalCompanyNumber = result?.items.company_number;
                    } else {
                        originalCompanyNumber = req.query.originalCompanyNumber;
                    }
                    if (result?.items.company_number === originalCompanyNumber) {
                        nearestClass = "nearest";
                        noNearestMatch = false;
                    }
                }

                const sanitisedCorporateName = escape(result?.items.corporate_name);

                return [
                    {
                        classes: nearestClass,
                        html: `<a href="${result.links.self}">${sanitisedCorporateName}</a>`
                    },
                    {
                        text: result?.items.company_number
                    },
                    {
                        text: capitalisedStatus
                    }
                ];
            });

            if (req.query.originalCompanyNumber) {
                originalCompanyNumber = req.query.originalCompanyNumber;
            }

            previousUrl = "get-results?companyName=" + companyResource.results[0]?.items.corporate_name.replace(/\s/g, "+") + "&originalCompanyNumber=" + originalCompanyNumber;
            nextUrl = "get-results?companyName=" + companyResource.results[lastIndexPosition]?.items.corporate_name.replace(/\s/g, "+") + "&originalCompanyNumber=" + originalCompanyNumber;

            showPrevLink = !req.url.includes(previousUrl);
            showNextLink = !req.url.includes(nextUrl);
        } catch (err) {
            searchResults = [];
            logger.error(`${err}`);
        }
        res.render(templatePaths.ALPHABETICAL_SEARCH_RESULTS, {
            searchResults, previousUrl, nextUrl, showPrevLink, showNextLink, searchTerm: companyName, templateName: templatePaths.ALPHABETICAL_SEARCH_RESULTS
        });
    } else {
        const errorText = errors.array().map((err) => err.msg).pop() as string;
        const companyNameErrorData: GovUkErrorData = createGovUkErrorData(errorText, "#companyName", true, "");
        res.render(templatePaths.ALPHABETICAL_INDEX, {
            companyNameErrorData,
            errorList: [companyNameErrorData]
        });
    }
};

export default [...validators, route];

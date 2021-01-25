import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import Cookies = require("cookies");
import { getCompanies } from "../client/apiclient";
import * as templatePaths from "../model/template.paths";
import * as errorMessages from "../model/error.messages";
import { SEARCH_WEB_COOKIE_NAME, API_KEY, APPLICATION_NAME } from "../config/config";
import escape from "escape-html";
import { AlphabeticalSearchPostRequest, CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/types";
import { createLogger } from "ch-structured-logging";

const logger = createLogger(APPLICATION_NAME);

const validators = [
  check("companyName").not().isEmpty().withMessage(errorMessages.COMPANY_NAME_EMPTY),
];

const route = async (req: Request, res: Response) => {

  const cookies = new Cookies(req, res);
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const companyNameRequestParam: string = req.query.companyName as string;
    const companyName: AlphabeticalSearchPostRequest = { company_name: companyNameRequestParam };
    let searchResults;

    try {
      const companyResource: CompaniesResource =
        await getCompanies(API_KEY, companyName, cookies.get(SEARCH_WEB_COOKIE_NAME));
      const topHit: string  = companyResource.topHit;
      let noNearestMatch: boolean = true;
      searchResults = companyResource.results.map((result) => {
        const status = result.items.company_status;
        let capitalisedStatus: string = "";
        let nearestClass: string = "";
        if (status !== undefined) {
          capitalisedStatus = status.charAt(0).toUpperCase() + status.slice(1);
        }

        if (result.items.corporate_name === topHit && noNearestMatch) {
          nearestClass = "nearest";
          noNearestMatch = false;
        }

        const sanitisedCorporateName = escape(result.items.corporate_name);

        return [
          {
            classes: nearestClass,
            html: `<a href="${result.links.self}">${sanitisedCorporateName}</a>`,
          },
          {
            text: result.items.company_number,
          },
          {
            text: capitalisedStatus,
          },
        ];
      });
    } catch (err) {
      searchResults = [];
      logger.error(`${err}`);
    }

    res.render(templatePaths.SEARCH_RESULTS, {
      searchResults, searchTerm: companyName, templateName: templatePaths.SEARCH_RESULTS,
    });
  } else {
    const errorText = errors.array().map((err) => err.msg).pop() as string;
    const companyNameErrorData: GovUkErrorData = createGovUkErrorData(errorText, "#companyName", true, "");
    res.render(templatePaths.INDEX, {
      companyNameErrorData,
      errorList: [companyNameErrorData],
      templateName: templatePaths.NO_RESULTS,
    });
  }
};

export default [...validators, route];

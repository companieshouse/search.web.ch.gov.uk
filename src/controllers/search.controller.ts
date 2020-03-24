import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import Cookies = require("cookies");

import { CompaniesResource, getCompanies } from "../client/apiclient";
import * as templatePaths from "../model/template.paths";
import * as errorMessages from "../model/error.messages";
import { SEARCH_WEB_COOKIE_NAME } from "../config/config";

const validators = [
  check("companyName").not().isEmpty().withMessage(errorMessages.COMPANY_NAME_EMPTY),
];

const route = async (req: Request, res: Response) => {

  const cookies = new Cookies(req, res);

  const errors = validationResult(req);

  if (errors.isEmpty()) {

    const companyName: string = req.query.companyName;
    let searchResults;

    try {
      const companyResource: CompaniesResource = await getCompanies(companyName, cookies.get(SEARCH_WEB_COOKIE_NAME));
      let topHit: string  = companyResource.topHit;
      searchResults = companyResource.results.map((result) => {
        const status = result.items.company_status;
        let capitalisedStatus: string = "";
        let nearestClass: string = "";
        if (status !== undefined) {
          capitalisedStatus = status.charAt(0).toUpperCase() + status.slice(1);
        }

        if (result.items.corporate_name === topHit) {
          nearestClass = "nearest";
        }

        return [
          {
            html: `<a href="${result.links.self}">${result.items.corporate_name}</a>`,
            classes: nearestClass,
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
      console.log(err);
    }

    res.render(templatePaths.SEARCH_RESULTS, { searchResults, searchTerm: companyName });
  } else {
    const errorText = errors.array().map((err) => err.msg).pop() as string;
    const companyNameErrorData: GovUkErrorData = createGovUkErrorData(errorText, "#companyName", true, "");
    res.render(templatePaths.INDEX, {
      companyNameErrorData,
      errorList: [companyNameErrorData],
      templateName: templatePaths.INDEX,
    });
  }
};

export default [...validators, route];

import {Request, Response} from "express";
import {CompaniesResource, getCompanies} from "../client/apiclient";
import * as templatePaths from "../model/template.paths";

export default async (req: Request, res: Response) => {
    const companyName: string = req.query["company-name"];

    const companyResource: CompaniesResource = await getCompanies(companyName);
    const searchResults = companyResource.results.map((result) => {

        const status = result.items.company_status;
        const capitalisedStatus = status.charAt(0).toUpperCase() + status.slice(1);
        return  [
              {
                html: "<a href='" + result.links.self + "'>" + result.items.corporate_name + "</a>",
              },
              {
                text: result.items.company_number,
              },
              {
                text: capitalisedStatus,
              },
            ];
    });

    res.render(templatePaths.SEARCH_RESULTS, {searchResults});
};

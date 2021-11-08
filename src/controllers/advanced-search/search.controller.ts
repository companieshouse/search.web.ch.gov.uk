import { Request, Response } from "express";
import { changeDateFormat, getPagingRange, buildPagingUrl, mapCompanyStatusCheckboxes } from "../utils/utils";
import { advancedSearchValidationRules, validate } from "../utils/advanced-search-validation";
import { validationResult } from "express-validator";
import * as templatePaths from "../../model/template.paths";
import { AdvancedSearchParams } from "model/advanced.search.params";
import { getSearchResults } from "../../service/advanced-search/search.service";
import Cookies = require("cookies");

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const page = req.query.page ? Number(req.query.page) : 1;
    const incorporatedFrom = req.query.incorporatedFrom as string || null;
    const incorporatedTo = req.query.incorporatedTo as string || null;
    const advancedSearchParams: AdvancedSearchParams = {
        page: page,
        companyNameIncludes: req.query.companyNameIncludes as string || null,
        companyNameExcludes: req.query.companyNameExcludes as string || null,
        location: req.query.registeredOfficeAddress as string || null,
        incorporatedFrom: incorporatedFrom !== null ? changeDateFormat(incorporatedFrom) : null,
        incorporatedTo: incorporatedTo !== null ? changeDateFormat(incorporatedTo) : null,
        sicCodes: req.query.sicCodes as string || null,
        companyStatus: req.query.status as string || null,
        companyType: null,
        dissolvedFrom: null,
        dissolvedTo: null
    };
    const selectedStatusCheckboxes = mapCompanyStatusCheckboxes(advancedSearchParams.companyStatus);

    const errors = validationResult(req);
    const errorList = validate(errors);

    if (!errors.isEmpty()) {
        return res.render(templatePaths.ADVANCED_SEARCH_RESULTS, { ...errorList, advancedSearchParams, incorporatedFrom, incorporatedTo, selectedStatusCheckboxes });
    };

    const { companyResource, searchResults } = await getSearchResults(advancedSearchParams, cookies);
    const numberOfPages: number = Math.ceil(companyResource.hits / 20);
    const pagingRange = getPagingRange(page, numberOfPages);
    const partialHref: string = buildPagingUrl(advancedSearchParams, incorporatedFrom, incorporatedTo);

    return res.render(templatePaths.ADVANCED_SEARCH_RESULTS,
        { searchResults, advancedSearchParams, page, numberOfPages, pagingRange, partialHref, incorporatedFrom, incorporatedTo, selectedStatusCheckboxes });
};

export default [...advancedSearchValidationRules, route];

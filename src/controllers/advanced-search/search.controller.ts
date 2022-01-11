import { Request, Response } from "express";
import { getPagingRange, buildPagingUrl, mapCompanyStatusCheckboxes, mapCompanyTypeCheckboxes, mapAdvancedSearchParams } from "../utils/utils";
import { advancedSearchValidationRules, validate } from "../utils/advanced-search-validation";
import { validationResult } from "express-validator";
import * as templatePaths from "../../model/template.paths";
import { AdvancedSearchParams } from "../../model/advanced.search.params";
import { getSearchResults } from "../../service/advanced-search/search.service";
import { ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD } from "../../config/config";
import Cookies = require("cookies");

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const page = req.query.page ? Number(req.query.page) : 1;
    const incorporatedFrom = req.query.incorporatedFrom as string || null;
    const incorporatedTo = req.query.incorporatedTo as string || null;
    const dissolvedFrom = req.query.dissolvedFrom as string || null;
    const dissolvedTo = req.query.dissolvedTo as string || null;

    const advancedSearchParams: AdvancedSearchParams = mapAdvancedSearchParams(page, req.query.companyNameIncludes as string || null, req.query.companyNameExcludes as string || null, req.query.registeredOfficeAddress as string || null,
        req.query.incorporatedFrom as string || null, req.query.incorporatedTo as string || null, req.query.sicCodes as string || null, req.query.status as string || null, req.query.type as string || null,
        req.query.dissolvedFrom as string || null, req.query.dissolvedTo as string || null, null);

    const selectedStatusCheckboxes = mapCompanyStatusCheckboxes(advancedSearchParams.companyStatus);
    const selectedTypeCheckboxes = mapCompanyTypeCheckboxes(advancedSearchParams.companyType);
    const errors = validationResult(req);
    const errorList = validate(errors);

    if (!errors.isEmpty()) {
        return res.render(templatePaths.ADVANCED_SEARCH_RESULTS, { ...errorList, advancedSearchParams, incorporatedFrom, incorporatedTo, selectedStatusCheckboxes, selectedTypeCheckboxes, dissolvedFrom, dissolvedTo, ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD });
    }

    const { companyResource, searchResults } = await getSearchResults(advancedSearchParams, cookies);
    const totalReturnedHitsFormatted: string = companyResource.hits.toLocaleString();
    const numberOfPages: number = Math.ceil(companyResource.hits / 20);
    const pagingRange = getPagingRange(page, numberOfPages);
    const partialHref: string = buildPagingUrl(advancedSearchParams, incorporatedFrom, incorporatedTo, dissolvedFrom, dissolvedTo);

    return res.render(templatePaths.ADVANCED_SEARCH_RESULTS,
        { searchResults, advancedSearchParams, page, numberOfPages, pagingRange, partialHref, incorporatedFrom, incorporatedTo, selectedStatusCheckboxes, selectedTypeCheckboxes, dissolvedFrom, dissolvedTo, ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD, totalReturnedHitsFormatted });
};

export default [...advancedSearchValidationRules, route];

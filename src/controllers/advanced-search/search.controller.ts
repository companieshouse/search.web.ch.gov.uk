import { Request, Response } from "express";
import { getPagingRange, buildPagingUrl, mapCompanyStatusCheckboxes, mapCompanyTypeCheckboxes, mapAdvancedSearchParams, formatNumberWithCommas } from "../utils/utils";
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
    const dissolvedFromDay = req.query.dissolvedFromDay as string || null;
    const dissolvedFromMonth = req.query.dissolvedFromMonth as string || null;
    const dissolvedFromYear = req.query.dissolvedFromYear as string || null;
    const dissolvedToDay = req.query.dissolvedToDay as string || null;
    const dissolvedToMonth = req.query.dissolvedToMonth as string || null;
    const dissolvedToYear = req.query.dissolvedToYear as string || null;

    const dissolvedFromDate = `${dissolvedFromDay}/${dissolvedFromMonth}/${dissolvedFromYear}`;
    const dissolvedToDate = `${dissolvedToDay}/${dissolvedToMonth}/${dissolvedToYear}`;

    const advancedSearchParams: AdvancedSearchParams = mapAdvancedSearchParams(page, req.query.companyNameIncludes as string || null, req.query.companyNameExcludes as string || null, req.query.registeredOfficeAddress as string || null,
        req.query.incorporatedFrom as string || null, req.query.incorporatedTo as string || null, req.query.sicCodes as string || null, req.query.status as string || null, req.query.type as string || null,
        dissolvedFromDate || null, dissolvedToDate || null, null);

    const selectedStatusCheckboxes = mapCompanyStatusCheckboxes(advancedSearchParams.companyStatus);
    const selectedTypeCheckboxes = mapCompanyTypeCheckboxes(advancedSearchParams.companyType);
    const errors = validationResult(req);
    const errorList = validate(errors);
    const ADV_SEARCH_NUM_OF_RESULTS_TO_DOWNLOAD = formatNumberWithCommas(ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD);

    if (!errors.isEmpty()) {
        return res.render(templatePaths.ADVANCED_SEARCH_RESULTS, { ...errorList, advancedSearchParams, incorporatedFrom, incorporatedTo, selectedStatusCheckboxes, selectedTypeCheckboxes, dissolvedFromDay, dissolvedFromMonth, dissolvedFromYear, dissolvedToDay, dissolvedToMonth, dissolvedToYear, ADV_SEARCH_NUM_OF_RESULTS_TO_DOWNLOAD });
    }

    const { companyResource, searchResults } = await getSearchResults(advancedSearchParams, cookies);
    const totalReturnedHits: number = companyResource.hits;
    const totalReturnedHitsFormatted: string = companyResource.hits.toLocaleString();
    const numberOfPages: number = Math.ceil(companyResource.hits / 20);
    const pagingRange = getPagingRange(page, numberOfPages);
    const partialHref: string = buildPagingUrl(advancedSearchParams, incorporatedFrom, incorporatedTo, dissolvedFromDay, dissolvedFromMonth, dissolvedFromYear, dissolvedToDay, dissolvedToMonth, dissolvedToYear);

    return res.render(templatePaths.ADVANCED_SEARCH_RESULTS,
        { searchResults, advancedSearchParams, page, numberOfPages, pagingRange, partialHref, incorporatedFrom, incorporatedTo, selectedStatusCheckboxes, selectedTypeCheckboxes, dissolvedFromDay, dissolvedFromMonth, dissolvedFromYear, dissolvedToDay, dissolvedToMonth, dissolvedToYear, ADV_SEARCH_NUM_OF_RESULTS_TO_DOWNLOAD, totalReturnedHitsFormatted, totalReturnedHits });
};

export default [...advancedSearchValidationRules, route];

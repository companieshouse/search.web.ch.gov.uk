import { Request, Response } from "express";
import { changeDateFormat, getPagingRange, buildPagingUrl, mapCompanyStatusCheckboxes, mapCompanyTypeCheckboxes } from "../utils/utils";
import { advancedSearchValidationRules, validate } from "../utils/advanced-search-validation";
import { validationResult } from "express-validator";
import * as templatePaths from "../../model/template.paths";
import { AdvancedSearchParams } from "model/advanced.search.params";
import { getSearchResults } from "../../service/advanced-search/search.service";
import Cookies = require("cookies");
import { ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD } from "../../config/config";

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const page = req.query.page ? Number(req.query.page) : 1;
    const incorporatedFrom = req.query.incorporatedFrom as string || null;
    const incorporatedTo = req.query.incorporatedTo as string || null;
    const dissolvedFrom = req.query.dissolvedFrom as string || null;
    const dissolvedTo = req.query.dissolvedTo as string || null;
    const advancedSearchParams: AdvancedSearchParams = {
        page: page,
        companyNameIncludes: req.query.companyNameIncludes as string || null,
        companyNameExcludes: req.query.companyNameExcludes as string || null,
        location: req.query.registeredOfficeAddress as string || null,
        incorporatedFrom: incorporatedFrom !== null ? changeDateFormat(incorporatedFrom) : null,
        incorporatedTo: incorporatedTo !== null ? changeDateFormat(incorporatedTo) : null,
        sicCodes: req.query.sicCodes as string || null,
        companyStatus: req.query.status as string || null,
        companyType: req.query.type as string || null,
        dissolvedFrom: dissolvedFrom !== null ? changeDateFormat(dissolvedFrom) : null,
        dissolvedTo: dissolvedTo !== null ? changeDateFormat(dissolvedTo) : null,
        size: null
    };
    const selectedStatusCheckboxes = mapCompanyStatusCheckboxes(advancedSearchParams.companyStatus);
    const selectedTypeCheckboxes = mapCompanyTypeCheckboxes(advancedSearchParams.companyType);
    const errors = validationResult(req);
    const errorList = validate(errors);

    if (!errors.isEmpty()) {
        return res.render(templatePaths.ADVANCED_SEARCH_RESULTS, { ...errorList, advancedSearchParams, incorporatedFrom, incorporatedTo, selectedStatusCheckboxes, selectedTypeCheckboxes, dissolvedFrom, dissolvedTo, ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD });
    };

    if (advancedSearchParams.companyType !== null) {
        advancedSearchParams.companyType = String(advancedSearchParams.companyType).replace("icvc", "icvc-securities,icvc-warrant,icvc-umbrella");
    }
    const { companyResource, searchResults } = await getSearchResults(advancedSearchParams, cookies);
    const numberOfPages: number = Math.ceil(companyResource.hits / 20);
    const pagingRange = getPagingRange(page, numberOfPages);
    const partialHref: string = buildPagingUrl(advancedSearchParams, incorporatedFrom, incorporatedTo, dissolvedFrom, dissolvedTo);

    return res.render(templatePaths.ADVANCED_SEARCH_RESULTS,
        { searchResults, advancedSearchParams, page, numberOfPages, pagingRange, partialHref, incorporatedFrom, incorporatedTo, selectedStatusCheckboxes, selectedTypeCheckboxes, dissolvedFrom, dissolvedTo, ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD });
};

export default [...advancedSearchValidationRules, route];

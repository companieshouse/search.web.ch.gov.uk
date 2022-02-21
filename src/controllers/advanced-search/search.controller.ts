import { Request, Response } from "express";
import { getPagingRange, buildPagingUrl, mapCompanyStatusCheckboxes, mapCompanyTypeCheckboxes, mapAdvancedSearchParams, formatNumberWithCommas, getDissolvedDatesFromParams } from "../utils/utils";
import { advancedSearchValidationRules, validate } from "../utils/advanced-search-validation";
import { validationResult } from "express-validator";
import * as templatePaths from "../../model/template.paths";
import { AdvancedSearchParams } from "../../model/advanced.search.params";
import { DissolvedDates, FullDissolvedDates } from "model/dissolved.dates.params";
import { getSearchResults } from "../../service/advanced-search/search.service";
import { ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD } from "../../config/config";
import Cookies = require("cookies");

const route = async (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const page = req.query.page ? Number(req.query.page) : 1;
    const incorporatedFrom = req.query?.incorporatedFrom as string || null;
    const incorporatedTo = req.query.incorporatedTo as string || null;
    const fullDissolvedDates: FullDissolvedDates = getDissolvedDatesFromParams(req);
    const dissolvedDates: DissolvedDates = {
        dissolvedFromDay: req.query?.dissolvedFromDay as string | null,
        dissolvedFromMonth: req.query?.dissolvedFromMonth as string | null,
        dissolvedFromYear: req.query?.dissolvedFromYear as string | null,
        dissolvedToDay: req.query?.dissolvedToDay as string | null,
        dissolvedToMonth: req.query?.dissolvedToMonth as string | null,
        dissolvedToYear: req.query?.dissolvedToYear as string | null
    };

    const advancedSearchParams: AdvancedSearchParams = mapAdvancedSearchParams(page, req.query.companyNameIncludes as string || null, req.query.companyNameExcludes as string || null, req.query.registeredOfficeAddress as string || null,
        req.query.incorporatedFrom as string || null, req.query.incorporatedTo as string || null, req.query.sicCodes as string || null, req.query.status as string || null, req.query.type as string || null,
        fullDissolvedDates.dissolvedFromDate || null, fullDissolvedDates.dissolvedToDate || null, null);

    const selectedStatusCheckboxes = mapCompanyStatusCheckboxes(advancedSearchParams.companyStatus);
    const selectedTypeCheckboxes = mapCompanyTypeCheckboxes(advancedSearchParams.companyType);
    const errors = validationResult(req);
    const errorList = validate(errors);
    const ADV_SEARCH_NUM_OF_RESULTS_TO_DOWNLOAD = formatNumberWithCommas(ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD);

    if (!errors.isEmpty()) {
        return res.render(templatePaths.ADVANCED_SEARCH_RESULTS, { ...errorList, ...dissolvedDates, advancedSearchParams, incorporatedFrom, incorporatedTo, selectedStatusCheckboxes, selectedTypeCheckboxes, ADV_SEARCH_NUM_OF_RESULTS_TO_DOWNLOAD });
    }

    const { companyResource, searchResults } = await getSearchResults(advancedSearchParams, cookies);
    const totalReturnedHits: number = companyResource.hits;
    const totalReturnedHitsFormatted: string = companyResource.hits.toLocaleString();
    const numberOfPages: number = Math.ceil(companyResource.hits / 20);
    const pagingRange = getPagingRange(page, numberOfPages);
    const partialHref: string = buildPagingUrl(advancedSearchParams, incorporatedFrom, incorporatedTo, dissolvedDates);

    return res.render(templatePaths.ADVANCED_SEARCH_RESULTS,
        { ...dissolvedDates, searchResults, advancedSearchParams, page, numberOfPages, pagingRange, partialHref, incorporatedFrom, incorporatedTo, selectedStatusCheckboxes, selectedTypeCheckboxes, ADV_SEARCH_NUM_OF_RESULTS_TO_DOWNLOAD, totalReturnedHitsFormatted, totalReturnedHits });
};

export default [...advancedSearchValidationRules, route];

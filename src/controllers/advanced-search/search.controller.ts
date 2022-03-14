import { Request, Response } from "express";
import { getPagingRange, buildPagingUrl, mapCompanyStatusCheckboxes, mapCompanyTypeCheckboxes,
    mapCompanySubtypeCheckboxes, mapAdvancedSearchParams, formatNumberWithCommas, getDatesFromParams } from "../utils/utils";
import { advancedSearchValidationRules, validate } from "../utils/advanced-search-validation";
import { validationResult } from "express-validator";
import * as templatePaths from "../../model/template.paths";
import { AdvancedSearchParams } from "../../model/advanced.search.params";
import { DissolvedDates, IncorporationDates } from "model/date.params";
import { getSearchResults } from "../../service/advanced-search/search.service";
import { ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD } from "../../config/config";
import Cookies = require("cookies");

const route = async (req: Request, res: Response) => {
    // Elastic search returns a maximum of 10,000 company profiles in the resource
    const ELASTIC_SEARCH_MAX_RESULTS = 10000;
    const cookies = new Cookies(req, res);
    const page = req.query.page ? Number(req.query.page) : 1;
    const { fullDissolvedDates, fullIncorporationDates } = getDatesFromParams(req);
    const dissolvedDates: DissolvedDates = {
        dissolvedFromDay: req.query?.dissolvedFromDay as string | null,
        dissolvedFromMonth: req.query?.dissolvedFromMonth as string | null,
        dissolvedFromYear: req.query?.dissolvedFromYear as string | null,
        dissolvedToDay: req.query?.dissolvedToDay as string | null,
        dissolvedToMonth: req.query?.dissolvedToMonth as string | null,
        dissolvedToYear: req.query?.dissolvedToYear as string | null
    };
    const incorporationDates: IncorporationDates = {
        incorporationFromDay: req.query?.incorporationFromDay as string | null,
        incorporationFromMonth: req.query?.incorporationFromMonth as string | null,
        incorporationFromYear: req.query?.incorporationFromYear as string | null,
        incorporationToDay: req.query?.incorporationToDay as string | null,
        incorporationToMonth: req.query?.incorporationToMonth as string | null,
        incorporationToYear: req.query?.incorporationToYear as string | null
    };

    const advancedSearchParams: AdvancedSearchParams = mapAdvancedSearchParams(page, req.query.companyNameIncludes as string || null, req.query.companyNameExcludes as string || null, req.query.registeredOfficeAddress as string || null,
        fullIncorporationDates.incorporationFromDate || null, fullIncorporationDates.incorporationToDate || null, req.query.sicCodes as string || null, req.query.status as string || null, req.query.type as string || null,
        req.query.subtype as string || null,
        fullDissolvedDates.dissolvedFromDate || null, fullDissolvedDates.dissolvedToDate || null, null);

    const selectedStatusCheckboxes = mapCompanyStatusCheckboxes(advancedSearchParams.companyStatus);
    const selectedTypeCheckboxes = mapCompanyTypeCheckboxes(advancedSearchParams.companyType);
    const selectedSubtypeCheckboxes = mapCompanySubtypeCheckboxes(advancedSearchParams.companySubtype);
    const errors = validationResult(req);
    const errorList = validate(errors);
    const ADV_SEARCH_NUM_OF_RESULTS_TO_DOWNLOAD = formatNumberWithCommas(ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD);

    if (!errors.isEmpty()) {
        return res.render(templatePaths.ADVANCED_SEARCH_RESULTS, { ...errorList, ...dissolvedDates, ...incorporationDates, advancedSearchParams, 
            selectedStatusCheckboxes, selectedTypeCheckboxes, selectedSubtypeCheckboxes, ADV_SEARCH_NUM_OF_RESULTS_TO_DOWNLOAD });
    }

    const { companyResource, searchResults } = await getSearchResults(advancedSearchParams, cookies);
    const totalReturnedHits: number = companyResource.hits;
    const totalReturnedHitsFormatted: string = companyResource.hits.toLocaleString();
    const maximumDisplayableResults = totalReturnedHits <= ELASTIC_SEARCH_MAX_RESULTS ? totalReturnedHits : ELASTIC_SEARCH_MAX_RESULTS;
    const numberOfPages: number = Math.ceil(maximumDisplayableResults / 20);
    const pagingRange = getPagingRange(page, numberOfPages);
    const partialHref: string = buildPagingUrl(advancedSearchParams, incorporationDates, dissolvedDates);

    return res.render(templatePaths.ADVANCED_SEARCH_RESULTS,
        { ...dissolvedDates, ...incorporationDates, searchResults, advancedSearchParams, page, numberOfPages, pagingRange, partialHref,
             selectedStatusCheckboxes, selectedTypeCheckboxes, selectedSubtypeCheckboxes, ADV_SEARCH_NUM_OF_RESULTS_TO_DOWNLOAD, totalReturnedHitsFormatted, totalReturnedHits });
};

export default [...advancedSearchValidationRules, route];

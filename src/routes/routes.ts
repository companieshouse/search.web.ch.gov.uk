import { Router, Request, Response, NextFunction } from "express";
import { SEARCH_WEB_COOKIE_NAME } from "../config/config";
import { searchController as advancedSearchController } from "../controllers/advanced-search/index.controller";
import downloadController from "../controllers/advanced-search/download.controller";
import { searchController as alphabeticalSearchController } from "../controllers/alphabetical-search/index.controller";
import { searchController as dissolvedSearchController } from "../controllers/dissolved-search/index.controller";
import * as pageUrls from "../model/page.urls";
import * as templatePaths from "../model/template.paths";
import { BasketLink, getBasketLink } from "../controllers/utils/utils";
import { mapPageHeader } from "../utils/page.header.utils";
import uuid = require("uuid/v4");
import Cookies = require("cookies");

const router = Router();

/**
 * Simply renders a view template.
 *ß
 * @param template the template name
 */
const renderTemplate = (template: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cookies = new Cookies(req, res);
        const basketLink: BasketLink = await getBasketLink(req);
        const pageHeader = mapPageHeader(req);

        if (cookies === undefined || cookies.get(SEARCH_WEB_COOKIE_NAME) === undefined) {
            cookies.set(SEARCH_WEB_COOKIE_NAME, uuid());
        }

        return res.render(template, { ...basketLink, ...pageHeader });
    } catch (error) {
        next(error);
    }
};

router.get(pageUrls.ADVANCED_ROOT, renderTemplate(templatePaths.ADVANCED_INDEX));
router.get(pageUrls.ADVANCED_GET_RESULTS, advancedSearchController);
router.get(pageUrls.ADVANCED_DOWNLOAD, downloadController);

router.get(pageUrls.ALPHABETICAL_ROOT, renderTemplate(templatePaths.ALPHABETICAL_INDEX));
router.get(pageUrls.ALPHABETICAL_GET_RESULTS, alphabeticalSearchController);

router.get(pageUrls.DISSOLVED_ROOT, renderTemplate(templatePaths.DISSOLVED_INDEX));
router.get(pageUrls.DISSOLVED_GET_RESULTS, dissolvedSearchController);

export default router;

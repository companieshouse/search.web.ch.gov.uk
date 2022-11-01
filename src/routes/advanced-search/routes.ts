import { Router, Request, Response, NextFunction } from "express";
import { SEARCH_WEB_COOKIE_NAME } from "../../config/config";
import { searchController } from "../../controllers/advanced-search/index.controller";
import downloadController from "../../controllers/advanced-search/download.controller";
import * as pageUrls from "../../model/page.urls";
import * as templatePaths from "../../model/template.paths";
import { BasketLink, getBasketLink } from "../../controllers/utils/utils";
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

        if (cookies === undefined || cookies.get(SEARCH_WEB_COOKIE_NAME) === undefined) {
            cookies.set(SEARCH_WEB_COOKIE_NAME, uuid());
        }

        return res.render(template, basketLink);
    } catch (error) {
        next(error);
    }
};

router.get(pageUrls.ADVANCED_ROOT, renderTemplate(templatePaths.ADVANCED_INDEX));
router.get(pageUrls.ADVANCED_GET_RESULTS, searchController);
router.get(pageUrls.ADVANCED_DOWNLOAD, downloadController);

export default router;

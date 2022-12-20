import { Router, Request, Response, NextFunction } from "express";
import { searchController } from "../../controllers/dissolved-search/index.controller";
import { SEARCH_WEB_COOKIE_NAME } from "../../config/config";
import * as pageUrls from "../../model/page.urls";
import * as templatePaths from "../../model/template.paths";
import { BasketLink, getBasketLink } from "../../controllers/utils/utils";
import { mapPageHeader } from "../../utils/page.header.utils";
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

router.get(pageUrls.DISSOLVED_ROOT, renderTemplate(templatePaths.DISSOLVED_INDEX));
router.get(pageUrls.DISSOLVED_GET_RESULTS, searchController);

export default router;

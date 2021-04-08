import { Router, Request, Response } from "express";
import { searchController } from "../../controllers/dissolved-search/index.controller";
import { SEARCH_WEB_COOKIE_NAME } from "../../config/config";
import * as pageUrls from "../../model/page.urls";
import * as templatePaths from "../../model/template.paths";
import uuid = require("uuid/v4");
import Cookies = require("cookies");

const router = Router();

/**
 * Simply renders a view template.
 *ß
 * @param template the template name
 */
const renderTemplate = (template: string) => (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);

    if (cookies === undefined || cookies.get(SEARCH_WEB_COOKIE_NAME) === undefined) {
        cookies.set(SEARCH_WEB_COOKIE_NAME, uuid());
    }

    return res.render(template);
};

router.get(pageUrls.DISSOLVED_ROOT, renderTemplate(templatePaths.DISSOLVED_INDEX));
router.get(pageUrls.DISSOLVED_GET_RESULTS, searchController);
router.get(pageUrls.DISSOLVED_PREVIOUS_NAME_GET_RESULTS, searchController);

export default router;

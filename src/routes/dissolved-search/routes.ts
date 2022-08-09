import { Router, Request, Response } from "express";
import { searchController } from "../../controllers/dissolved-search/index.controller";
import { ACCOUNT_URL, CHS_MONITOR_GUI_URL, SEARCH_WEB_COOKIE_NAME } from "../../config/config";
import * as pageUrls from "../../model/page.urls";
import * as templatePaths from "../../model/template.paths";
import uuid = require("uuid/v4");
import Cookies = require("cookies");
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";

const router = Router();

/**
 * Simply renders a view template.
 *ß
 * @param template the template name
 */
const renderTemplate = (template: string) => (req: Request, res: Response) => {
    const cookies = new Cookies(req, res);
    const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;
    const userEmail = req.session?.data?.signin_info?.user_profile?.email;
    const accountUrl = ACCOUNT_URL;
    const followUrl = CHS_MONITOR_GUI_URL;

    if (cookies === undefined || cookies.get(SEARCH_WEB_COOKIE_NAME) === undefined) {
        cookies.set(SEARCH_WEB_COOKIE_NAME, uuid());
    }

    return res.render(template, { signedIn, userEmail, accountUrl, followUrl });
};

router.get(pageUrls.DISSOLVED_ROOT, renderTemplate(templatePaths.DISSOLVED_INDEX));
router.get(pageUrls.DISSOLVED_GET_RESULTS, searchController);

export default router;

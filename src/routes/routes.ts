import {Router, Request, Response} from "express";
import {searchController} from "../controllers/index.controller";
import * as pageUrls from "../model/page.urls";
import * as templatePaths from "../model/template.paths";
import uuid = require("uuid/v1");
import Cookies = require("cookies");

const router = Router();

/**
 * Simply renders a view template.
 *
 * @param template the template name
 */
const renderTemplate = (template: string) => (req: Request, res: Response) => {

  const cookies = new Cookies(req, res);

  if (cookies === undefined || cookies.get("search.web.user") === undefined) {
    cookies.set("search.web.user", uuid());
  }

  return res.render(template);
};

router.get(pageUrls.ROOT, renderTemplate(templatePaths.INDEX));
router.get(pageUrls.GET_RESULTS, searchController);

export default router;

import {Router, Request, Response} from "express";
import {searchController} from "../controllers/index.controller";
import * as pageUrls from "../model/page.urls";
import * as templatePaths from "../model/template.paths"

const router = Router();

/**
 * Simply renders a view template.
 *
 * @param template the template name
 */
const renderTemplate = (template: string) => (req: Request, res: Response) => {
  return res.render(template);
};

router.get(pageUrls.ROOT, renderTemplate(templatePaths.INDEX));
router.get(pageUrls.GET_RESULTS, searchController);

export default router;

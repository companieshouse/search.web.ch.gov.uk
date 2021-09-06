import { Request, Response } from "express";
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../../config/config";
import * as templatePaths from "../../model/template.paths";

import Cookies = require("cookies");

const logger = createLogger(APPLICATION_NAME);

const route = async (req: Request, res: Response) => {

    return res.render(templatePaths.ADVANCED_SEARCH_RESULTS)
};

export default [route];
import { NextFunction, Request, Response } from "express";
import * as errorMessages from "../model/error.messages";
import * as templatePaths from "../model/template.paths";
import { APPLICATION_NAME } from "../config/config";
import { createLogger } from "@companieshouse/structured-logging-node";

const logger = createLogger(APPLICATION_NAME);


/**
 * This handler catches all routes that don't match a handler i.e. 404 Not Found, because of its position
 * in the middleware chain.
 */
const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  logger.error(errorMessages.ERROR_404 + `${req.path}`);
  return res.status(404).render(templatePaths.ERROR_404);
};

/**
 * This handler catches any other error/exception thrown within the application. Always keep this as the
 * last handler in the chain for it to work.
 */
const errorHandler = async (err: unknown, req: Request, res: Response, next: NextFunction) => {
  logger.error(errorMessages.ERROR_500 + err);
  res.status(500).render(templatePaths.ERROR, {templateName: templatePaths.ERROR});
};

export default [notFoundHandler, errorHandler];

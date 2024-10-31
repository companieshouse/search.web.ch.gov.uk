import { NextFunction, Request, Response } from "express";
import * as errorMessages from "../model/error.messages";
import * as templatePaths from "../model/template.paths";
import { APPLICATION_NAME, CHS_URL } from "../config/config";
import { createLogger } from "@companieshouse/structured-logging-node";
import { PageHeader } from "../model/PageHeader";
import { mapPageHeader } from "../utils/page.header.utils";
import { CsrfError } from '@companieshouse/web-security-node';


const logger = createLogger(APPLICATION_NAME);
const SERVICE_URL = CHS_URL;

/**
 * This handler catches CSRF errors when a CRSF attack is detected.
 */
const csrfErrorHandler = (err: CsrfError | Error, req: Request, res: Response, next: NextFunction) => {
    // Handle non-CSRF Errors immediately
    if (!(err instanceof CsrfError)) {
      return next(err);
    }

    const pageHeader: PageHeader = mapPageHeader(req);
    return res.status(403).render(templatePaths.ERROR, {
        errorMessage: err,
        ...pageHeader,
        SERVICE_URL
    });
};

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
    res.status(500).render(templatePaths.ERROR, { templateName: templatePaths.ERROR });
};

export default [notFoundHandler, errorHandler];

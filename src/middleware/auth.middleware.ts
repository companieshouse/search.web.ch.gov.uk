import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { NextFunction, Request, Response } from "express";
import { getUserId } from "../session/helper";

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.path !== "/") {
            if (!req.session) {
                console.log(`${req.url}: Session object is missing!`);
            }
            const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

            if (!signedIn) {

                //If user isn't signed in, then the url is to the signin page. Text says Sign in to Download Report
                return res.redirect(`/signin?return_to=${returnToUrl}`);
            } else {

                //If the user is signed in the url is to the dowload report and the text says Download report
                const userId = getUserId(req.session);
            }
        }
        next();
    } catch (err) {
        logger.error(`Authentication middleware: ${err}`);
        next(err);
    }
};
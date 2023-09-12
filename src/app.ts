import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import Redis from "ioredis";
import cookieParser from "cookie-parser";
import actuator from "express-actuator";

import router from "./routes/routes";
import { ERROR_SUMMARY_TITLE } from "./model/error.messages";
import errorHandlers from "./controllers/error.controller";
import { ADVANCED_ROOT, ALPHABETICAL_ROOT, DISSOLVED_ROOT } from "./model/page.urls";
import { CookieConfig } from "@companieshouse/node-session-handler/lib/config/CookieConfig";
import { SessionMiddleware, SessionStore } from "@companieshouse/node-session-handler";
import {
    ALPHABETICAL_SERVICE_NAME,
    ADVANCED_SERVICE_NAME,
    CHS_URL,
    DISSOLVED_SERVICE_NAME,
    PIWIK_ALPHABETICAL_SERVICE_NAME,
    PIWIK_SITE_ID,
    PIWIK_URL,
    SERVICE_NAME_GENERIC,
    PIWIK_DISSOLVED_SERVICE_NAME,
    COOKIE_SECRET,
    COOKIE_DOMAIN,
    CACHE_SERVER,
    ALPHABETICAL_FEEDBACK_SOURCE,
    DISSOLVED_FEEDBACK_SOURCE,
    ADVANCED_FEEDBACK_SOURCE,
    PIWIK_ADVANCED_SERVICE_NAME,
    ROE_FEATURE_FLAG
} from "./config/config";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const actuatorOptions = {
    basePath: "/search-web"
};

app.use(actuator(actuatorOptions));

// where nunjucks templates should resolve to
const viewPath = path.join(__dirname, "views");

// set up the template engine
const env = nunjucks.configure([
    viewPath,
    "node_modules/govuk-frontend/",
    "node_modules/govuk-frontend/components"
], {
    autoescape: true,
    express: app
});

const cookieConfig: CookieConfig = { cookieName: "__SID", cookieSecret: COOKIE_SECRET, cookieDomain: COOKIE_DOMAIN };
const sessionStore = new SessionStore(new Redis(`redis://${CACHE_SERVER}`));

app.use(function (req, res, next) {
    res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
    next();
});
app.use(DISSOLVED_ROOT, SessionMiddleware(cookieConfig, sessionStore));
app.use(ADVANCED_ROOT, SessionMiddleware(cookieConfig, sessionStore));
app.use(ALPHABETICAL_ROOT, SessionMiddleware(cookieConfig, sessionStore));

app.set("views", viewPath);
app.set("view engine", "html");

// add global variables to all templates
env.addGlobal("CHS_URL", CHS_URL);
env.addGlobal("ERROR_SUMMARY_TITLE", ERROR_SUMMARY_TITLE);
env.addGlobal("PIWIK_URL", PIWIK_URL);
env.addGlobal("PIWIK_SITE_ID", PIWIK_SITE_ID);
env.addGlobal("CDN_URL", process.env.CDN_HOST);
env.addGlobal("ACCOUNT_URL", process.env.ACCOUNT_URL);
env.addGlobal("CHS_MONITOR_GUI_URL", process.env.CHS_MONITOR_GUI_URL);

app.use((req, res, next) => {
    if (req.path.includes("/alphabetical-search")) {
        env.addGlobal("SERVICE_NAME", ALPHABETICAL_SERVICE_NAME);
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_ALPHABETICAL_SERVICE_NAME);
        env.addGlobal("RESPONSIVE_TABLE", "");
        env.addGlobal("BACK_LINK", ALPHABETICAL_ROOT);
        env.addGlobal("FEEDBACK_SOURCE", ALPHABETICAL_FEEDBACK_SOURCE);
    } else if (req.path.includes("/dissolved-search")) {
        env.addGlobal("SERVICE_NAME", DISSOLVED_SERVICE_NAME);
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_DISSOLVED_SERVICE_NAME);
        env.addGlobal("RESPONSIVE_TABLE", "/search-assets/static/responsive-table.css");
        env.addGlobal("BACK_LINK", DISSOLVED_ROOT);
        env.addGlobal("FEEDBACK_SOURCE", DISSOLVED_FEEDBACK_SOURCE);
    } else if (req.path.includes("/advanced-search")) {
        env.addGlobal("SERVICE_NAME", ADVANCED_SERVICE_NAME);
        env.addGlobal("FEEDBACK_SOURCE", ADVANCED_FEEDBACK_SOURCE);
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_ADVANCED_SERVICE_NAME);
        env.addGlobal("RESPONSIVE_TABLE", "");
        env.addGlobal("ROE_FEATURE_FLAG", ROE_FEATURE_FLAG);
    } else {
        env.addGlobal("SERVICE_NAME", SERVICE_NAME_GENERIC);
        env.addGlobal("SERVICE_PATH", "");
    }
    next();
});

// serve static assets in development.
// this will execute in production for now, but we will host these else where in the future.
/*
if (process.env.NODE_ENV !== "production") {
    app.use("/search-assets/static", express.static("dist/static"));
    env.addGlobal("CSS_URL", "/search-assets/static/app.css");
    env.addGlobal("ALPHABETICAL_SEARCH", "/search-assets/static/alphabetical_search.css");
    env.addGlobal("NUMBERED_PAGING", "/search-assets/static/numbered_paging.css");
    env.addGlobal("MATCHER", "/search-assets/static/js/matcher.js");
    env.addGlobal("ALL", "/search-assets/static/js/all.js");
    env.addGlobal("MOBILE_MENU", "/search-assets/static/js/mobile-menu.js");
} else {
    app.use("/search-assets/static", express.static("static"));
    env.addGlobal("CSS_URL", "/search-assets/static/app.css");
    env.addGlobal("ALPHABETICAL_SEARCH", "/search-assets/static/alphabetical_search.css");
    env.addGlobal("NUMBERED_PAGING", "/search-assets/static/numbered_paging.css");
    env.addGlobal("MATCHER", "/search-assets/static/js/matcher.js");
    env.addGlobal("ALL", "/search-assets/static/js/all.js");
    env.addGlobal("MOBILE_MENU", "/search-assets/static/js/mobile-menu.js");
}
 */

// This ia another frivolous comment...
// This ia another frivolous comment...
app.use("/search-assets/static", express.static("static"));
env.addGlobal("CSS_URL", "/search-assets/static/app.css");
env.addGlobal("ALPHABETICAL_SEARCH", "/search-assets/static/alphabetical_search.css");
env.addGlobal("NUMBERED_PAGING", "/search-assets/static/numbered_paging.css");
env.addGlobal("MATCHER", "/search-assets/static/js/matcher.js");
env.addGlobal("ALL", "/search-assets/static/js/all.js");
env.addGlobal("MOBILE_MENU", "/search-assets/static/js/mobile-menu.js");

// apply our default router to /
app.use("/", router);
app.use(...errorHandlers);

export default app;

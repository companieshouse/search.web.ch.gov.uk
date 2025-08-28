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
import { CsrfProtectionMiddleware } from "@companieshouse/web-security-node";
import { getGOVUKFrontendVersion } from "@companieshouse/ch-node-utils";
import {
    APP_ASSETS_PATH,
    ALPHABETICAL_SERVICE_NAME,
    ADVANCED_SERVICE_NAME,
    CHS_URL,
    DISSOLVED_SERVICE_NAME,
    PIWIK_ALPHABETICAL_SERVICE_NAME,
    PIWIK_SITE_ID,
    PIWIK_URL,
    SERVICE_NAME_GENERIC,
    PIWIK_DISSOLVED_SERVICE_NAME,
    COOKIE_NAME,
    COOKIE_SECRET,
    COOKIE_DOMAIN,
    CACHE_SERVER,
    ALPHABETICAL_FEEDBACK_SOURCE,
    DISSOLVED_FEEDBACK_SOURCE,
    ADVANCED_FEEDBACK_SOURCE,
    PIWIK_ADVANCED_SERVICE_NAME,
    ROE_FEATURE_FLAG,
    FEATURE_GOVUK_REBRAND
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
    "node_modules/govuk-frontend/dist",
    "node_modules/govuk-frontend/dist/components",
    "node_modules/@companieshouse"
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

// Variables needed for ch-node-utils/template
env.addGlobal("cdnHost", "//" + process.env.CDN_HOST);
env.addGlobal("govukFrontendVersion", getGOVUKFrontendVersion());
env.addGlobal("govukRebrand", FEATURE_GOVUK_REBRAND);

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

app.use("/search-assets/static", express.static(APP_ASSETS_PATH));
env.addGlobal("CSS_URL", "/search-assets/static/app.css");
env.addGlobal("ALPHABETICAL_SEARCH", "/search-assets/static/alphabetical_search.css");
env.addGlobal("MATCHER", "/search-assets/static/js/matcher.js");
env.addGlobal("MOBILE_MENU", "/search-assets/static/js/mobile-menu.js");

// apply our default router to /
app.use("/", router);
app.use(...errorHandlers);

// CSRF Protection middleware
app.use(SessionMiddleware(cookieConfig, sessionStore));

const csrfProtectionMiddleware = CsrfProtectionMiddleware({
    sessionStore,
    enabled: true,
    sessionCookieName: COOKIE_NAME
});
app.use(csrfProtectionMiddleware);

export default app;

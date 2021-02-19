import express from "express";
import nunjucks from "nunjucks";
import path from "path";

import alphabeticalRouter from "./routes/alphabetical-search/routes";
import { ERROR_SUMMARY_TITLE } from "./model/error.messages";
import errorHandlers from "./controllers/error.controller";
import { ALPHABETICAL_SERVICE_NAME, DISSOLVED_SERVICE_NAME, PIWIK_SITE_ID, PIWIK_URL, SERVICE_NAME_GENERIC } from "./config/config";
import { ALPHABETICAL_ROOT, DISSOLVED_ROOT } from "./model/page.urls";

const app = express();

app.use(express.urlencoded({ extended: false }));

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

app.set("views", viewPath);
app.set("view engine", "html");

// add global variables to all templates
env.addGlobal("ERROR_SUMMARY_TITLE", ERROR_SUMMARY_TITLE);
env.addGlobal("PIWIK_URL", PIWIK_URL);
env.addGlobal("PIWIK_SITE_ID", PIWIK_SITE_ID);
env.addGlobal("CDN_URL", process.env.CDN_HOST);

app.use((req, res, next) => {
    if (req.path.includes("/alphabetical-search")) {
        env.addGlobal("SERVICE_NAME", ALPHABETICAL_SERVICE_NAME);
        env.addGlobal("BACK_LINK", ALPHABETICAL_ROOT);
    } else if (req.path.includes("/dissolved-search")) {
        env.addGlobal("SERVICE_NAME", DISSOLVED_SERVICE_NAME);
        env.addGlobal("BACK_LINK", DISSOLVED_ROOT);
    } else {
        env.addGlobal("SERVICE_NAME", SERVICE_NAME_GENERIC);
        env.addGlobal("SERVICE_PATH", "");
    }
    next();
});

// serve static assets in development.
// this will execute in production for now, but we will host these else where in the future.
if (process.env.NODE_ENV !== "production") {
    app.use("/alphabetical-search/static", express.static("dist/static"));
    env.addGlobal("CSS_URL", "/alphabetical-search/static/app.css");
    env.addGlobal("ALPHABETICAL_SEARCH", "/alphabetical-search/static/alphabetical_search.css");
    env.addGlobal("MATCHER", "/alphabetical-search/static/js/matcher.js");
} else {
    app.use("/alphabetical-search/static", express.static("static"));
    env.addGlobal("CSS_URL", "/alphabetical-search/static/app.css");
    env.addGlobal("ALPHABETICAL_SEARCH", "/alphabetical-search/static/alphabetical_search.css");
    env.addGlobal("MATCHER", "/alphabetical-search/static/js/matcher.js");
}
// apply our default router to /
app.use("/", alphabeticalRouter);
app.use(...errorHandlers);

export default app;

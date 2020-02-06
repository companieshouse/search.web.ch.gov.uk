import * as express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";

import router from "./routes/routes";
import {ERROR_SUMMARY_TITLE} from "./model/error.messages";
import errorHandlers from "./controllers/error.controller";

const app = express();

app.use(express.urlencoded({ extended: false }));

// where nunjucks templates should resolve to
const viewPath = path.join(__dirname, "views");

// set up the template engine
const env = nunjucks.configure([
  viewPath,
  "node_modules/govuk-frontend/",
  "node_modules/govuk-frontend/components",
], {
  autoescape: true,
  express: app,
});

app.set("views", viewPath);
app.set("view engine", "html");

// add global variables to all templates
env.addGlobal("ERROR_SUMMARY_TITLE", ERROR_SUMMARY_TITLE);
env.addGlobal("PIWIK_URL", "https://example.com");
env.addGlobal("PIWIK_SITE_ID", "123");

// serve static assets in development.
// this will execute in production for now, but we will host these else where in the future.
if (process.env.NODE_ENV !== "production") {
  app.use("/alphabetical-search/static", express.static("dist/static"));
  env.addGlobal("CSS_URL", "/alphabetical-search/static/app.css");
  env.addGlobal("FOOTER", "/alphabetical-search/static/footer.css");
} else {
  app.use("/alphabetical-search/static", express.static("static"));
  env.addGlobal("CSS_URL", "/alphabetical-search/static/app.css");
  env.addGlobal("FOOTER", "/alphabetical-search/static/footer.css");
}
// apply our default router to /
app.use("/alphabetical-search", router);
app.use(...errorHandlers);

export default app;

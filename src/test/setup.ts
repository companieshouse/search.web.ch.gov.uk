import chai from "chai";
import chaiHttp from "chai-http";

chai.use(chaiHttp);

process.env.ALPHABETICAL_SEARCH_URL = "http://localhost:4089/alphabetical-search/corporate-body";
process.env.CHS_API_KEY = "testauthkey";
process.env.SEARCH_WEB_COOKIE_NAME = "search.web.user";
process.env.PIWIK_URL = "test";
process.env.PIWIK_SITE_ID = "test";
process.env.API_URL = "http://apiurl.co";

import chai from "chai";
import chaiHttp from "chai-http";

chai.use(chaiHttp);

process.env.ALPHABETICAL_SEARCH_URL = "http://localhost:4089/alphabetical-search/corporate-body";
process.env.CHS_API_KEY = "testauthkey";
process.env.CHS_URL = "http://chs-url/";
process.env.SEARCH_WEB_COOKIE_NAME = "search.web.user";
process.env.PIWIK_URL = "test";
process.env.PIWIK_SITE_ID = "test";
process.env.API_URL = "http://apiurl.co";
process.env.LAST_UPDATED_MESSAGE = "test updated message";
process.env.DISSOLVED_SEARCH_NUMBER_OF_RESULTS = "20";
process.env.COOKIE_SECRET = "Xy6onkjQWF0TkRn0hfdqUw==";
process.env.COOKIE_DOMAIN = "cookie domain";
process.env.CACHE_SERVER = "secret";
process.env.ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD = "20";

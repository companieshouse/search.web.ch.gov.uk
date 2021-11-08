const getEnvironmentValue = (key: string, defaultValue?: any): string => {
    const isMandatory: boolean = !defaultValue;
    const value: string = process.env[key] || "";

    if (!value && isMandatory) {
        throw new Error(`Please set the environment variable "${key}"`);
    }

    return value || defaultValue as string;
};

export const ALPHABETICAL_SEARCH_URL = getEnvironmentValue("ALPHABETICAL_SEARCH_URL");
export const CHS_API_KEY = getEnvironmentValue("CHS_API_KEY");
export const CHS_URL = getEnvironmentValue("CHS_URL");
export const SEARCH_WEB_COOKIE_NAME = getEnvironmentValue("SEARCH_WEB_COOKIE_NAME");
export const PIWIK_URL = getEnvironmentValue("PIWIK_URL");
export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID");
export const API_URL = getEnvironmentValue("API_URL");
export const APPLICATION_NAME = "search.web.ch.gov.uk";
export const API_KEY = getEnvironmentValue("CHS_API_KEY");
export const COOKIE_SECRET = getEnvironmentValue("COOKIE_SECRET");
export const COOKIE_DOMAIN = getEnvironmentValue("COOKIE_DOMAIN");
export const CACHE_SERVER = getEnvironmentValue("CACHE_SERVER");

export const ALPHABETICAL_SERVICE_NAME = "Alphabetical company search";
export const PIWIK_ALPHABETICAL_SERVICE_NAME = "alphabetical-search";
export const DISSOLVED_SERVICE_NAME = "Dissolved company search";
export const PIWIK_DISSOLVED_SERVICE_NAME = "dissolved-search";
export const SERVICE_NAME_GENERIC = "";

export const LAST_UPDATED_MESSAGE = getEnvironmentValue("LAST_UPDATED_MESSAGE");
export const DISSOLVED_SEARCH_NUMBER_OF_RESULTS = Number(getEnvironmentValue("DISSOLVED_SEARCH_NUMBER_OF_RESULTS"));
export const ADVANCED_SEARCH_LAST_UPDATED = getEnvironmentValue("ADVANCED_SEARCH_LAST_UPDATED");

export const ALPHABETICAL_FEEDBACK_SOURCE = "alphabetical-search";
export const DISSOLVED_FEEDBACK_SOURCE = "dissolved-search";
export const ADVANCED_FEEDBACK_SOURCE = "advanced-search";

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

export const ALPHABETICAL_SERVICE_NAME = "Alphabetical company search";
export const PIWIK_ALPHABETICAL_SERVICE_NAME = "alphabetical-search";
export const DISSOLVED_SERVICE_NAME = "Dissolved company search";
export const PIWIK_DISSOLVED_SERVICE_NAME = "dissolved-search";
export const SERVICE_NAME_GENERIC = "";

export const LAST_UPDATED_MESSAGE = getEnvironmentValue("LAST_UPDATED_MESSAGE");

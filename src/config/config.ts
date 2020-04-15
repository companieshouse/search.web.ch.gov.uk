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
export const SEARCH_WEB_COOKIE_NAME = getEnvironmentValue("SEARCH_WEB_COOKIE_NAME");
export const PIWIK_URL = getEnvironmentValue("PIWIK_URL");
export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID");

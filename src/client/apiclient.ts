import axios, { AxiosResponse, AxiosError, Method, AxiosRequestConfig } from "axios";
import { ALPHABETICAL_SEARCH_URL, AUTH_KEY } from "../config/config";

const HTTP_POST: Method = "post";

export interface CompaniesResource {
    searchType: string;
    topHit: string;
    results: Result[];
}

export interface Result {
    ID: string;
    company_type: string;
    items: Items;
    links: Links;
}

export interface Items {
    company_number: string;
    company_status: string;
    corporate_name: string;
    record_type: string;
}

export interface Links {
    self: string;
}

const getBaseAxiosRequestConfig = (): AxiosRequestConfig => {
    return {
        headers: {
            Accept: "application/json",
            Authorization: AUTH_KEY,
        },
        proxy: false,
    };
};

const makeAPICall = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    try {
        return await axios.request<any>(config);
    } catch (err) {
        console.log(`API ERROR ${err}`);
        const axiosError = err as AxiosError;
        const{response, message} = axiosError;
        throw {
            data: response ? response.data.errors : [],
            message,
            status: response ? response.status : -1,
        };
    }
};

const getApiData = async (config: AxiosRequestConfig): Promise<any> => {
    const axiosResponse: AxiosResponse = await makeAPICall(config);
    const data = axiosResponse.data;
    console.log(`data returned from axios api call : ${JSON.stringify(data)}`);
    return data;
};

export const getCompanies = async (companyName: string, requestId): Promise<CompaniesResource> => {
    const config: AxiosRequestConfig = getBaseAxiosRequestConfig();
    config.headers = {
        "Authorization": AUTH_KEY,
        "Content-Type": "application/json",
        "X-Request-ID": requestId,
    };
    config.data = {
        company_name: companyName,
    };
    config.method = HTTP_POST;
    config.url = ALPHABETICAL_SEARCH_URL;

    const data = await getApiData(config) as CompaniesResource;
    return data;
};

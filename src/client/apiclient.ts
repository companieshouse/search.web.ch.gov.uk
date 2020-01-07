import axios, { AxiosResponse, AxiosError, Method, AxiosRequestConfig } from "axios";

const GET_COMPANIES_PATH: string = 'http://localhost:4089/alphabetical-search/corporate-name'

const HTTP_POST: Method = "post";

export interface CompaniesResource {
    searchType: string,
    topHit: string,
    results: [
        {
            ID: string,
            company_type: string,
            items: {
                company_number: string,
                company_status: string,
                corporate_name: string,
                record_type: string
            },
            links: {
                self: string
            }
        }
    ]
}

const getBaseAxiosRequestConfig = (): AxiosRequestConfig => {
    return {
        headers: {
            Accept: "application/json"
        }
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
    console.log(`data returned from axios api call : ${data}`);
    return data;
}

export const getCompanies = async (companyName: string): Promise<CompaniesResource> => {
    const config: AxiosRequestConfig = getBaseAxiosRequestConfig();
    config.headers["Content-Type"] = "application/json";
    config.data = {
        company_name: companyName
    }
    config.method = HTTP_POST;
    config.url = GET_COMPANIES_PATH;

    const data = await getApiData(config) as CompaniesResource;
    return data;
}
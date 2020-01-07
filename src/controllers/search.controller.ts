import {Request, Response} from "express";
import axios, { AxiosResponse, AxiosError, Method, AxiosRequestConfig } from "axios";
import * as templatePaths from "../model/template.paths";
import { text } from "body-parser";

const url: string = 'http://localhost:4089/alphabetical-search/corporate-name'

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

const getCompanies = async (companyName: string): Promise<CompaniesResource> => {
    const GET_COMPANIES_PATH = "http://localhost:4089/alphabetical-search/corporate-name";

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

export default async (req: Request, res: Response) => {
    let companyName: string = req.query["company-name"];
    
    const companyResource = await getCompanies(companyName);
    const searchResults = companyResource.results.map((result) => {

        const status = result.items.company_status;
        const capitalisedStatus = status.charAt(0).toUpperCase() + status.slice(1);
        return  [
              {
                html: "<a href='" + result.links.self + "'>" + result.items.corporate_name + "</a>"
              },
              {
                text: result.items.company_number
              },
              {
                text: capitalisedStatus
              }
            ]
    });

    res.render(templatePaths.SEARCH_RESULTS, {searchResults});
};

import {Request, Response} from "express";
import axios, { AxiosResponse, AxiosError } from "axios";

const url: string = 'http://localhost:4089/alphabetical-search/corporate-name'

export default (req: Request, res: Response) => {
    let companyName: string = req.query["company-name"];

    axios({
        method: 'post',
        url: url,
        data : {
            company_name: companyName
        },
        headers : {
            'Content-Type': 'application/json'
        }
    })
    .then((axiosResponse: AxiosResponse) => {
        res.send(axiosResponse.data);
    })
    .catch((axiosError: AxiosError) => {
        console.log(axiosError);
    });
};

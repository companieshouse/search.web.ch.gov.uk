import {Request, Response} from "express";

const request = require('request');
// TODO change to alphabetical search url
const basePath: string = "http://localhost:8080/movies/";

export default (req: Request, resp: Response) => {
    let companyName: string = req.query["company-name"];

    request(basePath + companyName, {json: true}, (err, res, body) => {
            resp.render("results");
    });
  };
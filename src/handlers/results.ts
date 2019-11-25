import {Request, Response} from "express";

const request = require('request');
// TODO change to alphabetical search url
const basePath: string = "http://localhost:8080/movies/";

export default (req: Request, resp: Response) => {
    let companyName: string = req.query["company-name"];

    request(basePath + companyName, {json: true}, (err, res, body) => {
        if (err) { return console.log(err); }

        let titlesList = new Array;
            body.forEach(element => {
                console.log(element.title);
                titlesList.push(element.title)
            });

            var data = {
                titlesList
            }
            console.log(data)
            resp.render("results", data);
    });
  };
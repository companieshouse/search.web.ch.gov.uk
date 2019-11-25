import {Router} from "express";
import {searchHandler} from "../handlers";
import getResults from "../handlers/results";

const request = require('request');

const router = Router();
router.get("/", searchHandler);
router.get("/get-results", getResults);

export default router;

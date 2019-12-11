import {Router} from "express";
import {searchHandler} from "../controllers";
import getResults from "../controllers/results";

const request = require('request');

const router = Router();
router.get("/", searchHandler);
router.get("/get-results", getResults);

export default router;

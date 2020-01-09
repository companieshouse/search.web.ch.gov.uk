import app from "../../app";
import * as request from "supertest";
import {getCompanies} from "../../client/apiclient";
import * as mockUtils from "../mock.utils";

jest.mock("../../client/apiclient");

const mockCompaniesResource: jest.Mock = (<unknown>getCompanies as jest.Mock<typeof getCompanies>);

describe("search.controller tests", () => {

    it("should return a results page successfully", async() => {
        mockCompaniesResource.mockResolvedValue(mockUtils.getDummyCompanyResource());

        const res = await request(app).get("/alphabetical-search/get-results");
        expect(res.status).toEqual(200);
    });
});

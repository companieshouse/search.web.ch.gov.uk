import app from "../../app";
import * as request from "supertest";
import {CompaniesResource, Result, getCompanies, Items, Links} from "../../client/apiclient";

jest.mock("../../client/apiclient");

const mockCompaniesResource: jest.Mock = (<unknown>getCompanies as jest.Mock<typeof getCompanies>);

describe("search.controller tests", () => {

    it("should return a results page successfully", async() => {
        mockCompaniesResource.mockResolvedValue(getDummyCompanyResource());

        const res = await request(app).get("/get-results");
        expect(res.status).toEqual(200);
    });
});

export const getDummyCompanyResource = (): CompaniesResource => {
  return {
      searchType: "searchType",
      topHit: "topHit",
      results: createDummyResults(),
  }
};

export const createDummyResults = (): Result[] => {
    const results: Result[] = [createDummyResult()];
    return results;
};

export const createDummyResult = (): Result => {
    return {
        ID: "ID",
        company_type: "company_type",
        items: createDummyItems(),
        links: createDummyLinks(),
    }
};

export const createDummyItems = (): Items => {
    return {
        company_number: "company_number",
        company_status: "string",
        corporate_name: "string",
        record_type: "string",    
    }
}

export const createDummyLinks = (): Links => {
    return {
        self: "self"
    }
}
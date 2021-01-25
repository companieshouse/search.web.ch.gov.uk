import app from "../../app";
import request from "supertest";
import { getCompanies } from "../../client/apiclient";
import * as mockUtils from "../mock.utils";

jest.mock("../../client/apiclient");

const mockCompaniesResource: jest.Mock = (<unknown>getCompanies as jest.Mock<typeof getCompanies>);

describe("search.controller tests", () => {

  it("should return a results page successfully", async () => {
    mockCompaniesResource.mockResolvedValue(mockUtils.getDummyCompanyResource());

    const res = await request(app).get("/alphabetical-search/get-results?companyName=nab");
    expect(res.status).toEqual(200);
    expect(res.text).toContain("00006400");
  });

  it("should escape any HTML tags that are embedded in the text", async() => {
    mockCompaniesResource.mockResolvedValue(mockUtils.getDummyCompanyResource("<I>company_name</I>"));

    const res = await request(app).get("/alphabetical-search/get-results?companyName=nab");
    expect(res.status).toEqual(200);
    expect(res.text).toContain("00006400");
    expect(res.text).toContain("&lt;I&gt;company_name&lt;/I&gt;");
  })

  it("should display No results found, if no search results have been found", async () => {
    mockCompaniesResource.mockResolvedValue(mockUtils.getDummyCompanyResourceEmpty());

    const response = await request(app).get("/alphabetical-search/get-results?companyName=sfgasfjgsdkfhkjdshgjkfdhgkjdhfkghfldgh");
    expect(response.status).toEqual(200);
    expect(response.text).toContain("No results found");
  });

  it("should display an error message if no company name is entered", async () => {
    const response = await request(app).get("/alphabetical-search/get-results?companyName=");
    expect(response.status).toEqual(200);
  });

});

const mockRequest: jest.Mock = jest.fn(() => { return dummyAxiosResponse });
jest.mock("axios", () => {
  return {
    default: {
      request: mockRequest
    }
  };
});

// Need to import after mocks set or the real axios module will be imported before mocks
import { AxiosResponse } from "axios";
import { CompaniesResource, getCompanies } from "../../client/apiclient";
import * as mockUtils from "../mock.utils";

const dummyAxiosResponse: AxiosResponse<CompaniesResource> = {
  data: {
    searchType: "searchType",
    topHit: "topHit",
    results: [
      {
        ID: "ID",
        company_type: "company_type",
        items: {
          company_number: "00006400",
          company_status: "active",
          corporate_name: "Test",
          record_type: "test",
        },
        links: {
          self: "self",
        }
      }
    ]
  },
  status: 200,
  statusText: "OK",
  headers: "header",
  config: {}
};

describe("apiclient unit tests", () => {
  it("returns a CompaniesResource object", async () => {
    const companies = await getCompanies("string", "requestId");
    expect(companies).toEqual(mockUtils.getDummyCompanyResource());
  });
});
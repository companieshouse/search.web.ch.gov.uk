import sinon from "sinon";
import chai from "chai";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import { AlphabeticalSearchPostRequest, CompaniesResource } from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/types";
import { getCompanies } from "../../client/apiclient";
import AlphabeticalSearchService from "@companieshouse/api-sdk-node/dist/services/search/alphabetical-search/service";

const mockResponse: Resource<CompaniesResource> = {
  httpStatusCode: 200,
  resource: {
    searchType: "searchType",
    topHit: "topHit",
    results: [
      {
        ID: "ID",
        company_type: "company_type",
        items: {
          company_number: "00006400",
          company_status: "active",
          corporate_name: "TEST",
          record_type: "test",
        },
        links: {
          self: "self",
        }
      }
    ]
  }
};

const mockAlphabeticalSearchPostRequest: AlphabeticalSearchPostRequest = ({
  company_name: "TEST"
});

const mockRequestID: string = "ID";

const sandbox = sinon.createSandbox();

describe("api.client", () => {
  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe("alphabetical search", () => {
    it.only("POST returns alphabetical search results", async () => {
      sandbox.stub(AlphabeticalSearchService.prototype, "getCompanies")
        .returns(Promise.resolve(mockResponse));

      const alphabeticalSearchResults = await getCompanies("api key", mockAlphabeticalSearchPostRequest, mockRequestID);
      chai.expect(alphabeticalSearchResults).to.equal(mockResponse.resource);
    });
  });
});

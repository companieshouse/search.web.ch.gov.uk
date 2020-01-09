import { CompaniesResource, Result, Items, Links} from "../client/apiclient";

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
          company_number: "00006400",
          company_status: "active",
          corporate_name: "Test",
          record_type: "test",    
      }
  }
  
  export const createDummyLinks = (): Links => {
      return {
          self: "self"
      }
  }
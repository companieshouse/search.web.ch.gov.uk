export interface AdvancedSearchParams {
    page: number,
    companyNameIncludes: string | null;
    companyNameExcludes: string | null;
    location: string | null;
    incorporatedFrom: string | null;
    incorporatedTo: string | null;
    sicCodes: null;
    companyStatus: null;
    companyType: null;
    dissolvedFrom: null;
    dissolvedTo: null;
}
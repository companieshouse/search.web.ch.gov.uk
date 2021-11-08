export interface AdvancedSearchParams {
    page: number,
    companyNameIncludes: string | null;
    companyNameExcludes: string | null;
    location: string | null;
    incorporatedFrom: string | null;
    incorporatedTo: string | null;
    sicCodes: string | null;
    companyStatus: string | null;
    companyType: string | null;
    dissolvedFrom: string | null;
    dissolvedTo: string | null;
}

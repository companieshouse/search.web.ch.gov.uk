import chai from "chai";
import {
    checkLineBreakRequired, determineReportAvailableBool, getDownloadReportText, mapResponsiveHeaders,
    formatLongDate, formatCompactAddress, changeDateFormat, generateSize, buildPagingUrl, mapCompanyStatusCheckboxes,
    mapCompanyTypeCheckboxes, buildCompanyStatusHtml, mapCompanyResource, mapAdvancedSearchParams, formatNumberWithCommas
} from "../../src/controllers/utils/utils";
import { AdvancedSearchParams } from "../../src/model/advanced.search.params";
import { DissolvedDates } from "../../src/model/dissolved.dates.params";
import { createDummyAdvancedSearchParams, getDummyAdvancedCompanyResource } from "../MockUtils/advanced-search/mock.util";

describe("utils.test", () => {
    describe("check that reports are only available if within the last 20 years", () => {
        it("should return false if date is > 20 years old", () => {
            const companyNumber: string = "00000000";
            const date: string = "1990-00-25";

            chai.expect(determineReportAvailableBool(companyNumber, date)).to.equal(false);
        });
        it("should return true if date is < 20 years old", () => {
            const companyNumber: string = "00000000";
            const date: string = "2009-00-25";

            chai.expect(determineReportAvailableBool(companyNumber, date)).to.equal(true);
        });
        it("should return false if the company number starts with BR branches", () => {
            const companyNumber: string = "BR000000";
            const date: string = "2009-00-25";

            chai.expect(determineReportAvailableBool(companyNumber, date)).to.equal(false);
        });
    });

    describe("check that the download report section is displaying the correct links", () => {
        it("should display Download report if the user is signed in with the correct company number", () => {
            const returnUrl = "/dissolved-search/get-results?companyName=test";

            chai.expect(getDownloadReportText(true, true, returnUrl, "00000008")).to.include(`data-resource-url="/dissolved-company-number/00000008"`);
        });

        it("should display Sign in to download report and provide the correct return url if the user is not signed in", () => {
            const returnUrl = "/dissolved-search/get-results?companyName=test";

            chai.expect(getDownloadReportText(false, true, returnUrl, "00000000")).to.equal("<a href=\"/signin?return_to=/dissolved-search/get-results?companyName=test\">Sign in to download report</a>");
        });

        it("should have a the full return to url concatenated to the sign in page link", () => {
            const returnUrl = "/dissolved-search/get-results?companyName=test&searchType=alphabetical&searchAfter=testNUK%3A06336551";

            chai.expect(getDownloadReportText(false, true, returnUrl, "00000000"))
                .to.equal("<a href=\"/signin?return_to=/dissolved-search/get-results?companyName=test&searchType=alphabetical&searchAfter=testNUK%3A06336551\">Sign in to download report</a>");
        });

        it("should display Not available if the company was dissolved greater than 20 years ago", () => {
            const returnUrl = "/dissolved-search/get-results?companyName=test";

            chai.expect(getDownloadReportText(true, false, returnUrl, "00000000")).to.equal("Not available");
        });
    });

    describe("check that the mapResponsiveHeaders returns the correct string of html", () => {
        it("should return a html string which includes the field name and field value", () => {
            const expectedString = "<span class=\"responsive-table__heading\" aria-hidden=\"true\">Company name</span>" +
            "<span class=\"responsive-table__cell\" aria-hidden=\"true\">Test Company</span>";

            chai.expect(mapResponsiveHeaders("Company name", "Test Company")).to.equal(expectedString);
        });
    });

    describe("check that the formatLongDate returns the correct string", () => {
        it("should return an empty string if the date is null", () => {
            chai.expect(formatLongDate("Test", null)).to.equal("");
        });
        it("should return an empty string if the date is undefined", () => {
            chai.expect(formatLongDate("Test", undefined)).to.equal("");
        });
        it("should return a formatted date if a date is provided", () => {
            const date = new Date(1975, 2, 23);
            chai.expect(formatLongDate(" - Incorporated on", date)).to.equal(" - Incorporated on 23 March 1975");
        });
    });

    describe("check that formatCompactAddress returns the correct string", () => {
        const registeredOfficeAddress = {
            address_line_1: undefined,
            address_line_2: "test street",
            locality: "cardiff",
            postal_code: "cf5 6rb",
            premises: undefined,
            region: "region",
            country: "country"
        };
        it("should return a formatted string if data is present", () => {
            chai.expect(formatCompactAddress(registeredOfficeAddress)).to.equal("test street, cardiff, region, country cf5 6rb");
        });
    });

    describe("check that buildCompanyStatusHtml returns the correct string", () => {
        it("should return a html string for the company status", () => {
            chai.expect(buildCompanyStatusHtml("active")).to.equal(`<span class="govuk-body govuk-!-font-weight-bold">Active</span>`);
        });
        it("should return an empty string for the company status being null", () => {
            chai.expect(buildCompanyStatusHtml(null)).to.equal("");
        });
        it("should return an empty string for being undefined", () => {
            chai.expect(buildCompanyStatusHtml(undefined)).to.equal("");
        });
    });

    describe("check that checkLineBreakRequired returns the correct string", () => {
        it("should return a string with a line break if text available", () => {
            chai.expect(checkLineBreakRequired("test")).to.equal("test<br>");
        });
        it("should return a blank string when no text available", () => {
            chai.expect(checkLineBreakRequired("")).to.equal("");
        });
    });

    describe("check that changeDateFormat returns the expected result", () => {
        it("should return null if the string passed in does not match the required format", () => {
            chai.expect(changeDateFormat("12/23")).to.equal(null);
        });
        it("should return null if the string is not in the required format", () => {
            chai.expect(changeDateFormat("01/02/2003/12")).to.equal(null);
        });
        it("should return a string if the value passed in matches the required format", () => {
            chai.expect(changeDateFormat("12/03/2020")).to.equal("2020-03-12");
        });
    });

    describe("check that the generateSize method returns as expected", () => {
        it("should return null if searchBefore, searchAfter and size are null", () => {
            chai.expect(generateSize(null, null, null)).to.equal(null);
        });
        it("should return 40 if size is less than 1", () => {
            chai.expect(generateSize("-10", null, null)).to.equal(40);
        });
        it("should return 40 if size is greater than 100", () => {
            chai.expect(generateSize("1000", null, null)).to.equal(40);
        });
        it("should return 40 when size is null and searchBefore is not null", () => {
            chai.expect(generateSize(null, "searchBefore", null)).to.equal(40);
        });
        it("should return 40 if size is null and searchAfter is not null", () => {
            chai.expect(generateSize(null, null, "searchAfter")).to.equal(40);
        });
        it("should return 40 where size is null and searchBefore and searchAfter are not null", () => {
            chai.expect(generateSize(null, "searchBefore", "searchAfter")).to.equal(40);
        });
        it("should return size as a number if not null, not less than 1 and not greater than 100", () => {
            chai.expect(generateSize("50", null, null)).to.equal(50);
        });
    });

    describe("check that buildPagingUrl constructs the url for paging correctly", () => {
        const nullDissolvedDates: DissolvedDates = {
            dissolvedFromDay: null,
            dissolvedFromMonth: null,
            dissolvedFromYear: null,
            dissolvedToDay: null,
            dissolvedToMonth: null,
            dissolvedToYear: null
        };
        const dissolvedDates: DissolvedDates = {
            dissolvedFromDay: "testDissolvedFromDay",
            dissolvedFromMonth: "testDissolvedFromMonth",
            dissolvedFromYear: "testDissolvedFromYear",
            dissolvedToDay: "testDissolvedToDay",
            dissolvedToMonth: "testDissolvedToMonth",
            dissolvedToYear: "testDissolvedToYear"
        };
        it("should return a url with a parameter for company name includes", () => {
            const searchParams = createDummyAdvancedSearchParams("1", "testCompanyNameIncludes", null, null, null, null, null, null, null, null, null, null, null, null, null, null);
            chai.expect(buildPagingUrl(searchParams, null, null, nullDissolvedDates))
                .to.equal("get-results?companyNameIncludes=testCompanyNameIncludes");
        });

        it("should return a url with a parameter for company name excludes", () => {
            const searchParams = createDummyAdvancedSearchParams(null, null, "testCompanyNameExcludes", null, null, null, null, null, null, null, null, null, null, null, null, null);
            chai.expect(buildPagingUrl(searchParams, null, null, nullDissolvedDates))
                .to.equal("get-results?companyNameExcludes=testCompanyNameExcludes");
        });

        it("should return a url with a parameter for registered office address", () => {
            const searchParams = createDummyAdvancedSearchParams(null, null, null, "testRegisteredOfficeAddress", null, null, null, null, null, null, null, null, null, null, null, null);
            chai.expect(buildPagingUrl(searchParams, null, null, nullDissolvedDates))
                .to.equal("get-results?registeredOfficeAddress=testRegisteredOfficeAddress");
        });

        it("should return a url with a parameter for company type", () => {
            const searchParams = createDummyAdvancedSearchParams(null, null, null, null, null, null, null, null, "ltd", null, null, null, null, null, null, null);
            chai.expect(buildPagingUrl(searchParams, null, null, nullDissolvedDates)).to.equal("get-results?type=ltd");
        });

        it("should check if type includes an icvc type and set type to icvc", () => {
            const searchParams = createDummyAdvancedSearchParams(null, null, null, null, null, null, null, null, "icvc-securities,icvc-warrant,icvc-umbrella", null, null, null, null, null, null, null);
            chai.expect(buildPagingUrl(searchParams, null, null, nullDissolvedDates)).to.equal("get-results?type=icvc");
        });

        it("should check if type includes an icvc type and set type to icvc and retain any other company types selected", () => {
            const searchParams = createDummyAdvancedSearchParams(null, null, null, null, null, null, null, null, "icvc-securities,icvc-warrant,icvc-umbrella, limited-partnership", null, null, null, null, null, null, null);
            chai.expect(buildPagingUrl(searchParams, null, null, nullDissolvedDates)).to.equal("get-results?type=icvc%2C+limited-partnership");
        });

        it("should return a url with parameters for dissolvedFrom and DissolvedTo", () => {
            const searchParams = createDummyAdvancedSearchParams(null, null, null, null, null, null, null, null, null, "testDissolvedFromDay", "testDissolvedFromMonth", "testDissolvedFromYear", "testDissolvedToDay", "testDissolvedToMonth", "testDissolvedToYear", null);
            chai.expect(buildPagingUrl(searchParams, null, null, dissolvedDates))
                .to.equal("get-results?dissolvedFromDay=testDissolvedFromDay&dissolvedFromMonth=testDissolvedFromMonth&dissolvedFromYear=testDissolvedFromYear&dissolvedToDay=testDissolvedToDay&dissolvedToMonth=testDissolvedToMonth&dissolvedToYear=testDissolvedToYear");
        });

        it("should return a url with a parameter for all fields present", () => {
            const searchParams = createDummyAdvancedSearchParams("1", "testCompanyNameIncludes", "testCompanyNameExcludes", "testRegisteredOfficeAddress", "testIncorporatedFrom", "testIncorporatedTo", "07210", "active", "ltd", "testDissolvedFromDay", "testDissolvedFromMonth", "testDissolvedFromYear", "testDissolvedToDay", "testDissolvedToMonth", "testDissolvedToYear", null);
            chai.expect(buildPagingUrl(searchParams, "testIncorporatedFrom", "testIncorporatedTo", dissolvedDates))
                .to.equal("get-results?companyNameIncludes=testCompanyNameIncludes" +
                    "&companyNameExcludes=testCompanyNameExcludes" +
                    "&registeredOfficeAddress=testRegisteredOfficeAddress" +
                    "&incorporatedFrom=testIncorporatedFrom" +
                    "&incorporatedTo=testIncorporatedTo" +
                    "&status=active" +
                    "&sicCodes=07210" +
                    "&type=ltd" +
                    "&dissolvedFromDay=testDissolvedFromDay" +
                    "&dissolvedFromMonth=testDissolvedFromMonth" +
                    "&dissolvedFromYear=testDissolvedFromYear" +
                    "&dissolvedToDay=testDissolvedToDay" +
                    "&dissolvedToMonth=testDissolvedToMonth" +
                    "&dissolvedToYear=testDissolvedToYear");
        });
    });

    describe("check that mapCompanyStatusCheckboxes applies checked to the selected checkboxes", () => {
        it("should apply checked to all checkboxes", () => {
            const expectedSelectedStatusCheckboxes = {
                active: "checked",
                dissolved: "checked",
                open: "checked",
                closed: "checked",
                convertedClosed: "checked",
                receivership: "checked",
                liquidation: "checked",
                administration: "checked",
                insolvencyProceedings: "checked",
                voluntaryArrangement: "checked"
            };

            const actualSelectedStatusCheckboxes =
                mapCompanyStatusCheckboxes("active,dissolved,open,closed,converted-closed," +
                    "receivership,liquidation,administration,insolvency-proceedings,voluntary-arrangement");

            compareCheckboxSelections(expectedSelectedStatusCheckboxes, actualSelectedStatusCheckboxes);
        });

        it("should apply checked to only active when just active selected", () => {
            const expectedSelectedStatusCheckboxes = {
                active: "checked",
                dissolved: "",
                open: "",
                closed: "",
                convertedClosed: "",
                receivership: "",
                liquidation: "",
                administration: "",
                insolvencyProceedings: "",
                voluntaryArrangement: ""
            };

            const actualSelectedStatusCheckboxes = mapCompanyStatusCheckboxes("active");
            compareCheckboxSelections(expectedSelectedStatusCheckboxes, actualSelectedStatusCheckboxes);
        });

        it("should return an object with no options checked when null", () => {
            const expectedSelectedStatusCheckboxes = {
                active: "",
                dissolved: "",
                open: "",
                closed: "",
                convertedClosed: "",
                receivership: "",
                liquidation: "",
                administration: "",
                insolvencyProceedings: "",
                voluntaryArrangement: ""
            };

            const actualSelectedStatusCheckboxes = mapCompanyStatusCheckboxes(null);
            compareCheckboxSelections(expectedSelectedStatusCheckboxes, actualSelectedStatusCheckboxes);
        });

        it("should return an object with no options checked when undefined", () => {
            const expectedSelectedStatusCheckboxes = {
                active: "",
                dissolved: "",
                open: "",
                closed: "",
                convertedClosed: "",
                receivership: "",
                liquidation: "",
                administration: "",
                insolvencyProceedings: "",
                voluntaryArrangement: ""
            };

            const actualSelectedStatusCheckboxes = mapCompanyStatusCheckboxes(undefined);
            compareCheckboxSelections(expectedSelectedStatusCheckboxes, actualSelectedStatusCheckboxes);
        });
    });

    describe("ensure that mapCompanyTypeCheckboxes assigns checked to the correct checkbox entries", () => {
        it("should return an object with all variables set as checked if all company type options are included", () => {
            const expectedSelection = setUpSelectedCompanyType();
            expectedSelection.assuranceCompany = "checked";
            expectedSelection.charitableIncorporatedOrganisation = "checked";
            expectedSelection.convertedOrClosed = "checked";
            expectedSelection.eeig = "checked";
            expectedSelection.europeanPublicLimitedLiabilityCompanySe = "checked";
            expectedSelection.furtherEducationOrSixthFormCollegeCorporation = "checked";
            expectedSelection.icvc = "checked";
            expectedSelection.industrialAndProvidentSociety = "checked";
            expectedSelection.limitedPartnership = "checked";
            expectedSelection.llp = "checked";
            expectedSelection.ltd = "checked";
            expectedSelection.northernIreland = "checked";
            expectedSelection.northernIrelandOther = "checked";
            expectedSelection.oldPublicCompany = "checked";
            expectedSelection.overseaCompany = "checked";
            expectedSelection.plc = "checked";
            expectedSelection.privateLimitedGuarantNsc = "checked";
            expectedSelection.privateLimitedGuarantNscLimitedExemption = "checked";
            expectedSelection.privateLimitedSharesSection30Exemption = "checked";
            expectedSelection.privateUnlimited = "checked";
            expectedSelection.privateUnlimitedNsc = "checked";
            expectedSelection.protectedCellCompany = "checked";
            expectedSelection.registeredSocietyNonJurisdictional = "checked";
            expectedSelection.royalCharter = "checked";
            expectedSelection.scottishCharitableIncorporatedOrganisation = "checked";
            expectedSelection.scottishPartnership = "checked";
            expectedSelection.ukEstablishment = "checked";
            expectedSelection.unregisteredCompany = "checked";
            const actualSelection = mapCompanyTypeCheckboxes("assurance-company,charitable-incorporated-organisation," +
                "converted-or-closed,eeig,european-public-limited-liability-company-se,further-education-or-sixth-form-college-corporation," +
                "icvc-warrant,industrial-and-provident-society,limited-partnership,llp,ltd,northern-ireland,northern-ireland-other," +
                "old-public-company,oversea-company,plc,private-limited-guarant-nsc,private-limited-guarant-nsc-limited-exemption," +
                "private-limited-shares-section-30-exemption,private-unlimited,private-unlimited-nsc,protected-cell-company," +
                "registered-society-non-jurisdictional,royal-charter,scottish-charitable-incorporated-organisation,scottish-partnership," +
                "uk-establishment,unregistered-company");
            checkCompanyTypeSelections(expectedSelection, actualSelection);
        });
        it("should return an object with ltd variable set as checked if that is the only companyType option passed in", () => {
            const expectedSelection = setUpSelectedCompanyType();
            expectedSelection.ltd = "checked";
            const actualSelection = mapCompanyTypeCheckboxes("ltd");
            checkCompanyTypeSelections(expectedSelection, actualSelection);
        });
        it("should return an object with no variables set as checked if null is provided", () => {
            const expectedSelection = setUpSelectedCompanyType();
            const actualSelection = mapCompanyTypeCheckboxes(null);
            checkCompanyTypeSelections(expectedSelection, actualSelection);
        });
        it("should return an object with no variables set as checked if undefined is provided", () => {
            const expectedSelection = setUpSelectedCompanyType();
            const actualSelection = mapCompanyTypeCheckboxes(undefined);
            checkCompanyTypeSelections(expectedSelection, actualSelection);
        });
    });

    describe("check that the mapCompanyResource maps the company resource correctly ready for csv download", () => {
        it("should map the input company resource correctly", () => {
            const listOfCompanies = getDummyAdvancedCompanyResource("test", 10);
            const mappedCompanies = mapCompanyResource(listOfCompanies);

            chai.expect(mappedCompanies[0].company_name).to.equal("test0");
            chai.expect(mappedCompanies[0].company_number).to.equal("06500000");
            chai.expect(mappedCompanies[0].company_status).to.equal("Active");
            chai.expect(mappedCompanies[0].company_type).to.equal("Private limited company");
            chai.expect(mappedCompanies[0].dissolution_date).to.deep.equal(new Date(1991, 11, 12));
            chai.expect(mappedCompanies[0].incorporation_date).to.deep.equal(new Date(1980, 13, 8));
            chai.expect(mappedCompanies[0].nature_of_business).to.equal("01120");
            chai.expect(mappedCompanies[0].registered_office_address).to.equal("test house test street cardiff cf5 6rb");
        });
    });

    describe("mapAdvancedSearchParams", () => {
        it("should map function arguments to advanced search params", async () => {
            const advancedSearchMappedParams: AdvancedSearchParams = mapAdvancedSearchParams(1, "companyNameIncludes", "companyNameExcludes", "address", "01/01/2010", "01/01/2010",
                "sicCodes", "status", "type", "01/01/2010", "01/01/2010", 50);

            chai.expect(advancedSearchMappedParams.page).to.equal(1);
            chai.expect(advancedSearchMappedParams.companyNameExcludes).to.equal("companyNameExcludes");
            chai.expect(advancedSearchMappedParams.companyNameIncludes).to.equal("companyNameIncludes");
            chai.expect(advancedSearchMappedParams.location).to.equal("address");
            chai.expect(advancedSearchMappedParams.incorporatedFrom).to.equal("2010-01-01");
            chai.expect(advancedSearchMappedParams.incorporatedTo).to.equal("2010-01-01");
            chai.expect(advancedSearchMappedParams.sicCodes).to.equal("sicCodes");
            chai.expect(advancedSearchMappedParams.companyStatus).to.equal("status");
            chai.expect(advancedSearchMappedParams.companyType).to.equal("type");
            chai.expect(advancedSearchMappedParams.dissolvedFrom).to.equal("2010-01-01");
            chai.expect(advancedSearchMappedParams.dissolvedTo).to.equal("2010-01-01");
            chai.expect(advancedSearchMappedParams.size).to.equal(50);
        });

        it("should replace icvc with icvc-securities,icvc-warrant,icvc-umbrella", async () => {
            const advancedSearchMappedParams: AdvancedSearchParams = mapAdvancedSearchParams(1, "companyNameIncludes", "companyNameExcludes", "address", "01/01/2010", "01/01/2010",
                "sicCodes", "status", "icvc", "01/01/2010", "01/01/2010", 50);

            chai.expect(advancedSearchMappedParams.companyType).to.equal("icvc-securities,icvc-warrant,icvc-umbrella");
        });
    });

    describe("formatNumberWithCommas", () => {
        it("should return a comma separated string for numbers above 1000", async () => {
            chai.expect(formatNumberWithCommas(1000)).to.equal("1,000");
        });
        it("should not insert commas for numbers under 1000", async () => {
            chai.expect(formatNumberWithCommas(123)).to.equal("123");
        });
        it("should insert multiple commas if the number is above 1 million", async () => {
            chai.expect(formatNumberWithCommas(1000000)).to.equal("1,000,000");
        });
    });
});

const compareCheckboxSelections = (expectedSelectedStatusCheckboxes, actualSelectedStatusCheckboxes) => {
    chai.expect(expectedSelectedStatusCheckboxes.active).to.equal(actualSelectedStatusCheckboxes.active);
    chai.expect(expectedSelectedStatusCheckboxes.dissolved).to.equal(actualSelectedStatusCheckboxes.dissolved);
    chai.expect(expectedSelectedStatusCheckboxes.open).to.equal(actualSelectedStatusCheckboxes.open);
    chai.expect(expectedSelectedStatusCheckboxes.closed).to.equal(actualSelectedStatusCheckboxes.closed);
    chai.expect(expectedSelectedStatusCheckboxes.convertedClosed).to.equal(actualSelectedStatusCheckboxes.convertedClosed);
    chai.expect(expectedSelectedStatusCheckboxes.receivership).to.equal(actualSelectedStatusCheckboxes.receivership);
    chai.expect(expectedSelectedStatusCheckboxes.liquidation).to.equal(actualSelectedStatusCheckboxes.liquidation);
    chai.expect(expectedSelectedStatusCheckboxes.administration).to.equal(actualSelectedStatusCheckboxes.administration);
    chai.expect(expectedSelectedStatusCheckboxes.insolvencyProceedings).to.equal(actualSelectedStatusCheckboxes.insolvencyProceedings);
    chai.expect(expectedSelectedStatusCheckboxes.voluntaryArrangement).to.equal(actualSelectedStatusCheckboxes.voluntaryArrangement);
};

const checkCompanyTypeSelections = (expectedSelection, actualSelection) => {
    chai.expect(expectedSelection.assuranceCompany).to.equal(actualSelection.assuranceCompany);
    chai.expect(expectedSelection.charitableIncorporatedOrganisation).to.equal(actualSelection.charitableIncorporatedOrganisation);
    chai.expect(expectedSelection.convertedOrClosed).to.equal(actualSelection.convertedOrClosed);
    chai.expect(expectedSelection.eeig).to.equal(actualSelection.eeig);
    chai.expect(expectedSelection.europeanPublicLimitedLiabilityCompanySe).to.equal(actualSelection.europeanPublicLimitedLiabilityCompanySe);
    chai.expect(expectedSelection.furtherEducationOrSixthFormCollegeCorporation).to.equal(actualSelection.furtherEducationOrSixthFormCollegeCorporation);
    chai.expect(expectedSelection.icvc).to.equal(actualSelection.icvc);
    chai.expect(expectedSelection.industrialAndProvidentSociety).to.equal(actualSelection.industrialAndProvidentSociety);
    chai.expect(expectedSelection.limitedPartnership).to.equal(actualSelection.limitedPartnership);
    chai.expect(expectedSelection.llp).to.equal(actualSelection.llp);
    chai.expect(expectedSelection.ltd).to.equal(actualSelection.ltd);
    chai.expect(expectedSelection.northernIreland).to.equal(actualSelection.northernIreland);
    chai.expect(expectedSelection.northernIrelandOther).to.equal(actualSelection.northernIrelandOther);
    chai.expect(expectedSelection.oldPublicCompany).to.equal(actualSelection.oldPublicCompany);
    chai.expect(expectedSelection.overseaCompany).to.equal(actualSelection.overseaCompany);
    chai.expect(expectedSelection.plc).to.equal(actualSelection.plc);
    chai.expect(expectedSelection.privateLimitedGuarantNscLimitedExemption).to.equal(actualSelection.privateLimitedGuarantNscLimitedExemption);
    chai.expect(expectedSelection.privateLimitedGuarantNsc).to.equal(actualSelection.privateLimitedGuarantNsc);
    chai.expect(expectedSelection.privateLimitedSharesSection30Exemption).to.equal(actualSelection.privateLimitedSharesSection30Exemption);
    chai.expect(expectedSelection.privateUnlimited).to.equal(actualSelection.privateUnlimited);
    chai.expect(expectedSelection.privateUnlimitedNsc).to.equal(actualSelection.privateUnlimitedNsc);
    chai.expect(expectedSelection.protectedCellCompany).to.equal(actualSelection.protectedCellCompany);
    chai.expect(expectedSelection.registeredSocietyNonJurisdictional).to.equal(actualSelection.registeredSocietyNonJurisdictional);
    chai.expect(expectedSelection.royalCharter).to.equal(actualSelection.royalCharter);
    chai.expect(expectedSelection.scottishCharitableIncorporatedOrganisation).to.equal(actualSelection.scottishCharitableIncorporatedOrganisation);
    chai.expect(expectedSelection.scottishPartnership).to.equal(actualSelection.scottishPartnership);
    chai.expect(expectedSelection.unregisteredCompany).to.equal(actualSelection.unregisteredCompany);
    chai.expect(expectedSelection.ukEstablishment).to.equal(actualSelection.ukEstablishment);
};

const setUpSelectedCompanyType = () => {
    return {
        assuranceCompany: "",
        charitableIncorporatedOrganisation: "",
        convertedOrClosed: "",
        eeig: "",
        europeanPublicLimitedLiabilityCompanySe: "",
        furtherEducationOrSixthFormCollegeCorporation: "",
        icvc: "",
        industrialAndProvidentSociety: "",
        limitedPartnership: "",
        llp: "",
        ltd: "",
        northernIreland: "",
        northernIrelandOther: "",
        oldPublicCompany: "",
        overseaCompany: "",
        plc: "",
        privateLimitedGuarantNscLimitedExemption: "",
        privateLimitedGuarantNsc: "",
        privateLimitedSharesSection30Exemption: "",
        privateUnlimited: "",
        privateUnlimitedNsc: "",
        protectedCellCompany: "",
        registeredSocietyNonJurisdictional: "",
        royalCharter: "",
        scottishCharitableIncorporatedOrganisation: "",
        scottishPartnership: "",
        unregisteredCompany: "",
        ukEstablishment: ""
    };
};

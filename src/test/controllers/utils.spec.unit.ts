
import chai from "chai";
import { checkLineBreakRequired, determineReportAvailableBool, getDownloadReportText, mapResponsiveHeaders,
     formatLongDate, formatCompactAddress, changeDateFormat, validateDate,
     generateSize, buildPagingUrl, mapCompanyStatusCheckboxes } from "../../controllers/utils/utils";

describe("utils.spec.unit", () => {
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

    describe("check that validateDate returns true if a valid date", () => {
        it("should return false if the string provided is empty", () => {
            chai.expect(validateDate("")).to.equal(false);
        });
        it("should return null if the string provided does not include slashes", () => {
            chai.expect(validateDate("03122020")).to.equal(false);
        });
        it("should return false if the string provided is not a date", () => {
            chai.expect(validateDate("12/03")).to.equal(false);
        });
        it("should return false if the string provided is not a date", () => {
            chai.expect(validateDate("12/03/2002/2003")).to.equal(false);
        });
        it("should return false if the string provided is not a date", () => {
            chai.expect(validateDate("2/3/2021")).to.equal(false);
        });
        it("should return true if the string provided is a valid date", () => {
            chai.expect(validateDate("12/03/2009")).to.equal(true);
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
        it("should return a url with a parameter for company name includes", () => {
            chai.expect(buildPagingUrl("testCompanyNameIncludes", null, null, null, null))
                .to.equal("get-results?companyNameIncludes=testCompanyNameIncludes");
        });

        it("should return a url with a parameter for company name excludes", () => {
            chai.expect(buildPagingUrl(null, "testCompanyNameExcludes", null, null, null))
                .to.equal("get-results?companyNameExcludes=testCompanyNameExcludes");
        });

        it("should return a url with a parameter for registered office address", () => {
            chai.expect(buildPagingUrl(null, null, "testRegisteredOfficeAddress", null, null))
                .to.equal("get-results?registeredOfficeAddress=testRegisteredOfficeAddress");
        });

        it("should return a url with a parameter for all fields present", () => {
            chai.expect(buildPagingUrl("testCompanyNameIncludes", "testCompanyNameExcludes", "testRegisteredOfficeAddress", "testIncorporatedFrom", "testIncorporatedTo"))
                .to.equal("get-results?companyNameIncludes=testCompanyNameIncludes" +
                    "&companyNameExcludes=testCompanyNameExcludes" +
                    "&registeredOfficeAddress=testRegisteredOfficeAddress" +
                    "&incorporatedFrom=testIncorporatedFrom" +
                    "&incorporatedTo=testIncorporatedTo");
        });
    });


    describe("check that mapCompanyStatusCheckboxes applies checked to the selected checkboxes", () => {
        it("should apply checked to all checkboxes", () => {

            const expectedSelectedStatusCheckboxes = {
                active: "checked",
                dissolved : "checked",
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
                dissolved : "",
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
                dissolved : "",
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
                dissolved : "",
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

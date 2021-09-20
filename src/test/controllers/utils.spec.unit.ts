
import chai from "chai";
import { determineReportAvailableBool, getDownloadReportText, mapResponsiveHeaders } from "../../controllers/utils";

describe("utils.spec.unit", () => {
    describe("check that reports are only available if within the last 20 years", () => {
        it("should return false if date is > 20 years old", () => {
            const date: string = "1990-00-25";

            chai.expect(determineReportAvailableBool(date)).to.be.false;
        });
        it("should return true if date is < 20 years old", () => {
            const date: string = "2009-00-25";

            chai.expect(determineReportAvailableBool(date)).to.be.true;
        });
    });

    describe("check that the download report section is displaying the correct links", () => {
        it("should display Download report if the user is signed in", () => {
            const returnUrl = "/dissolved-search/get-results?companyName=test";

            chai.expect(getDownloadReportText(true, true, returnUrl)).to.equal("<a href=\"\">Download report</a>");
        });

        it("should display Sign in to download report and provide the correct return url if the user is not signed in", () => {
            const returnUrl = "/dissolved-search/get-results?companyName=test";

            chai.expect(getDownloadReportText(false, true, returnUrl)).to.equal("<a href=\"/signin?return_to=/dissolved-search/get-results?companyName=test\">Sign in to download report</a>");
        });

        it("should have a the full return to url concatenated to the sign in page link", () => {
            const returnUrl = "/dissolved-search/get-results?companyName=test&searchType=alphabetical&searchAfter=testNUK%3A06336551";

            chai.expect(getDownloadReportText(false, true, returnUrl))
                .to.equal("<a href=\"/signin?return_to=/dissolved-search/get-results?companyName=test&searchType=alphabetical&searchAfter=testNUK%3A06336551\">Sign in to download report</a>");
        });

        it("should display Not available if the company was dissolved greater than 20 years ago", () => {
            const returnUrl = "/dissolved-search/get-results?companyName=test";

            chai.expect(getDownloadReportText(true, false, returnUrl)).to.equal("Not available");
        });
    });


    describe("check that the mapResponsiveHeaders returns the correct string of html", () => {
        it("should return a html string which includes the field name and field value", () => {

            const expectedString = "<span class=\"responsive-table__heading no-wrap\" aria-hidden=\"true\">Company name</span>" +
            "<span class=\"responsive-table__cell\" aria-hidden=\"true\">Test Company</span>";

            chai.expect(mapResponsiveHeaders("Company name", "Test Company")).to.equal(expectedString);

        });
    });
});

import escape from "escape-html";
import moment from "moment";

export const getDownloadReportText = (signedIn: boolean, reportAvailable: boolean, returnUrl: string, companyNumber: string): string => {
    const signIn = "Sign in to download report";
    const signInLink = "/signin?return_to=";
    let downloadReportText = `<div class="onlyJS">
                                <div id="widget">
                                <a class="render-document" href="#">Download report
                                    <span class="govuk-visually-hidden">link opens in new tab/window</span></a>
                                    <div class="widget-footer visually-hidden">
                                        <input type="hidden" id="document-data"
                                            data-resource-url="/dissolved-company-number/${companyNumber}"
                                            data-content-type="text/html" data-document-type="text/html">
                                        </input>
                                    </div>
                                </div>
                            </div>
                            <div id="download-button"></div>`;

    if (reportAvailable) {
        if (signedIn === true) {
            return downloadReportText;
        } else {
            downloadReportText = signIn.link(signInLink + returnUrl);
        }
    } else {
        downloadReportText = "Not available";
    }

    return downloadReportText;
};

export const sanitiseCompanyName = (companyName) => {
    return escape(companyName);
};

export const determineReportAvailableBool = (companyNumber: string, dateOfDissolution): boolean => {
    if (companyNumber.substring(0, 2) === "BR") {
        return false;
    }

    const dissolutionDate = dateOfDissolution.toString();
    const now = moment();
    const nowMinus20years = now.subtract(20, "years").format("YYYY-MM-DD");

    return dissolutionDate > nowMinus20years;
};

export const determineReturnToUrl = (req): string => {
    const companyNameRequestParam: string = req.query.companyName as string;
    const searchTypeRequestParam: string = req.query.searchType as string;
    const changeNameTypeParam: string = req.query.changedName as string;
    const searchBefore = req.query.searchBefore as string || null;
    const searchAfter = req.query.searchAfter as string || null;
    const pageRequestParam = req.query.page as string || null;
    const CHANGED_NAME_QUERY = `&changedName=${changeNameTypeParam}`;
    const SEARCH_TYPE_QUERY = `&searchType=${searchTypeRequestParam}`;
    const SEARCH_BEFORE_QUERY = `&searchBefore=${searchBefore}`;
    const SEARCH_AFTER_QUERY = `&searchAfter=${searchAfter}`;
    const PAGE_QUERY = `&page=${pageRequestParam}`;

    let url = `/dissolved-search/get-results?companyName=${companyNameRequestParam}`;

    if (searchTypeRequestParam != null) {
        url += SEARCH_TYPE_QUERY;
    };

    if (changeNameTypeParam != null) {
        url += CHANGED_NAME_QUERY;
    }

    if (searchBefore != null) {
        url += SEARCH_BEFORE_QUERY;
    }

    if (searchAfter != null) {
        url += SEARCH_AFTER_QUERY;
    }

    if (pageRequestParam != null) {
        url += PAGE_QUERY;
    }

    return encodeURIComponent(url);
};

export const generateROAddress = (registered_office_address) => {
    let addressLine1 = "";
    let addressLine2 = "";
    let town = "";
    let postCode = "";

    if (registered_office_address?.address_line_1 !== undefined) {
        addressLine1 = registered_office_address?.address_line_1 + " ";
    }

    if (registered_office_address?.address_line_2 !== undefined) {
        addressLine2 = registered_office_address?.address_line_2 + " ";
    }

    if (registered_office_address?.locality !== undefined) {
        town = registered_office_address?.locality + " ";
    }

    if (registered_office_address?.postal_code !== undefined) {
        postCode = registered_office_address?.postal_code;
    }

    if (registered_office_address?.address_line_1 === undefined && registered_office_address?.address_line_2 === undefined &&
        registered_office_address?.locality === undefined && registered_office_address?.postal_code === undefined) {
        addressLine1 = "Not available";
    }

    return addressLine1 + addressLine2 + town + postCode;
};

export const formatDate = (unformattedDate) => {
    if (unformattedDate === undefined) {
        return "";
    }

    const date = unformattedDate.toString();
    const splitDate = date.split("-");
    const year = splitDate[0];
    const month = splitDate[1];
    const day = splitDate[2];
    let monthWord;

    switch (month) {
    case "01":
        monthWord = "Jan";
        break;
    case "02":
        monthWord = "Feb";
        break;
    case "03":
        monthWord = "Mar";
        break;
    case "04":
        monthWord = "Apr";
        break;
    case "05":
        monthWord = "May";
        break;
    case "06":
        monthWord = "Jun";
        break;
    case "07":
        monthWord = "Jul";
        break;
    case "08":
        monthWord = "Aug";
        break;
    case "09":
        monthWord = "Sep";
        break;
    case "10":
        monthWord = "Oct";
        break;
    case "11":
        monthWord = "Nov";
        break;
    case "12":
        monthWord = "Dec";
        break;
    default:
        monthWord = month;
    }

    const dateToReturn = [day, monthWord, year].join(" ");

    return dateToReturn;
};

export const toTitleCase = (string: string): string => {
    if (typeof string !== "string") {
        return "";
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const detectNearestMatch = (orderedAlphaKeyWithId: string, topHitOrderedAlphaKeyWithId: string, noNearestMatch: boolean): string => {
    if (!noNearestMatch && orderedAlphaKeyWithId === topHitOrderedAlphaKeyWithId) {
        return "nearest";
    }
    return "";
};

export const generateSize = (size: string | null, searchBefore: string | null, searchAfter: string | null): number | null => {
    if (searchBefore === null && searchAfter === null && size === null) {
        return null;
    }

    const sizeAsNumber = Number(size);

    if (sizeAsNumber < 1 || sizeAsNumber > 100) {
        return 40;
    } else if (size === null && (searchBefore !== null || searchAfter !== null)) {
        return 40;
    }

    return Number(size);
};

export const mapResponsiveHeaders = (fieldHeading : string, fieldValue : string): string => {
    return "<span class=\"responsive-table__heading\" aria-hidden=\"true\">" + fieldHeading + "</span>" +
    "<span class=\"responsive-table__cell\" aria-hidden=\"true\">" + fieldValue + "</span>";
};

export const formatLongDate = (message: string, date: Date | null | undefined): string => {
    if (date === undefined || date === null) {
        return "";
    }
    const dateWithTime = new Date(date);

    const day = new Intl.DateTimeFormat("en", { day: "numeric" }).format(dateWithTime);
    const month = new Intl.DateTimeFormat("en", { month: "long" }).format(dateWithTime);
    const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(dateWithTime);
    return `${message} ${day} ${month} ${year}`;
};

export const formatCompactAddress = (registered_office_address) : string => {
    let addressString = "";
    addressString = addCommaString(addressString, registered_office_address.premises);
    addressString = addCommaString(addressString, registered_office_address.address_line_1);
    addressString = addCommaString(addressString, registered_office_address.address_line_2);
    addressString = addCommaString(addressString, registered_office_address.locality);
    addressString = addCommaString(addressString, registered_office_address.region);
    addressString = addCommaString(addressString, registered_office_address.country);
    return (registered_office_address.postal_code === undefined) ? addressString : addressString + " " + registered_office_address.postal_code;
};

export const checkLineBreakRequired = (text: string) : string => {
    if (text === "") {
        return text;
    }
    return text + "<br>";
};

export const mapCompanyStatusCheckboxes = (companyStatus) => {
    const selectedStatusCheckboxes = {
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

    if (companyStatus === null || companyStatus === undefined) {
        return selectedStatusCheckboxes;
    }
    const selectedCompanyStatusArray: string[] = String(companyStatus).split(",");

    selectedStatusCheckboxes.active = (selectedCompanyStatusArray.includes("active")) ? "checked" : "";
    selectedStatusCheckboxes.dissolved = (selectedCompanyStatusArray.includes("dissolved")) ? "checked" : "";
    selectedStatusCheckboxes.open = (selectedCompanyStatusArray.includes("open")) ? "checked" : "";
    selectedStatusCheckboxes.closed = (selectedCompanyStatusArray.includes("closed")) ? "checked" : "";
    selectedStatusCheckboxes.convertedClosed = (selectedCompanyStatusArray.includes("converted-closed")) ? "checked" : "";
    selectedStatusCheckboxes.receivership = (selectedCompanyStatusArray.includes("receivership")) ? "checked" : "";
    selectedStatusCheckboxes.liquidation = (selectedCompanyStatusArray.includes("liquidation")) ? "checked" : "";
    selectedStatusCheckboxes.administration = (selectedCompanyStatusArray.includes("administration")) ? "checked" : "";
    selectedStatusCheckboxes.insolvencyProceedings = (selectedCompanyStatusArray.includes("insolvency-proceedings")) ? "checked" : "";
    selectedStatusCheckboxes.voluntaryArrangement = (selectedCompanyStatusArray.includes("voluntary-arrangement")) ? "checked" : "";

    return selectedStatusCheckboxes;
};

function addCommaString (baseString : string, additionalString : string) : string {
    if (baseString.length === 0 && additionalString !== undefined) {
        return additionalString;
    }
    if (additionalString !== undefined && additionalString.length > 0) {
        return baseString + ", " + additionalString;
    }
    return baseString;
}

export const getPagingRange = (currentPage : number, numberOfPages : number) : { start : number; end : number; } => {
    let start = currentPage - 4;
    let end = currentPage + 6;

    if (start <= 0) {
        start = 1;
    }
    if (end - start < 10) {
        end = start + 10;
    }
    if (end > numberOfPages) {
        end = numberOfPages + 1;
        if (end - 10 < start) {
            if (end - 10 > 0) {
                start = (start - (end - 10)) > 0 ? (end - 10) : 1;
            }
        }
    }
    return { start: start, end: end };
};

export const changeDateFormat = (inputDate: string) => {
    const pattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!pattern.test(inputDate)) {
        return null;
    }
    const splitDate = inputDate.split("/");

    const day = splitDate[0];
    const month = splitDate[1];
    const year = splitDate[2];

    return year + "-" + month + "-" + day;
};

export const validateDate = (inputDate: string): boolean => {
    const formattedDate = inputDate !== null || inputDate !== undefined ? changeDateFormat(inputDate) : null;
    const momentDate = moment(formattedDate, true);

    return momentDate.isValid();
};

export const buildPagingUrl = (companyNameInclues: string | null, companyNameExcludes: string | null, location: string | null,
    incorporatedFrom: string | null, incorporatedTo: string | null) : string => {
    const pagingUrlBuilder = new URLSearchParams();

    if (companyNameInclues !== null) {
        pagingUrlBuilder.append("companyNameIncludes", companyNameInclues);
    }

    if (companyNameExcludes !== null) {
        pagingUrlBuilder.append("companyNameExcludes", companyNameExcludes);
    }

    if (location !== null) {
        pagingUrlBuilder.append("registeredOfficeAddress", location);
    }

    if (incorporatedFrom !== null) {
        pagingUrlBuilder.append("incorporatedFrom", incorporatedFrom);
    }

    if (incorporatedTo !== null) {
        pagingUrlBuilder.append("incorporatedTo", incorporatedTo);
    }

    const pagingUrl: string = "get-results?" + pagingUrlBuilder.toString();

    return pagingUrl;
};
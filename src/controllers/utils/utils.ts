import { COMPANY_STATUS_CONSTANT, COMPANY_TYPE_CONSTANT, getCompanyConstant } from "../../config/api.enumerations";
import { AdvancedSearchParams } from "model/advanced.search.params";
import { DissolvedDates, FullDates, FullDissolvedDates, IncorporationDates } from "model/date.params";
import { Request } from "express";
import moment from "moment";
import escape from "escape-html";

export const getDownloadReportText = (signedIn: boolean, reportAvailable: boolean, returnUrl: string, companyNumber: string): string => {
    const signIn = "Sign in to download report";
    const signInLink = "/signin?return_to=";
    let downloadReportText = `<div class="onlyJS">
                                <div id="widget">
                                <a class="render-document" href="#" data-event-id="dissolved-search-results-page-download-report">Download report
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

export const buildCompanyStatusHtml = (companyStatus: string | undefined | null) => {
    if (companyStatus === undefined || companyStatus === null) {
        return "";
    }
    const mappedCompanyStatus = getCompanyConstant(COMPANY_STATUS_CONSTANT, companyStatus);
    return `<span class="govuk-body govuk-!-font-weight-bold">${mappedCompanyStatus}</span>`;
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

export const changeDateFormat = (inputDate: string) : string | null => {
    const pattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!pattern.test(inputDate)) {
        return null;
    }
    return moment(inputDate, "DD/MM/YYYY").format("YYYY-MM-DD");
};

export const buildPagingUrl = (advancedSearchParams: AdvancedSearchParams, incorporationDates: IncorporationDates, dissolvedDates: DissolvedDates) : string => {
    const pagingUrlBuilder = new URLSearchParams();
    const companyTypeCheck = advancedSearchParams.companyType?.includes("icvc") ? advancedSearchParams.companyType.replace("icvc-securities,icvc-warrant,icvc-umbrella", "icvc") : advancedSearchParams.companyType;

    urlAppender(pagingUrlBuilder, advancedSearchParams.companyNameIncludes, "companyNameIncludes");
    urlAppender(pagingUrlBuilder, advancedSearchParams.companyNameExcludes, "companyNameExcludes");
    urlAppender(pagingUrlBuilder, advancedSearchParams.location, "registeredOfficeAddress");
    urlAppender(pagingUrlBuilder, incorporationDates.incorporationFromDay, "incorporationFromDay");
    urlAppender(pagingUrlBuilder, incorporationDates.incorporationFromMonth, "incorporationFromMonth");
    urlAppender(pagingUrlBuilder, incorporationDates.incorporationFromYear, "incorporationFromYear");
    urlAppender(pagingUrlBuilder, incorporationDates.incorporationToDay, "incorporationToDay");
    urlAppender(pagingUrlBuilder, incorporationDates.incorporationToMonth, "incorporationToMonth");
    urlAppender(pagingUrlBuilder, incorporationDates.incorporationToYear, "incorporationToYear");
    urlAppender(pagingUrlBuilder, advancedSearchParams.companyStatus, "status");
    urlAppender(pagingUrlBuilder, advancedSearchParams.sicCodes, "sicCodes");
    urlAppender(pagingUrlBuilder, companyTypeCheck, "type");
    urlAppender(pagingUrlBuilder, dissolvedDates.dissolvedFromDay, "dissolvedFromDay");
    urlAppender(pagingUrlBuilder, dissolvedDates.dissolvedFromMonth, "dissolvedFromMonth");
    urlAppender(pagingUrlBuilder, dissolvedDates.dissolvedFromYear, "dissolvedFromYear");
    urlAppender(pagingUrlBuilder, dissolvedDates.dissolvedToDay, "dissolvedToDay");
    urlAppender(pagingUrlBuilder, dissolvedDates.dissolvedToMonth, "dissolvedToMonth");
    urlAppender(pagingUrlBuilder, dissolvedDates.dissolvedToYear, "dissolvedToYear");

    const pagingUrl: string = "get-results?" + pagingUrlBuilder.toString();

    return pagingUrl;
};

const urlAppender = (urlBuilder: URLSearchParams, field: string | null, urlParam: string) => {
    if (field !== null) {
        urlBuilder.append(urlParam, field);
    }
};

export const mapCompanyTypeCheckboxes = (companyType: string | null | undefined) => {
    const selectedTypeCheckboxes = {
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

    if (companyType === null || companyType === undefined) {
        return selectedTypeCheckboxes;
    }

    const selectedCompanyTypeArray : string[] = String(companyType).split(",");

    selectedTypeCheckboxes.assuranceCompany = (selectedCompanyTypeArray.includes("assurance-company")) ? "checked" : "";
    selectedTypeCheckboxes.charitableIncorporatedOrganisation = (selectedCompanyTypeArray.includes("charitable-incorporated-organisation")) ? "checked" : "";
    selectedTypeCheckboxes.convertedOrClosed = (selectedCompanyTypeArray.includes("converted-or-closed")) ? "checked" : "";
    selectedTypeCheckboxes.eeig = (selectedCompanyTypeArray.includes("eeig")) ? "checked" : "";
    selectedTypeCheckboxes.europeanPublicLimitedLiabilityCompanySe = (selectedCompanyTypeArray.includes("european-public-limited-liability-company-se")) ? "checked" : "";
    selectedTypeCheckboxes.furtherEducationOrSixthFormCollegeCorporation = (selectedCompanyTypeArray.includes("further-education-or-sixth-form-college-corporation")) ? "checked" : "";
    selectedTypeCheckboxes.icvc = (selectedCompanyTypeArray.includes("icvc-warrant")) ? "checked" : "";
    selectedTypeCheckboxes.industrialAndProvidentSociety = (selectedCompanyTypeArray.includes("industrial-and-provident-society")) ? "checked" : "";
    selectedTypeCheckboxes.limitedPartnership = (selectedCompanyTypeArray.includes("limited-partnership")) ? "checked" : "";
    selectedTypeCheckboxes.llp = (selectedCompanyTypeArray.includes("llp")) ? "checked" : "";
    selectedTypeCheckboxes.ltd = (selectedCompanyTypeArray.includes("ltd")) ? "checked" : "";
    selectedTypeCheckboxes.northernIreland = (selectedCompanyTypeArray.includes("northern-ireland")) ? "checked" : "";
    selectedTypeCheckboxes.northernIrelandOther = (selectedCompanyTypeArray.includes("northern-ireland-other")) ? "checked" : "";
    selectedTypeCheckboxes.oldPublicCompany = (selectedCompanyTypeArray.includes("old-public-company")) ? "checked" : "";
    selectedTypeCheckboxes.overseaCompany = (selectedCompanyTypeArray.includes("oversea-company")) ? "checked" : "";
    selectedTypeCheckboxes.plc = (selectedCompanyTypeArray.includes("plc")) ? "checked" : "";
    selectedTypeCheckboxes.privateLimitedGuarantNsc = (selectedCompanyTypeArray.includes("private-limited-guarant-nsc")) ? "checked" : "";
    selectedTypeCheckboxes.privateLimitedGuarantNscLimitedExemption = (selectedCompanyTypeArray.includes("private-limited-guarant-nsc-limited-exemption")) ? "checked" : "";
    selectedTypeCheckboxes.privateLimitedSharesSection30Exemption = (selectedCompanyTypeArray.includes("private-limited-shares-section-30-exemption")) ? "checked" : "";
    selectedTypeCheckboxes.privateUnlimited = (selectedCompanyTypeArray.includes("private-unlimited")) ? "checked" : "";
    selectedTypeCheckboxes.privateUnlimitedNsc = (selectedCompanyTypeArray.includes("private-unlimited-nsc")) ? "checked" : "";
    selectedTypeCheckboxes.protectedCellCompany = (selectedCompanyTypeArray.includes("protected-cell-company")) ? "checked" : "";
    selectedTypeCheckboxes.registeredSocietyNonJurisdictional = (selectedCompanyTypeArray.includes("registered-society-non-jurisdictional")) ? "checked" : "";
    selectedTypeCheckboxes.royalCharter = (selectedCompanyTypeArray.includes("royal-charter")) ? "checked" : "";
    selectedTypeCheckboxes.scottishCharitableIncorporatedOrganisation = (selectedCompanyTypeArray.includes("scottish-charitable-incorporated-organisation")) ? "checked" : "";
    selectedTypeCheckboxes.scottishPartnership = (selectedCompanyTypeArray.includes("scottish-partnership")) ? "checked" : "";
    selectedTypeCheckboxes.ukEstablishment = (selectedCompanyTypeArray.includes("uk-establishment")) ? "checked" : "";
    selectedTypeCheckboxes.unregisteredCompany = (selectedCompanyTypeArray.includes("unregistered-company")) ? "checked" : "";

    return selectedTypeCheckboxes;
};

export const mapCompanySubtypeCheckboxes = (companySubype: string | null | undefined) => {
    const selectedSubypeCheckboxes = {
        communityInterestCompany: "",
        privateFundLimitedPartnership: ""
    };

    if (companySubype === null || companySubype === undefined) {
        return selectedSubypeCheckboxes;
    }

    const selectedCompanySubtypeArray : string[] = String(companySubype).split(",");

    selectedSubypeCheckboxes.communityInterestCompany = (selectedCompanySubtypeArray.includes("community-interest-company")) ? "checked" : "";
    selectedSubypeCheckboxes.privateFundLimitedPartnership = (selectedCompanySubtypeArray.includes("private-fund-limited-partnership")) ? "checked" : "";

    return selectedSubypeCheckboxes;
};

export const mapCompanyResource = (companyResource) => {
    const listOfCompanies = companyResource.items.map(item => {
        const sicCodes = item.sic_codes !== undefined ? item.sic_codes.toString().replace(/,/g, " ") : " ";
        const companyData = {
            company_name: item.company_name,
            company_number: item.company_number,
            company_status: getCompanyConstant(COMPANY_STATUS_CONSTANT, item.company_status),
            company_type: getCompanyConstant(COMPANY_TYPE_CONSTANT, item.company_type),
            dissolution_date: item.date_of_cessation,
            incorporation_date: item.date_of_creation,
            nature_of_business: sicCodes,
            registered_office_address: generateROAddress(item.registered_office_address)
        };
        return companyData;
    });
    return listOfCompanies;
};

export const mapAdvancedSearchParams = (page: number, companyNameIncludes: string | null, companyNameExcludes: string | null,
    registeredOfficeAddress: string | null, incorporatedFrom: string | null, incorporatedTo: string | null, sicCodes: string | null,
    companyStatus: string | null, companyType: string | null, companySubtype: string | null, dissolvedFrom: string | null, dissolvedTo: string | null, size: number | null): AdvancedSearchParams => {
    if (companyType !== null) {
        companyType = String(companyType).replace("icvc", "icvc-securities,icvc-warrant,icvc-umbrella");
    }
    const advancedSearchParams: AdvancedSearchParams = {
        page: page,
        companyNameIncludes: companyNameIncludes,
        companyNameExcludes: companyNameExcludes,
        location: registeredOfficeAddress,
        incorporatedFrom: incorporatedFrom !== null ? changeDateFormat(incorporatedFrom) : null,
        incorporatedTo: incorporatedTo !== null ? changeDateFormat(incorporatedTo) : null,
        sicCodes: sicCodes,
        companyStatus: companyStatus,
        companyType: companyType,
        companySubtype: companySubtype,
        dissolvedFrom: dissolvedFrom !== null ? changeDateFormat(dissolvedFrom) : null,
        dissolvedTo: dissolvedTo !== null ? changeDateFormat(dissolvedTo) : null,
        size: size
    };

    return advancedSearchParams;
};

export const formatNumberWithCommas = (num: number) : string => {
    return String(num).replace(/(.)(?=(\d{3})+$)/g, "$1,");
};

export const getDatesFromParams = (req: Request): FullDates => {
    const dissolvedFromDay = req.query.dissolvedFromDay as string || null;
    const dissolvedFromMonth = req.query.dissolvedFromMonth as string || null;
    const dissolvedFromYear = req.query.dissolvedFromYear as string || null;
    const dissolvedToDay = req.query.dissolvedToDay as string || null;
    const dissolvedToMonth = req.query.dissolvedToMonth as string || null;
    const dissolvedToYear = req.query.dissolvedToYear as string || null;

    const dissolvedFromDate = `${dissolvedFromDay}/${dissolvedFromMonth}/${dissolvedFromYear}`;
    const dissolvedToDate = `${dissolvedToDay}/${dissolvedToMonth}/${dissolvedToYear}`;

    const incorporationFromDay = req.query.incorporationFromDay as string || null;
    const incorporationFromMonth = req.query.incorporationFromMonth as string || null;
    const incorporationFromYear = req.query.incorporationFromYear as string || null;
    const incorporationToDay = req.query.incorporationToDay as string || null;
    const incorporationToMonth = req.query.incorporationToMonth as string || null;
    const incorporationToYear = req.query.incorporationToYear as string || null;

    const incorporationFromDate = `${incorporationFromDay}/${incorporationFromMonth}/${incorporationFromYear}`;
    const incorporationToDate = `${incorporationToDay}/${incorporationToMonth}/${incorporationToYear}`;

    return {
        fullDissolvedDates: {
            dissolvedFromDate,
            dissolvedToDate
        },
        fullIncorporationDates: {
            incorporationFromDate,
            incorporationToDate
        }
    };
};

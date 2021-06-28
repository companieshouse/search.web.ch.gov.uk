import escape from "escape-html";

export const sanitiseCompanyName = (companyName) => {
    return escape(companyName);
};

export const generateROAddress = (registered_office_address) => {
    
    let addressLine1 = "";
    let addressLine2 = "";
    let town = "";
    let postCode = "";
    let fullAddressToBeDisplayed

    if (registered_office_address?.address_line_1 != null || registered_office_address?.address_line_1 != undefined) {
        addressLine1 = registered_office_address.address_line_1 + ", ";
    }

    if (registered_office_address?.address_line_2 != null || registered_office_address?.address_line_2 != undefined) {
        addressLine2 = registered_office_address.address_line_2 + ", ";
    }

    if (registered_office_address?.locality != null || registered_office_address?.locality != undefined) {
        town = registered_office_address.locality + ", ";
    }

    if (registered_office_address?.postal_code != null || registered_office_address?.postal_code != undefined) {
        town = registered_office_address.postal_code;
    }

    fullAddressToBeDisplayed = addressLine1 + addressLine2 + town + postCode;

    return fullAddressToBeDisplayed;
}

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

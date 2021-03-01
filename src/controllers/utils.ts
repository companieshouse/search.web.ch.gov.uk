import escape from "escape-html";


export const sanitiseCompanyName = (companyName) => {
    return escape(companyName);
};

export const formatPostCode = (postCode) => {
    let halfPostCode;
    let trimmedPostCode;

    if (postCode != null) {
        const newPostCode = postCode.split(" ");
        halfPostCode = newPostCode[0];

        trimmedPostCode = halfPostCode.slice(0, 4);
    }

    return trimmedPostCode;
};


export const formatDate = (unformattedDate) => {
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
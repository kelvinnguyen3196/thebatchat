const expirationDate = () => {
    const date = addDays(3);
    return date;
}

const dateDifferenceMillis = (currDate, expirationDate) => {
    return Math.abs(expirationDate - currDate);
}

// function source: https://stackoverflow.com/questions/8528382/javascript-show-milliseconds-as-dayshoursmins-without-seconds
const dateDifference = (currDate, expirationDate) => {
    const milliseconds = dateDifferenceMillis(currDate, expirationDate);
    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
    const modDays = milliseconds % (24 * 60 * 60 * 1000);
    const hours = Math.floor(modDays / (60* 60 * 1000));
    const modHours = milliseconds % (60 * 60 * 1000);
    const minutes = Math.floor(modHours / (60 * 1000));

    return `${days}d, ${hours}h, ${minutes}m`;
}

// #region class helper functions
// default parameter date = current date
function addDays(days, date = new Date()) {
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    return date;
}
// #endregion

module.exports = {
    expirationDate,
    dateDifference
}
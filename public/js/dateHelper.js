const dateDifferenceMillis = (currDate, expirationDate) => {
    return Math.abs(expirationDate - currDate);
}

const dateDifference = (currDate, expirationDate) => {
    const milliseconds = dateDifferenceMillis(currDate, expirationDate);
    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
    const modDays = milliseconds % (24 * 60 * 60 * 1000);
    const hours = Math.floor(modDays / (60* 60 * 1000));
    const modHours = milliseconds % (60 * 60 * 1000);
    const minutes = Math.floor(modHours / (60 * 1000));

    return `${days} days, ${hours} hours, ${minutes} minutes`;
}

export default {
    dateDifferenceMillis,
    dateDifference
}
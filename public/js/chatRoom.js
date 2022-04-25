// need to figure out how to get name from previous page

// make GET request to API to get room information
import apiInfo from './apiUrl.js';

// #region helper functions
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
// #endregion

// immediately invoked function - load room information on page
(async () => {
    try {
        const endpoint = `/api/rooms`;
        const response = await fetch(`${apiInfo.url}:${apiInfo.port}${endpoint}`);
        if(response.ok) {
            const jsonResponse = await response.json();
            // insert room information into page
            jsonResponse.forEach((elem) => {
                const roomNameElem = document.createElement('p');
                roomNameElem.textContent = `> ${elem.roomName}`;
                document.getElementById(`rooms-container`).insertAdjacentElement(`beforeend`, roomNameElem);

                const expirationDate = new Date(elem.expiration);
                const expirationFormatted = dateDifference(new Date(), expirationDate);
                const date = `<p>${expirationFormatted}</p>`;
                document.getElementById(`expiration-container`).insertAdjacentHTML(`beforeend`, date);
            });
            console.log(jsonResponse);
        }
    } catch(e) {
        console.log(e);
    }
})()
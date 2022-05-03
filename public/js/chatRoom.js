// need to figure out how to get name from previous page

// make GET request to API to get room information
import apiInfo from './apiUrl.js';
import dateHelper from './dateHelper.js';
import siteInfo from './siteInfo.js';

// #region helper functions
const setRoomEventListeners = () => {
    const rooms = document.querySelectorAll(`#rooms-container button`);
    rooms.forEach((elem) => {
        elem.addEventListener(`click`, function() {
            // get user name
            const userName = window.location.href.split(`=`)[1];
            // redirect to room's page
            window.location.href = `${siteInfo.url}:${siteInfo.port}/rooms/${this.id}?name=${userName}`;
        });
    });
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
                const roomNameElem = document.createElement('button');
                roomNameElem.textContent = `> ${elem.roomName}`;
                roomNameElem.setAttribute(`id`, `${elem.roomName}`);
                document.getElementById(`rooms-container`).insertAdjacentElement(`beforeend`, roomNameElem);

                const expirationDate = new Date(elem.expiration);
                const expirationFormatted = dateHelper.dateDifference(new Date(), expirationDate);
                const date = `<p>${expirationFormatted}</p>`;
                document.getElementById(`expiration-container`).insertAdjacentHTML(`beforeend`, date);
            });
            console.log(jsonResponse);
        }
        setRoomEventListeners();
    } catch(e) {
        console.log(e);
    }
})()
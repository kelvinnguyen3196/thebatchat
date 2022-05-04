import apiInfo from './apiUrl.js';
import dateHelper from './dateHelper.js';
import siteInfo from './siteInfo.js';

// get reference to message element and focus
const messageInput = document.getElementById(`message`);
messageInput.focus();

// get room name
const urlParams = window.location.pathname.split(`/`);
const roomName = urlParams[urlParams.length - 1];
const userName = window.location.href.split(`=`)[1];

// set page title
document.title = `batchat - ${roomName}`;
// set room name
document.getElementById(`room-name`).textContent = roomName;
// set user name
document.getElementById(`username`).textContent = `${userName} > `;
// set event listener to go back to menu
document.getElementById(`menu-button`).addEventListener(`click`, () => {
    const userName = window.location.href.split(`=`)[1];
    window.location.href = `${siteInfo.url}:${siteInfo.port}/rooms?name=${userName}`;
});

// #region helper functions
const roomSetup = (roomObj) => {
    // set expiration date
    const expirationDate = new Date(roomObj.expiration);
    const expirationFormatted = dateHelper.dateDifference(new Date(), expirationDate);
    const date = `${expirationFormatted}`;
    document.getElementById(`remaining-time`).insertAdjacentHTML(`beforeend`, date);

    console.log(roomObj);
    
    const messagesContainer = document.getElementById(`message-container`);
    roomObj.messages.forEach((elem) => {
        const message = `${elem.name} > ${elem.message}`;
        const msgElem = document.createElement(`p`);
        msgElem.textContent = message;
        messagesContainer.insertAdjacentElement(`beforeend`, msgElem);
    });
}
// #endregion

// immediately invoked function - get all data for specific room
(async () => {
    try {
        const endpoint = `api/rooms/${roomName}`;
            const response = await fetch(`${apiInfo.url}:${apiInfo.port}/${endpoint}`);
        if(response.ok) {
            const jsonResponse = await response.json();
            roomSetup(jsonResponse);
        }
    } catch(e) {
        console.log(e);
    }
})()
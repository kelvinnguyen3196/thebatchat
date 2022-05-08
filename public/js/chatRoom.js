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
            window.location.href = `${siteInfo.url}/rooms/${this.id}?name=${userName}`;
        });
    });
}

const setAddRoomEventListener = async () => {
    const roomNameInput = document.getElementById(`room-name-input`);
    roomNameInput.addEventListener(`keydown`, async function(event) {
        // if not enter button return
        if(event.key !== `Enter`) return;
        // remove default behavior from pressing enter
        event.preventDefault();
        // get room name
        const roomName = roomNameInput.value;
        // check if room exists
        try {
            const link = `${apiInfo.url}/api/rooms/${roomName}`;
            const request = await fetch(link);
            if(request.ok) {
                const jsonResponse = await request.text();
                console.log(jsonResponse);
                if(jsonResponse) {  // if found means duplicate room
                    // insert what user just typed
                    const inputContainer = document.getElementById(`new-room-input-container`);
                    const duplicateNameElem = document.createElement(`p`);
                    duplicateNameElem.textContent = `> ${roomName}`;
                    inputContainer.insertAdjacentElement(`beforebegin`, duplicateNameElem);
                    // insert duplicate room message
                    const errorMessage = document.createElement(`p`);
                    errorMessage.textContent = `> a room exists with this name`;
                    inputContainer.insertAdjacentElement(`beforebegin`, errorMessage);
                    // clear input field
                    const input = document.getElementById(`room-name-input`);
                    input.value = ``;
                    // refocus input
                    input.focus();
                }
            }
        } catch(e) {
            console.log(e);
        }
        // if room name is blank then return
        if(roomName === ``) return;
        // make api call
        const link = `${apiInfo.url}/api/createRoom/${roomName}`;
        try {
            const response = await fetch(link, {
                method: `POST`,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if(response.ok) {
                roomNameInput.value = ``;
                // redirect to new room
                const userName = window.location.href.split(`=`)[1];
                const link = `${siteInfo.url}/rooms/${roomName}?name=${userName}`;
                window.location.href = link;
            }
        } catch(e) {
            console.log(e);
        }
    });
}
// #endregion
const addRoomButton = document.getElementById(`add-room-button`);
addRoomButton.addEventListener(`click`, function() {
    // hide ++ button
    addRoomButton.style.visibility = `hidden`;
    // get input container
    const inputContainer = document.getElementById(`new-room-input-container`);
    // create question element
    const question = document.createElement(`p`);
    question.textContent = `> room name?`;
    inputContainer.insertAdjacentElement(`beforebegin`, question);
    // insert angle bracket before room name input
    const angleBracket = document.createElement(`p`);
    angleBracket.textContent = `> `;
    inputContainer.insertAdjacentElement(`beforeend`, angleBracket);
    // insert text area for input
    const textArea = `<textarea id="room-name-input" rows="1"></textarea>`;
    inputContainer.insertAdjacentHTML('beforeend', textArea);
    // focus text area
    document.getElementById(`room-name-input`).focus();
    // add event listener to call API to create new room
    setAddRoomEventListener();
});

// immediately invoked function - load room information on page
(async () => {
    try {
        const endpoint = `${apiInfo.url}/api/rooms`;
        const response = await fetch(`${endpoint}`);
        if(response.ok) {
            const jsonResponse = await response.json();
            // insert room information into page
            jsonResponse.forEach((elem) => {
                // check if room has expired
                const expirationDate = new Date(elem.expiration);
                // if current date is after expiration then room has expired
                if(expirationDate < new Date()) return;
                const expirationFormatted = dateHelper.dateDifference(new Date(), expirationDate);
                const date = `<p>${expirationFormatted}</p>`;
                document.getElementById(`expiration-container`).insertAdjacentHTML(`beforeend`, date);

                const roomNameElem = document.createElement('button');
                roomNameElem.textContent = `> ${elem.roomName}`;
                roomNameElem.setAttribute(`id`, `${elem.roomName}`);
                document.getElementById(`rooms-container`).insertAdjacentElement(`beforeend`, roomNameElem);
            });
            console.log(jsonResponse);
        }
        setRoomEventListeners();
    } catch(e) {
        console.log(e);
    }
})()
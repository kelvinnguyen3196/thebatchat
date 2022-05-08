import apiInfo from './apiUrl.js';
import dateHelper from './dateHelper.js';
import siteInfo from './siteInfo.js';

const MAX_NAME_LENGTH = 7;

// #region helper functions
const formattedName = (name) => {
    let userName = name;
    userName = userName.replaceAll(`%20`, ` `);
    if(userName.length === MAX_NAME_LENGTH) return userName;
    else if(userName.length > MAX_NAME_LENGTH) {
        const numExtra = userName.length - MAX_NAME_LENGTH;
        return userName.substring(0, userName.length - numExtra);
    }
    else if(userName.length < MAX_NAME_LENGTH) {
        return userName.padEnd(MAX_NAME_LENGTH);
    }
}

const roomSetup = (roomObj) => {
    // set expiration date
    const expirationDate = new Date(roomObj.expiration);
    const expirationFormatted = dateHelper.dateDifference(new Date(), expirationDate);
    const date = `${expirationFormatted}`;
    document.getElementById(`remaining-time`).insertAdjacentHTML(`beforeend`, date);

    console.log(roomObj);
    
    const messagesContainer = document.getElementById(`message-container`);
    roomObj.messages.forEach((elem) => {
        const message = `${formattedName(elem.name)} > ${elem.message}`;
        const msgElem = document.createElement(`p`);
        msgElem.textContent = message;
        messagesContainer.insertAdjacentElement(`beforeend`, msgElem);
    }); 
}
// #endregion

// get reference to message element and focus
const messageInput = document.getElementById(`message`);
messageInput.focus();

// get room name
const urlParams = window.location.pathname.split(`/`);
let roomName = urlParams[urlParams.length - 1];
let userName = formattedName(window.location.href.split(`=`)[1]);
// replace %20 with space
roomName = roomName.replaceAll(`%20`, ` `);

// #region socket.io
// connect to socket.io
const socket = io({
    query: {
        room: roomName,
        userName: userName
    }
});
// ==================== socket.on ====================
// #region 'welcome' welcome player
socket.on('welcome', () => {
    console.log(`Welcome player!`);
});
// #endregion
// #region 'numActive' receive num of active users in room and set value on page
socket.on(`numActive`, (numActive) => {
    document.getElementById(`number-active`).textContent = `${numActive} active`;
});
// #endregion
// #region 'receivedMessage'
socket.on(`receivedMessage`, (name, message) => {
    const messageContainer = document.getElementById(`message-container`);
    const newMessage = document.createElement(`p`);
    newMessage.textContent = `${name} > ${message}`;
    messageContainer.insertAdjacentElement(`beforeend`, newMessage);
});
// #endregion
// #endregion

// set page title
document.title = `batchat - ${roomName}`;
// set room name
document.getElementById(`room-name`).textContent = roomName;
// set user name
document.getElementById(`username`).textContent = `${userName} > `;
// set event listener to go back to menu
document.getElementById(`menu-button`).addEventListener(`click`, () => {
    const userName = window.location.href.split(`=`)[1];
    window.location.href = `${siteInfo.url}/rooms?name=${userName}`;
});

// add event listener for when user presses enter
messageInput.addEventListener(`keydown`, async function(event) {
    if(event.key === `Enter`) {
        // stop enter key from making a new line
        event.preventDefault();
        // grab info to add message to room
        const message = document.getElementById(`message`);
        // send message to store in database
        const body = {
            'name': userName,
            'message': message.value
        }
        const link = `api/sendMessage/${roomName}`;
        try {
            const response = await fetch(link, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
        } catch(e) {
            console.log(e);
        }
        // send message to socketio server to broadcast
        socket.emit(`sendMessage`, userName, message.value);
        // clear message field
        message.value = '';
    }
});

// immediately invoked function - get all data for specific room
(async () => {
    try {
        const endpoint = `api/rooms/${roomName}`;
            const response = await fetch(`${endpoint}`);
        if(response.ok) {
            const jsonResponse = await response.json();
            roomSetup(jsonResponse);
        }
    } catch(e) {
        console.log(e);
    }
})()


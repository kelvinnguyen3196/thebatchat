import siteInfo from './siteInfo.js';

// get reference to input element
const input = document.getElementById(`name`);
// immediately focus input when page loads
input.focus();
// shrink text area input to 1 row
input.value = ``;
input.style.height = 0;
input.style.height = input.scrollHeight + `px`;

// add event listener for when user presses enter
input.addEventListener(`keydown`, function(event) {
    if(event.key === `Enter`) { // after pressing enter send to server
        // stop enter key from making a new line
        event.preventDefault();
        // create new p element
        const nameFormatted = document.createElement(`p`);
        // insert user input safely with textContent
        nameFormatted.textContent = `> ${input.value}`;
        // insert what user entered before input in DOM
        document.getElementById(`name-input`).insertAdjacentElement(`beforebegin`, nameFormatted);
        // save and clear name
        const userName = input.value;
        input.value = ``;
        // resize textarea
        input.style.height = 0;
        input.style.height = this.scrollHeight + `px`;
        // scroll input into view
        input.scrollIntoView(false);

        // redirect to chat room page
        window.location.href = `${siteInfo.url}:${siteInfo.port}/rooms?name=${userName}`;
    }
});

// add event listener for auto-adjusting height of input
input.addEventListener(`input`, function() {
    this.style.height = 0;
    this.style.height = this.scrollHeight + `px`;
});
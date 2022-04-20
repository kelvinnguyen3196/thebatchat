// get reference to input element
const input = document.getElementById(`name`);
// immediately focus input when page loads
input.focus();
// shrink text area input to 1 row
input.value = ` `;
input.style.height = 0;
input.style.height = input.scrollHeight + `px`;
input.value = ``;

const test = function() {
    input.focus();
}

// add event listener for when user presses enter
document.getElementById(`name`).addEventListener('keydown', function(event) {
    if(event.key === `Enter`) { // after pressing enter send to server
        // remove focus immediately to stop text area from resizing
        input.blur();
        // format name to enter into DOM
        const nameFormatted = `<p>> ${input.value}</p>`;   
        // insert what user entered before input in DOM
        document.getElementById(`name-input`).insertAdjacentHTML(`beforebegin`, nameFormatted);
        // scroll input into view
        input.scrollIntoView(false);
        // clear name
        input.value = ``;
        test();
    }
});

// add event listener for auto-adjusting height of input
document.getElementById(`name`).addEventListener(`input`, function() {
    this.style.height = 0;
    this.style.height = this.scrollHeight + `px`;
});
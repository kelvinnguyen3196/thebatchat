// get reference to input element
const input = document.getElementById(`name`);
// immediately focus input when page loads
input.focus();

// add event listener for when user presses enter
input.addEventListener('keydown', function(event) {
    if(event.key === `Enter`) { // after pressing enter send to server
        // format name to enter into DOM
        const nameFormatted = `<p>> ${input.value}</p>`;   
        // insert what user entered before input in DOM
        document.getElementById(`name-input`).insertAdjacentHTML(`beforebegin`, nameFormatted);
        // scroll input into view
        input.scrollIntoView(false);
        // clear name
        input.value = ``;
    }
});
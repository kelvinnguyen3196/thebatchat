// immediately focus input when page loads
document.getElementById(`name`).focus();

// add event listener for when user presses enter
document.getElementById(`name`).addEventListener('keydown', function(event) {
    if(event.key === `Enter`) { // after pressing enter send to server

    }
});
const express = require('express');
const path = require('path');
const app = express();

// use public folder for static content
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>  {
    console.log(`Server is running on port ${PORT}...`);
});
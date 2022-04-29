const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors({
    origin: '*'
}));

// use public folder for static content
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

app.get('/rooms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'chatRoom.html'));
});

app.get('/rooms/:room', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'room.html'));
});

// routes
const apiRouter = require('./routes/apiRouter.js');
app.use('/api', apiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>  {
    console.log(`Server is running on port ${PORT}...`);
});
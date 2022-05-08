const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const socketio = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketio(server);
// const morgan = require('morgan');
const { MongoClient } = require('mongodb');
const cron = require('node-cron');

app.use(cors({
    origin: '*'
}));

// app.use(morgan('dev'));
// app.use(express.json());

// #region connect to MongoDB
const password = "oRD0QLvrKCNac4XA";
const dbName = `batchat`;
const uri = `mongodb+srv://admin:${password}@cluster0.izcz7.mongodb.net/${dbName}?retryWrites=true&w=majority`
const client = new MongoClient(uri);
let roomsCollection;
(async () => {    // immediately invoked function
    try {
        await client.connect();
        roomsCollection = client.db(`batchat`).collection(`rooms`);
    } catch(e) {
        console.log(e);
    }
})()
// #endregion

// #region static content
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
// #endregion

// schedule daily room deletion
cron.schedule('0 0 * * *', async () => {
    const roomsToDelete = [];
    const rooms = [];
    // get all rooms
    const query = {};
    const options = {
        projection: {
            _id: 0,
            roomName: 1,
            expiration: 1
        }
    };
    try {
        const cursor = roomsCollection.find(query, options);
        await cursor.forEach((elem) => {
            rooms.push(elem);
        });
    } catch(e) {
        const error = new Error(`Error with getting all rooms in daily purge`);
        error.status = 400;
        next(error);
    }
    
    // find out which rooms are due for deletion
    rooms.forEach((room) => {
        const expiration = new Date(room.expiration);
        // if room has expired push to delete array
        if(expiration < new Date()) roomsToDelete.push(room.roomName);
    });
    
    // delete rooms
    const deleteQuery = { roomName: { $in: roomsToDelete } };
    const result = await roomsCollection.deleteMany(query);
});

// helper functions
const dateHelper = require(path.join(__dirname, 'helpers', 'dateHelper.js'));

// #region socket.io
io.on('connection', socket => {
    // #region on connection set up
    // join room
    const roomName = socket.handshake.query.room;
    // save username - could be useful later
    const userName = socket.handshake.query.userName;
    socket.join(roomName);
    socket.emit(`welcome`);
    // on connection, emit to update num active for all users connected
    const rooms = io.sockets.adapter.rooms;
    const room = rooms.get(roomName);
    const roomSize = room ? room.size : 0;
    io.sockets.in(roomName).emit(`numActive`, roomSize);
    // #endregion

    // ==================== socket.on ====================
    // #region 'sendMessage' broadcast sent message to all users
    socket.on(`sendMessage`, (name, message) => {
        io.sockets.in(roomName).emit(`receivedMessage`, name, message);
        console.log(`Sending message: name - ${name} > ${message}`);
    });
    // #endregion
    // #region 'disconnect'
    socket.on(`disconnect`, () => {
        // broadcast to all sockets that we are leaving room to update active
        io.sockets.in(roomName).emit(`numActive`, roomSize - 1);
    });
    // #endregion
});
// #endregion

// #region GET endpoints
// get names and expiration of all rooms
app.get('/api/rooms', async (req, res, next) => {
    const query = {};
    const options = { 
        projection: {   // which properties to include
            _id: 0,
            roomName: 1,
            expiration: 1
        }
    };

    const cursor = roomsCollection.find(query, options);
    const documents = [];

    try {
        await cursor.forEach((elem) => {
            documents.push(elem);
        });
    } catch(e) {
        const error = new Error(`Error getting room information`);
        error.status = 400;
        next(error);
    }

    res.status(200).send(documents);
});
// get all information on a specific room
app.get('/api/rooms/:room', async (req, res, next) => {
    const roomName = req.params.room;
    const query = { roomName: roomName };
    const options = {};
    let roomInfo;

    try {
        roomInfo = await roomsCollection.findOne(query, options);
    } catch(e) {
        const error = new Error(`Error getting info on room ${roomName}`);
        error.status = 400;
        next(error);
    }

    res.status(200).send(roomInfo);
});
// get amount of people active in socket.io room
app.get('/api/rooms/:room/activeCount', async (req, res, next) => {

});
// #endregion

// #region POST endpoints
app.post('/api/createRoom/:roomName', async (req, res, next) => {
    const roomName = req.params.roomName;

    // check if room exists already
    const existsQuery = { roomName: roomName };
    const existsOptions = {
        projection: {
            _id: 0,
            roomName: 1
        }
    };
    let room;
    try {
        room = await roomsCollection.findOne(existsQuery, existsOptions);
    } catch(e) {
        const error = new Error(`Error checking room existence`);
        error.status = 400;
        next(error);
    }
    if(room) { // if room exists then send back error
        res.status(417).send(); // send a 417 error
        return;
    }

    // otherwise continue to create room
    let result;
    const createQuery = {
        roomName: roomName,
        expiration: dateHelper.expirationDate(),
        messages: []
    };
    try {
        result = roomsCollection.insertOne(createQuery);
    } catch(e) {
        const error = new Error(`Error creating new room`);
        error.status(400);
        next(error);
    }
    res.status(200).send(result);
});
// receive and add message to room
/* // #region example body
req.body = 
{
    "name": string,
    "message": string
}
*/ // #endregion
app.post('/api/sendMessage/:roomName', async (req, res, next) => {
    // get arguments
    console.log(req.body);
    const userName = req.body.name;
    const message = req.body.message;
    const roomName = req.params.roomName;
    let result;

    // insert into MongoDB
    try {
        const filter = { roomName: roomName };
        const update = { $push: { messages: {
            name: userName,
            message: message
        } } };
        result = await roomsCollection.updateOne(filter, update);
    } catch(e) {
        const error = new Error(`Error posting new message to ${roomName}`);
        error.status = 400;
        next(error);
    }
    res.send(result);
});
// #endregion

// #region DELETE endpoints
// delete all rooms in array from body
/* // #region example body
req.body =
{
    "rooms": ["room1", "room2"];
}
*/ // #endregion
app.delete('/api/deleteRooms', async (req, res, next) => {
    // get rooms to delete
    const rooms = req.body.rooms;
    const query = { roomName: { $in: rooms } };
    const result = await roomsCollection.deleteMany(query);
    res.status(204).send();
});
// #endregion

// error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).send(err.message);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>  {
    console.log(`Server is running on port ${PORT}...`);
});
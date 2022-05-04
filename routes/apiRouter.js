const express = require('express');
const path = require('path');
const morgan = require('morgan');
const { MongoClient } = require('mongodb');

const apiRouter = express.Router();

apiRouter.use(morgan('dev'));
apiRouter.use(express.json());

// connect to MongoDB
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

// helper functions
const dateHelper = require(path.join(__dirname, '..', 'helpers', 'dateHelper.js'));

// #region GET endpoints
// get names and expiration of all rooms
apiRouter.get('/rooms', async (req, res, next) => {
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
apiRouter.get('/rooms/:room', async (req, res, next) => {
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
apiRouter.get('/rooms/:room/activeCount', async (req, res, next) => {

});
// #endregion

// #region POST endpoints
apiRouter.post('/createRoom/:roomName', async (req, res, next) => {
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
    res.send(result);
});
// receive and add message to room
/* // #region example body
req.body = 
{
    "name": string,
    "message": string
}
*/ // #endregion
apiRouter.post('/sendMessage/:roomName', async (req, res, next) => {
    // get arguments
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

// error handler
apiRouter.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).send(err.message);
});

module.exports = apiRouter;
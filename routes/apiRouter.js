const express = require('express');
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
apiRouter.get('/:room', async (req, res, next) => {
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
// #endregion

// error handler
apiRouter.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).send(err.message);
});

module.exports = apiRouter;
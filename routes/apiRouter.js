const express = require('express');
const morgan = require('morgan')
const apiRouter = express.Router();

apiRouter.use(morgan('dev'));
apiRouter.use(express.json());



// error handler
apiRouter.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).send(err.message);
});

module.exports = apiRouter;
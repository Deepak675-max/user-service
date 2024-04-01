require('dotenv').config();
const express = require('express');
const httpErrors = require("http-errors");
const cors = require("cors");
const path = require("path");
const userServiceBackendApp = express();
const http = require('http');
const cookieParser = require('cookie-parser');
require('./helper/common/init_mongodb');
const session = require("express-session");
const server = http.createServer(userServiceBackendApp);
userServiceBackendApp.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

userServiceBackendApp.use(cookieParser());
userServiceBackendApp.use(express.json());
userServiceBackendApp.use(express.urlencoded({ extended: true }));
userServiceBackendApp.use(express.static(path.join(__dirname, 'public')));
userServiceBackendApp.use(session({
    secret: 'your_secret_key_here',
    resave: false,
    saveUninitialized: true
}));

const version1 = require('./helper/common/route_versions/v1');
userServiceBackendApp.use('/v1', version1);

userServiceBackendApp.use(async (req, _res, next) => {
    next(httpErrors.NotFound(`Route not Found for [${req.method}] ${req.url}`));
});

// Common Error Handler
userServiceBackendApp.use((error, req, res, next) => {
    const responseStatus = error.status || 500;
    const responseMessage =
        error.message || `Cannot resolve request [${req.method}] ${req.url}`;
    if (res.headersSent === false) {
        res.status(responseStatus);
        res.send({
            error: {
                status: responseStatus,
                message: responseMessage,
            },
        });
    }
    next();
});

const port = process.env.APP_PORT;

server.listen(port, () => {
    console.log("User Service is running on the port " + port)
})





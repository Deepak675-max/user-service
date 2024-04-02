const express = require('express');
const httpErrors = require("http-errors");
const cors = require("cors");
const path = require("path");
const userServiceBackendApp = express();
const http = require('http');
const cookieParser = require('cookie-parser');
require("./utils/database/init_mongodb");
const server = http.createServer(userServiceBackendApp);
userServiceBackendApp.use(cors({
    origin: "*",
    credentials: true,
}));

const { APP_PORT } = require("./config/index");

userServiceBackendApp.use(cookieParser());
userServiceBackendApp.use(express.json());
userServiceBackendApp.use(express.urlencoded({ extended: true }));
userServiceBackendApp.use(express.static(path.join(__dirname, 'public')));

const userServiceRoutes = require('./routes/user/user.route');
userServiceBackendApp.use('/api', userServiceRoutes);

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

const port = APP_PORT;

server.listen(port, () => {
    console.log("User Service is running on the port " + port)
})





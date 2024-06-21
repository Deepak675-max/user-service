const express = require('express');
const httpErrors = require("http-errors");
const cors = require("cors");
const path = require("path");
const taskManagerBackendApp = express();
const http = require('http');
require("./utils/database/init_mongodb");
const server = http.createServer(taskManagerBackendApp);
taskManagerBackendApp.use(cors({
    origin: "*",
    credentials: true,
}));

const { APP_PORT } = require("./config/index");
taskManagerBackendApp.use(express.json());
taskManagerBackendApp.use(express.urlencoded({ extended: true }));
taskManagerBackendApp.use(express.static(path.join(__dirname, 'public')));

const userServiceRoutes = require('./routes/user/user.route');
taskManagerBackendApp.use('/v1/api/users', userServiceRoutes);
const taskServiceRoutes = require("./routes/task/task.route");
taskManagerBackendApp.use('/v1/api/tasks', taskServiceRoutes);

taskManagerBackendApp.use(async (req, _res, next) => {
    next(httpErrors.NotFound(`Route not Found for [${req.method}] ${req.url}`));
});

// Common Error Handler
taskManagerBackendApp.use((error, req, res, next) => {
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
    console.log("Application is running on the port " + port);
})

process.on('SIGINT', () => {
    // Perform cleanup operations here
    console.log('Received SIGINT signal. application terminated successfully.');
    // Exit the application
    process.exit(0);
});





const express = require("express");
const v1 = express.Router();

const userRoutes = require("../../../routes/user/user.route");
v1.use("/api", userRoutes);


module.exports = v1;
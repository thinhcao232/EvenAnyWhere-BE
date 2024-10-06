const express = require('express');
const router = express.Router()

const {
    register,
    login
} = require("../App/controllers/accountUser.controllers")

router
    .route("/login")
    .post(login);
router
    .route("/register")
    .post(register);

Module.exports = router;
const express = require('express');
const router = express.Router();
const admin = require('../App/controllers/admin.controllers');
const authen = require("../App/middlewares/authen");

router.post("/register", admin.register);
router.post("/login", admin.login);
router.get("/refresh-token/:id", admin.refreshToken);
router.post("/updateInfo", authen, admin.updateAdmin);
router.get("/info", authen, admin.getAdminInfo);
router.post("/lock", authen, admin.lockAccount);
module.exports = router;
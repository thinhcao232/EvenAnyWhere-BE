const express = require("express");
const router = express.Router();
const AccountController = require("../App/controllers/accountUser.controllers");
const authen = require("../App/middlewares/authen");

router.post("/register", AccountController.register);
router.post("/login", AccountController.login);
router.post("/auth/logout", authen, AccountController.logout);
router.get("/refresh-token/:id", AccountController.refreshToken);
router.post("/auth/updateProfile", authen, AccountController.updateProfile);
router.post("/reset-password", AccountController.resetPassword);
router.post("/auth/changePassword", authen, AccountController.changePassword);

module.exports = router;
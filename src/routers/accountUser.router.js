const express = require("express");
const router = express.Router();
const AccountController = require("../App/controllers/accountUser.controllers");
const authen = require("../App/middlewares/authen");

router.post("/register", AccountController.register);
router.post("/login", AccountController.login);
router.post("/auth/logout", authen, AccountController.logout);
router.get("/refresh-token/:id", AccountController.refreshToken);
router.put("/updateProfile", authen, AccountController.updateProfile);
router.post("/reset-password", AccountController.resetPassword);
router.post("/changePassword", authen, AccountController.changePassword);
router.get("/info", authen, AccountController.getUser);
// Route để người dùng trở thành organizer
router.patch("/organizerRole", authen, AccountController.becomeOrganizer);
router.post("/googleLoginApp", AccountController.googleLogin);


module.exports = router;
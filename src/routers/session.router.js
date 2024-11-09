const express = require('express');
const router = express.Router();
const sessionController = require('../App/controllers/session.controllers');
const authen = require('../App/middlewares/authen');
const autho = require("../App/middlewares/autho");

router.post("/create/:event_id", authen, autho, sessionController.createSession);
router.get("/get/:event_id", authen, sessionController.getAllSessionsByEvent);
router.put("/update/:session_id", authen, autho, sessionController.updateSession);
router.delete("/delete/:session_id", authen, autho, sessionController.deleteSession);
router.get('/:session_id', authen, sessionController.getSessionById);
module.exports = router;
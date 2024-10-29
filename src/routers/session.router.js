const express = require('express');
const router = express.Router();
const sessionController = require('../App/controllers/session.controllers');
const authen = require('../App/middlewares/authen');

router.post("/create", authen, sessionController.createSession);
router.get("/:event_id", authen, sessionController.getAllSessionsByEvent);
router.put("/update/:session_id", authen, sessionController.updateSession);
router.delete("/delete/:session_id", authen, sessionController.deleteSession);
router.get('/:session_id', authen, sessionController.getSessionById);
module.exports = router;
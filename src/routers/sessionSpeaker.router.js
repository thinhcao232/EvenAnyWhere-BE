const express = require('express');
const router = express.Router();
const sessionController = require('../App/controllers/sessionSpeaker.controllers');
const authen = require('../App/middlewares/authen');
const autho = require("../App/middlewares/autho");


router.post('/add', authen, autho, sessionController.addSpeakerByEmail);
router.get('/:session_id', sessionController.getSpeakersBySession);

module.exports = router;
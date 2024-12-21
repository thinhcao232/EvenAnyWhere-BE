const express = require('express');
const router = express.Router();
const eventParticipationController = require("../App/controllers/eventParticipation.controllers");
const authen = require("../App/middlewares/authen");


router.post('/join', authen, eventParticipationController.joinEvent);
router.post('/checkJoin', authen, eventParticipationController.checkHasJoin);
module.exports = router;
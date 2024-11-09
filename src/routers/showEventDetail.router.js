const express = require('express');
const router = express.Router();
const eventController = require('../App/controllers/showEventDetail.controllers');

//lấy hết thông tin event ,session, speaker theo  id event
router.get('/:id', eventController.getEventDetails);

module.exports = router;
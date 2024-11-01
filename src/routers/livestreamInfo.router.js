const express = require('express');
const router = express.Router();
const liveStreamController = require('../App/controllers/livestreamInfo.controllers');
const authen = require("../App/middlewares/authen");

router.post('/create', liveStreamController.createLiveStream);
router.get('/get/:id', authen, liveStreamController.getLiveStreamById);
router.delete('/delete/:id', authen, liveStreamController.deleteLiveStream);

module.exports = router;
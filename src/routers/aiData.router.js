const express = require("express");
const router = express.Router();
const aiDataController = require('../App/controllers/aiData.controllers');

router.get('/user', aiDataController.getUsers);
router.get('/event', aiDataController.getEvents);
router.get('/join', aiDataController.getJoin);

module.exports = router;
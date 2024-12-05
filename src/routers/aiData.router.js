const express = require("express");
const router = express.Router();
const aiDataController = require('../App/controllers/aiData.controllers');

// Route trả về ma trận cho AI
router.get('/data', aiDataController.getMatrixForAI);

module.exports = router;
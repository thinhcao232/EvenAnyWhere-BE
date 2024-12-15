const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../App/controllers/recommendation.controllers.js');
const authen = require('../App/middlewares/authen');
// Route lấy gợi ý
router.get('/recommend/:userId', getRecommendations);

module.exports = router;
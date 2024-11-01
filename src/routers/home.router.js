const express = require('express');
const router = express.Router();
const homeController = require("../App/controllers/home.controllers");

// Route for searching events by title or keyword
router.get('/search', homeController.searchEventsByTitle);

router.get('/filter', homeController.filterEvents);

module.exports = router;

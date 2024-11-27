const express = require('express');
const router = express.Router();
const notificationController = require('../App/controllers/notification.controllers');

router.post('/create', notificationController.createNotification);
router.get('/get/:id', notificationController.getUserNotifications);
router.delete('/delete/:id', notificationController.deleteNotification);

module.exports = router;
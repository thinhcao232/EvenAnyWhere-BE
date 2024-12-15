const express = require('express');
const router = express.Router();
const notificationController = require('../App/controllers/notification.controllers');
const authen = require('../App/middlewares/authen');

router.post('/create', notificationController.createNotification); // test
router.get('/get/:id', authen, notificationController.getUserNotifications);
router.delete('/delete/:id', authen, notificationController.deleteNotification);

module.exports = router;
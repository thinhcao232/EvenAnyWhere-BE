const express = require("express");
const router = express.Router();
const EventController = require("../App/controllers/event.controllers");
const authen = require("../App/middlewares/authen");
const autho = require("../App/middlewares/autho");
// Tạo mới một sự kiện, yêu cầu xác thực
router.post("/add", authen, autho, EventController.createEvent);

// Lấy danh sách tất cả các sự kiện
router.get("/get", EventController.getAllEvents);

// Lấy chi tiết sự kiện theo ID
router.get("/detail/:id", EventController.getEventById);

// Cập nhật thông tin sự kiện theo ID, yêu cầu xác thực
router.put("/update/:id", authen, autho, EventController.updateEvent);

// Xóa sự kiện theo ID, yêu cầu xác thực
router.delete("/delete/:id", authen, autho, EventController.deleteEvent);


module.exports = router;
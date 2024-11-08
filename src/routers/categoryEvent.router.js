const express = require('express');
const router = express.Router();
const categoryController = require('../App/controllers/categoryEvent.controllers');
const authen = require("../App/middlewares/authen");
//const autho = require("../App/middlewares/autho");

router.post('/add', authen, categoryController.createCategory);
router.get('/list', authen, categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/update/:id', authen, categoryController.updateCategory);
router.delete('/delete/:id', authen, categoryController.deleteCategory);

module.exports = router;
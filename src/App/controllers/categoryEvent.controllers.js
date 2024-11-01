const CategoryEvent = require('../models/categoryEvent.model');

exports.createCategory = async(req, res) => {
    const { name, description, image } = req.body;
    try {
        const existingCategory = await CategoryEvent.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
        }

        const newCategory = await CategoryEvent.create({ name, description, image });
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi tạo danh mục', error });
    }
};

exports.getAllCategories = async(req, res) => {
    try {
        const categories = await CategoryEvent.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách danh mục', error });
    }
};

// exports.getCategoryById = async(req, res) => {
//     const { id } = req.params;
//     try {
//         const category = await CategoryEvent.findById(id);
//         if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
//         res.status(200).json(category);
//     } catch (error) {
//         res.status(500).json({ message: 'Lỗi lấy danh mục', error });
//     }
// };

exports.updateCategory = async(req, res) => {
    const { id } = req.params;
    const { name, description, image } = req.body;
    try {
        const category = await CategoryEvent.findById(id);
        if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });

        category.name = name;
        category.description = description;
        category.image = image;
        const existingCategory = await CategoryEvent.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
        }
        await category.save();

        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi cập nhật danh mục', error });
    }
};

exports.deleteCategory = async(req, res) => {
    const { id } = req.params;
    try {
        const category = await CategoryEvent.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        }

        res.status(200).json({ message: 'Xoá danh mục thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xoá danh mục', error: error.message });
    }
};
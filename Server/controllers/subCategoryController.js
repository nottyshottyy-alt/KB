const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');

// @desc    Create a subcategory
// @route   POST /api/subcategories
// @access  Private/Admin
const createSubCategory = async (req, res, next) => {
    try {
        const { name, category } = req.body;
        
        let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const subCategoryExists = await SubCategory.findOne({ slug, category });
        if (subCategoryExists) {
            res.status(400);
            throw new Error('SubCategory already exists in this category');
        }

        const subCategory = await SubCategory.create({
            name,
            slug,
            category
        });

        res.status(201).json(subCategory);
    } catch (error) {
        next(error);
    }
};

// @desc    Get subcategories by category
// @route   GET /api/subcategories/:categoryId
// @access  Public
const getSubCategories = async (req, res, next) => {
    try {
        const subCategories = await SubCategory.find({ category: req.params.categoryId });
        res.json(subCategories);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a subcategory
// @route   DELETE /api/subcategories/:id
// @access  Private/Admin
const deleteSubCategory = async (req, res, next) => {
    try {
        const subCategory = await SubCategory.findById(req.params.id);

        if (subCategory) {
            await SubCategory.deleteOne({ _id: subCategory._id });
            res.json({ message: 'SubCategory removed' });
        } else {
            res.status(404);
            throw new Error('SubCategory not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSubCategory,
    getSubCategories,
    deleteSubCategory
};

const express = require('express');
const router = express.Router();
const {
    createSubCategory,
    getSubCategories,
    deleteSubCategory
} = require('../controllers/subCategoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, createSubCategory);

router.route('/:categoryId')
    .get(getSubCategories);

router.route('/:id')
    .delete(protect, admin, deleteSubCategory);

module.exports = router;

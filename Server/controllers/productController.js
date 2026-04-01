const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const pageSize = 12;
        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword
            ? { title: { $regex: req.query.keyword, $options: 'i' } }
            : {};

        const categoryFilter = req.query.category ? { category: req.query.category } : {};
        const subCategoryFilter = req.query.subCategory ? { subCategory: req.query.subCategory } : {};
        
        // Advanced filters
        const minPrice = req.query.minPrice ? { price: { $gte: Number(req.query.minPrice) } } : {};
        const maxPrice = req.query.maxPrice ? { price: { ...minPrice.price, $lte: Number(req.query.maxPrice) } } : minPrice;

        const filter = { ...keyword, ...categoryFilter, ...subCategoryFilter, ...maxPrice, isActive: true };

        // Sorting
        let sortOption = { createdAt: -1 }; // newest by default
        if (req.query.sort === 'price_asc') sortOption = { price: 1 };
        if (req.query.sort === 'price_desc') sortOption = { price: -1 };
        if (req.query.sort === 'popular') sortOption = { soldCount: -1 };

        const count = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug')
            .sort(sortOption)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ products, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        next(error);
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug');

        if (product && product.isActive) {
            res.json(product);
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
    try {
        const {
            title,
            description,
            price,
            discountPrice,
            stock,
            images,
            category,
            subCategory,
            isActive
        } = req.body;

        let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        // Ensure slug is unique, append timestamp if necessary (simple aproach)
        const exists = await Product.findOne({ slug });
        if(exists) {
            slug = `${slug}-${Date.now()}`;
        }

        const product = new Product({
            user: req.user._id,
            title,
            slug,
            description,
            price,
            discountPrice,
            stock,
            images: images || [],
            category,
            subCategory,
            isActive: isActive !== undefined ? isActive : true
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.title = req.body.title || product.title;
            product.description = req.body.description || product.description;
            product.price = req.body.price !== undefined ? req.body.price : product.price;
            product.discountPrice = req.body.discountPrice !== undefined ? req.body.discountPrice : product.discountPrice;
            product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
            product.images = req.body.images || product.images;
            product.category = req.body.category || product.category;
            product.subCategory = req.body.subCategory || product.subCategory;
            product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;

            if (req.body.title) {
                let slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                // verify uniqueness
                const exists = await Product.findOne({ slug, _id: { $ne: product._id } });
                if(exists) {
                    slug = `${slug}-${Date.now()}`;
                }
                product.slug = slug;
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await Product.deleteOne({ _id: product._id });
            res.json({ message: 'Product removed' });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res, next) => {
    try {
        const { rating, comment, images } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                res.status(400);
                throw new Error('Product already reviewed');
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                images: images || [],
                user: req.user._id,
            };

            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get related products (same category)
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) { res.status(404); throw new Error('Product not found'); }

        const related = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            isActive: true
        })
            .populate('category', 'name')
            .sort({ soldCount: -1 })
            .limit(4);

        res.json(related);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getRelatedProducts
};

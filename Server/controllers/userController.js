const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
// @desc    Auth user & get token (Includes Admin Login)
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Admin hardcoded check
        if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
            if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                // Generate a dummy admin ID for token or use a static one
                const adminId = '000000000000000000000000';
                generateToken(res, adminId);
                return res.json({
                    _id: adminId,
                    name: 'Store Admin',
                    email: process.env.ADMIN_EMAIL,
                    isAdmin: true,
                });
            }
        }

        const user = await User.findOne({ email });

        if (user && user.password && (await user.matchPassword(password))) {
            generateToken(res, user._id);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                avatar: user.avatar
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Google Auth (Sign In / Sign Up)
// @route   POST /api/users/google
// @access  Public
const googleAuth = async (req, res, next) => {
    try {
        const { credential } = req.body;

        // useGoogleLogin returns an access token — verify via userinfo endpoint
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${credential}` },
        });

        if (!response.ok) {
            res.status(401);
            throw new Error('Failed to verify Google access token');
        }

        const payload = await response.json();
        const { sub, email, name, picture } = payload;

        // If the Google email matches the hardcoded admin email, grant admin access
        if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL) {
            const adminId = '000000000000000000000000';
            generateToken(res, adminId);
            return res.json({
                _id: adminId,
                name: 'Store Admin',
                email: email,
                isAdmin: true,
                avatar: picture || null,
            });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                googleId: sub,
                avatar: picture,
                isAdmin: false
            });
        } else if (!user.googleId) {
            user.googleId = sub;
            user.avatar = picture || user.avatar;
            await user.save();
        }

        generateToken(res, user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            avatar: user.avatar
        });
    } catch (error) {
        console.error('Google Auth Error Details:', error);
        next(error);
    }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            generateToken(res, user._id);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                phone: user.phone,
                address: user.address,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) { res.status(404); throw new Error('User not found'); }

        user.name = req.body.name || user.name;
        user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
        if (req.body.avatar) user.avatar = req.body.avatar;
        if (req.body.address) {
            user.address = { ...user.address, ...req.body.address };
        }
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        const userData = {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            avatar: updatedUser.avatar,
            phone: updatedUser.phone,
            address: updatedUser.address,
        };
        res.json(userData);
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot password — send reset email
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) { res.status(404); throw new Error('No account with that email found'); }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        if (process.env.SMTP_HOST) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            });
            await transporter.sendMail({
                from: `KB COMPUTERS <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: 'Password Reset Request',
                html: `<p>You requested a password reset. Click the link below (valid for 30 minutes):</p><a href="${resetUrl}">${resetUrl}</a>`
            });
        }

        res.json({ message: 'Password reset email sent', resetUrl }); // resetUrl returned for dev/testing
    } catch (error) {
        next(error);
    }
};

// @desc    Reset password with token
// @route   POST /api/users/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) { res.status(400); throw new Error('Invalid or expired reset token'); }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        generateToken(res, user._id);
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
    try {
        // Hardcoded admin user has no DB document
        if (req.user._id === '000000000000000000000000' || req.user._id.toString() === '000000000000000000000000') {
            return res.json([]);
        }
        const user = await User.findById(req.user._id).populate({
            path: 'wishlist',
            select: 'title price discountPrice images rating numReviews stock isActive slug',
            populate: { path: 'category', select: 'name' }
        });
        if (!user) { res.status(404); throw new Error('User not found'); }
        res.json(user.wishlist.filter(p => p && p.isActive !== false));
    } catch (error) {
        next(error);
    }
};

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist
// @access  Private
const addToWishlist = async (req, res, next) => {
    try {
        if (req.user._id === '000000000000000000000000' || req.user._id.toString() === '000000000000000000000000') {
            return res.json({ message: 'Wishlist not available for admin', wishlist: [] });
        }
        const user = await User.findById(req.user._id);
        if (!user) { res.status(404); throw new Error('User not found'); }
        const { productId } = req.body;
        if (!user.wishlist.map(id => id.toString()).includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }
        res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
    try {
        if (req.user._id === '000000000000000000000000' || req.user._id.toString() === '000000000000000000000000') {
            return res.json({ message: 'Wishlist not available for admin', wishlist: [] });
        }
        const user = await User.findById(req.user._id);
        if (!user) { res.status(404); throw new Error('User not found'); }
        user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
        await user.save();
        res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    authUser,
    googleAuth,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    getUsers
};

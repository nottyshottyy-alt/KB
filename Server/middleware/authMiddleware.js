const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.userId === '000000000000000000000000') {
                req.user = { _id: decoded.userId, name: 'Store Admin', email: process.env.ADMIN_EMAIL, isAdmin: true };
            } else {
                req.user = await User.findById(decoded.userId).select('-password');
            }
            next();
        } catch (error) {
            res.status(401);
            next(new Error('Not authorized, token failed'));
        }
    } else {
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        next(new Error('Not authorized as an admin'));
    }
};

const optionalAuth = async (req, res, next) => {
    let token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.userId === '000000000000000000000000') {
                req.user = { _id: decoded.userId, name: 'Store Admin', email: process.env.ADMIN_EMAIL, isAdmin: true };
            } else {
                req.user = await User.findById(decoded.userId).select('-password');
            }
        } catch (error) {
            console.error(error);
        }
    }
    next();
};

module.exports = { protect, admin, optionalAuth };

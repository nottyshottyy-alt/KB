import jwt from 'jsonwebtoken';
import User from '../models/User';
import { cookies } from 'next/headers';

export const getAuthUser = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.userId === '000000000000000000000000') {
            return { _id: decoded.userId, name: 'Store Admin', email: process.env.ADMIN_EMAIL, isAdmin: true };
        }
        
        const user = await User.findById(decoded.userId).select('-password');
        return user;
    } catch (error) {
        return null;
    }
};

export const protect = async (req) => {
    const user = await getAuthUser();
    if (!user) {
        throw new Error('Not authorized');
    }
    return user;
};

export const admin = async (req) => {
    const user = await protect(req);
    if (!user.isAdmin) {
        throw new Error('Not authorized as an admin');
    }
    return user;
};

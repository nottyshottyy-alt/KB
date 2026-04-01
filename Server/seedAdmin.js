const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = process.env.ADMIN_EMAIL || 'kbcomputerz01@gmail.com';
        const password = process.env.ADMIN_PASSWORD || 'admin123';

        // Check if admin already exists
        let admin = await User.findOne({ email });

        if (admin) {
            // Update password and ensure isAdmin is true
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(password, salt);
            admin.isAdmin = true;
            await admin.save();
            console.log(`[+] Admin already existed. Password updated and admin privileges verified for ${email}`);
        } else {
            // Create new admin
            admin = new User({
                name: 'System Admin',
                email,
                password,
                isAdmin: true
            });
            await admin.save();
            console.log(`[+] Admin created successfully: ${email}`);
        }

        process.exit();
    } catch (error) {
        console.error(`[-] Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();

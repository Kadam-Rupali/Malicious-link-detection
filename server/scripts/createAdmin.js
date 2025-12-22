const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Admin credentials
        const adminEmail = 'admin@example.com'; // Use this email to login
        const adminPassword = 'admin123'; // Use this password to login

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create admin user
        const admin = new User({
            email: adminEmail,
            password: hashedPassword,
            role: 'admin' // Make sure this is set
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();
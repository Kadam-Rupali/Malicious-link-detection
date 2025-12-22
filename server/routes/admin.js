const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get system statistics (admin only)
router.get('/stats', auth, adminAuth, async(req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalScans = await Analysis.countDocuments();
        const maliciousUrls = await Analysis.countDocuments({
            'result.isMalicious': true
        });

        res.json({
            totalUsers,
            totalScans,
            maliciousUrls
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

// Get all users (admin only)
router.get('/users', auth, adminAuth, async(req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Update user roles (admin only)
router.put('/users/:userId/role', auth, adminAuth, async(req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId, { role }, { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role' });
    }
});

// Configure automatic scanning (admin only)
router.put('/config/auto-scan', auth, adminAuth, async(req, res) => {
    try {
        const { enabled } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id, { autoScanEnabled: enabled }, { new: true }
        );
        res.json({ success: true, autoScanEnabled: user.autoScanEnabled });
    } catch (error) {
        res.status(500).json({ message: 'Error updating auto-scan configuration' });
    }
});

// Manage API keys (admin only)
router.put('/config/api-keys', auth, adminAuth, async(req, res) => {
    try {
        const { virusTotal, other } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id, {
                'customApiKeys.virusTotal': virusTotal,
                'customApiKeys.other': other
            }, { new: true }
        );
        res.json({ success: true, apiKeys: user.customApiKeys });
    } catch (error) {
        res.status(500).json({ message: 'Error updating API keys' });
    }
});

module.exports = router;
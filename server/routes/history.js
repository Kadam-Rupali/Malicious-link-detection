const express = require('express');
const router = express.Router();
const Analysis = require('../models/Analysis');
const auth = require('../middleware/auth');

// Get user's search history
router.get('/', auth, async(req, res) => {
    try {
        const history = await Analysis.find({ userId: req.user._id })
            .sort({ timestamp: -1 })
            .limit(10);
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Error fetching history' });
    }
});

// Get user's statistics
router.get('/stats', auth, async(req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [urlsAnalyzedToday, threatsDetected, safeUrls] = await Promise.all([
            Analysis.countDocuments({
                userId: req.user._id,
                timestamp: { $gte: today }
            }),
            Analysis.countDocuments({
                userId: req.user._id,
                'result.isMalicious': true,
                timestamp: { $gte: today }
            }),
            Analysis.countDocuments({
                userId: req.user._id,
                'result.isMalicious': false,
                timestamp: { $gte: today }
            })
        ]);

        res.json({
            urlsAnalyzedToday,
            threatsDetected,
            safeUrls
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

module.exports = router;
const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    result: {
        isMalicious: Boolean,
        threatType: String,
        confidence: String,
        virusTotalData: Object,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

// Index for caching and quick lookups
analysisSchema.index({ url: 1, timestamp: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
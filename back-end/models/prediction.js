const mongoose = require('mongoose');

const PredictionSchema = mongoose.Schema({
    machine_id: {
        type: String,
        required: true
    },
    risk_level: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        required: true
    },
    probability:{
        type: Number,
        required: true
    },
    timestamp:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
const mongoose = require('mongoose');

const SensorSchema = new mongoose.Schema({
    machine_id: {
        type: String,
        required: true
    },
    air_temp: {
        type: Number,
        required: true
    },
    process_temp: {
        type: Number,
        required: true
    },
    rpm: {
        type: Number,
        required: true
    },
    torque: {
        type: Number,
        required: true
    },
    tool_wear: {
        type: Number,
        required: true
    },
    timestamp:{
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Sensor', SensorSchema);
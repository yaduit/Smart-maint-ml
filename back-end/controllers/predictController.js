const axios      = require('axios')
const Sensor     = require('../models/sensor.js')
const Prediction = require('../models/prediction.js')

exports.runPredictions = async (req, res) => {
  try {
    //latest sensor reading
    const latestSensors = await Sensor.aggregate([
      { $sort: { timestamp: -1 } },                        // newest first
      { $group: { _id: '$machine_id', doc: { $first: '$$ROOT' } } }, // 1 per machine
      { $replaceRoot: { newRoot: '$doc' } }               // flatten
    ])

    if (latestSensors.length === 0) {
      return res.status(400).json({
        error: 'No sensor data found. Please upload a CSV first.'
      })
    }

    //Format data for Flask
    const flaskPayload = latestSensors.map(s => ({
      machine_id:   s.machine_id,
      air_temp:     s.air_temp,
      process_temp: s.process_temp,
      rpm:          s.rpm,
      torque:       s.torque,
      tool_wear:    s.tool_wear
    }))

    // Calling Flask ML service 
    const flaskRes = await axios.post(
      `${process.env.FLASK_URL}/predict`,
      flaskPayload,
      { timeout: 10000 }  
    )
    const predictions = flaskRes.data

    // Save predictions to MongoDB 
    await Prediction.deleteMany({})  
    await Prediction.insertMany(
      predictions.map(p => ({
        machine_id:  p.machine_id,
        risk_level:  p.risk_level,
        probability: p.probability,
        timestamp:   new Date()
      }))
    )

    //Build summary and return 
    const summary = {
      total:  predictions.length,
      high:   predictions.filter(p => p.risk_level === 'High').length,
      medium: predictions.filter(p => p.risk_level === 'Medium').length,
      low:    predictions.filter(p => p.risk_level === 'Low').length
    }

    res.json({ success: true, predictions, summary })

  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(500).json({
        error: 'Flask ML service is not running! Start it: cd ml-service && python app.py'
      })
    }
    res.status(500).json({ error: err.message })
  }
}
const axios      = require('axios')
const sensor     = require('../models/sensor.js')
const Prediction = require('../models/prediction.js')

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) },
    (_, i) => arr.slice(i * size, i * size + size))

exports.runPredictions = async (req, res) => {
  try {
    // All unique machines — no limit
    const latestsensors = await sensor.aggregate([
      { $sort:        { timestamp: -1 } },
      { $group:       { _id: '$machine_id', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort:        { machine_id: 1 } }
    ])

    if (!latestsensors.length) {
      return res.status(400).json({ error: 'No sensor data. Upload a CSV first.' })
    }


    const payload = latestsensors.map(s => ({
      machine_id:   s.machine_id,
      air_temp:     s.air_temp,
      process_temp: s.process_temp,
      rpm:          s.rpm,
      torque:       s.torque,
      tool_wear:    s.tool_wear
    }))

    // Sequential batches of 100 — prevents Flask timeout
    const batches     = chunk(payload, 100)
    const predictions = []

    for (let i = 0; i < batches.length; i++) {
      const { data } = await axios.post(
        `${process.env.FLASK_URL}/predict`,
        JSON.stringify(batches[i]),
        { timeout: 30000, headers: { 'Content-Type': 'application/json' } }
      )
      predictions.push(...data)
    }

    // Replace all predictions in MongoDB
    await Prediction.deleteMany({})
    await Prediction.insertMany(
      predictions.map(p => ({
        machine_id:  p.machine_id,
        risk_level:  p.risk_level,
        probability: p.probability,
        timestamp:   new Date()
      }))
    )

    const summary = {
      total:  predictions.length,
      high:   predictions.filter(p => p.risk_level === 'High').length,
      medium: predictions.filter(p => p.risk_level === 'Medium').length,
      low:    predictions.filter(p => p.risk_level === 'Low').length,
    }

    console.log('Predictions complete:', summary)
    res.json({ success: true, summary })

  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(500).json({
        error: 'Flask is not running. Start it: cd ml-service && python app.py'
      })
    }
    console.error('Predict error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
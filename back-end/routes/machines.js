const express    = require('express')
const router     = express.Router()
const Sensor     = require('../models/sensor.js')
const Prediction = require('../models/prediction.js')

//full machine list with sensor data + risk level
router.get('/', async (req, res) => {
  try {
    // Latest sensor reading per machine
    const sensors = await Sensor.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$machine_id', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { machine_id: 1 } },
      { $limit: 30 } 
    ])

    // Build a quick lookup map for predictions
    const preds = await Prediction.find()
    const predMap = {}
    preds.forEach(p => predMap[p.machine_id.trim()] = p)

    // Merge both into one array
    const machines = sensors.map(s => ({
      machine_id:   s.machine_id,
      air_temp:     s.air_temp,
      process_temp: s.process_temp,
      rpm:          s.rpm,
      torque:       s.torque,
      tool_wear:    s.tool_wear,
      risk_level:   predMap[s.machine_id]?.risk_level  ?? 'Unknown',
      probability:  predMap[s.machine_id]?.probability ?? null
    }))
    console.log('Prediction IDs:', Object.keys(predMap).slice(0, 5))
    console.log('Sensor IDs    :', sensors.map(s => s.machine_id).slice(0, 5))

    res.json(machines)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
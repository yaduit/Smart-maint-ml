const express    = require('express')
const router     = express.Router()
const Sensor     = require('../models/sensor.js')
const Prediction = require('../models/prediction.js')

// Safe operating thresholds (from the AI4I domain knowledge)
const THRESHOLDS = {
  air_temp:     308,   // Kelvin
  process_temp: 313,
  rpm:          2800,
  torque:       65,
  tool_wear:    200    // minutes
}

router.get('/', async (req, res) => {
  try {
    // Latest sensor per machine
    const sensors = await Sensor.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$machine_id', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } }
    ])

    const highRisk = await Prediction.find({ risk_level: { $in: ['High', 'Medium'] } })
    const riskMap  = {}
    highRisk.forEach(p => riskMap[p.machine_id] = p)

    const alerts = []

    sensors.forEach(s => {
      // Threshold-based checks
      if (s.air_temp > THRESHOLDS.air_temp)
        alerts.push({ machine_id: s.machine_id, type: 'threshold', severity: 'critical',
          message: `Air temp ${s.air_temp.toFixed(1)}K exceeds safe limit (${THRESHOLDS.air_temp}K)` })

      if (s.tool_wear > THRESHOLDS.tool_wear)
        alerts.push({ machine_id: s.machine_id, type: 'threshold', severity: 'warning',
          message: `Tool wear ${s.tool_wear}min — replacement recommended` })

      if (s.torque > THRESHOLDS.torque)
        alerts.push({ machine_id: s.machine_id, type: 'threshold', severity: 'warning',
          message: `Torque ${s.torque.toFixed(1)}Nm above normal range` })

      // ML-based alert
      if (riskMap[s.machine_id]) {
        const p = riskMap[s.machine_id]
        alerts.push({ machine_id: s.machine_id, type: 'ml_prediction',
          severity: p.risk_level === 'High' ? 'critical' : 'warning',
          message: `ML: ${p.risk_level} failure risk (${(p.probability*100).toFixed(0)}% probability)` })
      }
    })

    // Sort: critical first
    alerts.sort((a, b) => a.severity === 'critical' ? -1 : 1)
    res.json(alerts)

  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
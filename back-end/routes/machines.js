const express    = require('express')
const router     = express.Router()
const Sensor     = require('../models/sensor.js')
const Prediction = require('../models/prediction.js')

router.get('/', async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 30, 10000)
    const skip  = (page - 1) * limit

    // Count total unique machines
    const countResult = await Sensor.aggregate([
      { $group: { _id: '$machine_id' } },
      { $count: 'total' }
    ])
    const total      = countResult[0]?.total || 0
    const totalPages = Math.max(Math.ceil(total / limit), 1)

    // Paginated latest reading per machine
    const sensors = await Sensor.aggregate([
      { $sort:        { timestamp: -1 } },
      { $group:       { _id: '$machine_id', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort:        { machine_id: 1 } },
      { $skip:        skip },
      { $limit:       limit }
    ])

    // All predictions as lookup map
    const preds   = await Prediction.find(
      {}, 'machine_id risk_level probability'
    ).lean()

    const predMap = {}
    preds.forEach(p => {
      if (p.machine_id) predMap[p.machine_id.trim()] = p
    })

    // Merge sensor + prediction per machine
    const machines = sensors.map(s => ({
      machine_id:   s.machine_id,
      air_temp:     s.air_temp,
      process_temp: s.process_temp,
      rpm:          s.rpm,
      torque:       s.torque,
      tool_wear:    s.tool_wear,
      risk_level:   predMap[s.machine_id?.trim()]?.risk_level  ?? 'Unknown',
      probability:  predMap[s.machine_id?.trim()]?.probability ?? null
    }))

    // Summary across ALL predictions 
    const summary = {
      total,
      high:   preds.filter(p => p.risk_level === 'High').length,
      medium: preds.filter(p => p.risk_level === 'Medium').length,
      low:    preds.filter(p => p.risk_level === 'Low').length,
    }

    res.json({ machines, total, page, totalPages, limit, summary })

  } catch (err) {
    console.error('Machines error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
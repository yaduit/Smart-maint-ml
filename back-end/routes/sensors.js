const express = require('express')
const router  = express.Router()
const Sensor  = require('../models/sensor.js')

// all sensor readings
router.get('/', async (req, res) => {
  try {
    const sensors = await Sensor.find().sort({ machine_id: 1 }).limit(1000)
    res.json(sensors)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/sensors/:machine_id — one machine's readings
router.get('/:machine_id', async (req, res) => {
  try {
    const sensors = await Sensor.find({ machine_id: req.params.machine_id })
    res.json(sensors)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
const express    = require('express')
const router     = express.Router()
const Prediction = require('../models/prediction.js')

router.get('/', async (req, res) => {
  try {
    const data = await Prediction.find().sort({ risk_level: 1, machine_id: 1 })
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
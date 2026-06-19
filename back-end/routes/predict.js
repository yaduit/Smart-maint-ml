const express = require('express')
const router  = express.Router()
const { runPredictions, getPredictionStatus } = require('../controllers/predictController.js')

router.post('/', runPredictions)

module.exports = router
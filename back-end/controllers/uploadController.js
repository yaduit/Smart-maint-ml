// controllers/uploadController.js
const csv    = require('csv-parser')
const fs     = require('fs')
const sensor = require('../models/sensor.js')

exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const rows = []

    // Read the uploaded CSV file row by row
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        // Handles BOTH the AI4I column names AND simple column names
        rows.push({
          machine_id: row['machine_id'] || row['Product ID'],
          air_temp: parseFloat(row['air_temp'] || row['Air temperature [K]']),
          process_temp: parseFloat(row['process_temp'] || row['Process temperature [K]']),
          rpm: parseFloat(row['rpm'] || row['Rotational speed [rpm]']),
          torque: parseFloat(row['torque'] || row['Torque [Nm]']),
          tool_wear: parseFloat(row['tool_wear'] || row['Tool wear [min]']),
          timestamp: new Date()
        })
      })
      .on('end', async () => {
        // Filter out rows with missing values
        const valid = rows.filter(r =>
          r.machine_id && !isNaN(r.air_temp) && !isNaN(r.rpm)
        )

        await sensor.deleteMany({})
        await sensor.insertMany(valid)

        fs.unlinkSync(req.file.path)

        const uniqueMachines = [...new Set(valid.map(r => r.machine_id))]

        res.json({
          success: true,
          message: `${valid.length} rows saved for ${uniqueMachines.length} machines`,
          total_rows: valid.length,
          machines: uniqueMachines.length,
          machine_ids: uniqueMachines
        })
      })
      .on('error', (err) => {
        res.status(500).json({ error: 'CSV parse error: ' + err.message })
      })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
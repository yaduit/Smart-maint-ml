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

    const cleanupFile = () => {
      try {
        if (req.file?.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path)
        }
      } catch (cleanupErr) {
        console.error('Failed to remove uploaded file:', cleanupErr.message)
      }
    }

    // Read the uploaded CSV file row by row
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
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
          r.machine_id &&
          Number.isFinite(r.air_temp) &&
          Number.isFinite(r.process_temp) &&
          Number.isFinite(r.rpm) &&
          Number.isFinite(r.torque) &&
          Number.isFinite(r.tool_wear)
        )

        await sensor.deleteMany({})
        await sensor.insertMany(valid)

        cleanupFile()

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
        cleanupFile()
        res.status(500).json({ error: 'CSV parse error: ' + err.message })
      })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
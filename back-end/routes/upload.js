// routes/upload.js
const express  = require('express')
const multer   = require('multer')
const path     = require('path')
const fs       = require('fs')
const router   = express.Router()
const { uploadCSV } = require('../controllers/uploadController.js')

const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => cb(null, 'upload-' + Date.now() + path.extname(file.originalname))
})

// Only accept .csv files
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files are allowed'))
    }
  }
})

router.post('/', upload.single('file'), uploadCSV);

module.exports = router
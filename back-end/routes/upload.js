// routes/upload.js
const express  = require('express')
const multer   = require('multer')
const path     = require('path')
const router   = express.Router()
const { uploadCSV } = require('../controllers/uploadController.js')

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, 'upload-' + Date.now() + path.extname(file.originalname))
})

// Only accept .csv files
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) === '.csv') {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files are allowed'))
    }
  }
})

router.post('/', upload.single('file'), uploadCSV);

module.exports = router
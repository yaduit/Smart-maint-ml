const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json())

app.use('/api/upload', require('./routes/upload'));
app.use('/api/predict', require('./routes/predict'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/machines', require('./routes/machines'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/alerts', require('./routes/alerts'));


app.get('/health',(req,res)=>{
    res.json({status: 'ok',service: 'smartmaint-api'})
});

module.exports = app
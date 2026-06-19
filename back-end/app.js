const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN        // only your Vercel URL
    : '*',                           // any origin in development
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json())

app.use('/api/upload', require('./routes/upload'));
app.use('/api/predict', require('./routes/predict'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/machines', require('./routes/machines'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/alerts', require('./routes/alerts'));
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production'
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Something went wrong'
  })
})


app.get('/health',(req,res)=>{
    res.json({status: 'ok',service: 'smartmaint-api'})
});

module.exports = app
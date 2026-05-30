require('dotenv').config()
const app = require('./app.js');
const connectDB = require('./config/db.js');


const PORT = process.env.PORT || 3001

connectDB();

app.listen(PORT, ()=>{
    console.log(`smartmaint API running on port${PORT}`)
});
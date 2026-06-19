const mongoose = require('mongoose');

const connectDB = async()=>{
    const uri = process.env.MONGO_URI
    if (!uri) {
        console.error('MONGO_URI is not configured')
        process.exit(1)
    }

    try{
        await mongoose.connect(uri)
        console.log('db connected')
    }catch(err){
        console.error('db connection failed')
        process.exit(1)
    }
}
module.exports = connectDB

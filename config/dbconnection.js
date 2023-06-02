const mongoose = require('mongoose')
mongoose.connect(process.env.Mongo)
const connection = mongoose.connection

connection.on('connected', () => console.log('Database connected'))

connection.on('error',(error)=>{
    console.log('Error in MongoDB Connection',error);
})
module.exports=mongoose
const mongoose = require("mongoose");

const connectDb = async() =>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser : true,
            useUnifiedTopology: true,
        });

        console.log(`Db connected : ${conn.connection.host}`.green.bold);
    }catch(error){
        console.log(`Error: ${error.message}`.red.bold);
    }
}

module.exports = connectDb;
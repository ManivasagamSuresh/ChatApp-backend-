const mongoose = require('mongoose');

const messageScheme = new mongoose.Schema({
    name : String,
    message : String,
    timestamp : String,
    uid : String,
    roomId : String
},
{
    timestamps:true
})


const messages = mongoose.model("messages",messageScheme);

module.exports=messages;
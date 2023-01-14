const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
    {
        name : String,
    },
    {
        timestamps: true,
    }
);

const rooms = mongoose.model('rooms',roomSchema);

module.exports=rooms;
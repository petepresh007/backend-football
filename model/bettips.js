const mongoose = require("mongoose");

//bet schema
const betShema = new mongoose.Schema({
    title:{
        type: String,
        required: [true, "a title is required"]
    },
    tips: {
        type: String,
        required: [true, "bet tips is required"]
    },
    file: String,
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref:"Admin",
        required: [true, "an admin is required..."]
    }
}, {timestamps: true});

module.exports = mongoose.model("Bet", betShema);
const mongoose = require("mongoose");
const landingSchema = new mongoose.Schema({
    file: String,
    writeup: {
        type: String,
        required: [true, "the write up is required..."]
    }
}, {timestamps: true});

module.exports = mongoose.model("Landingpage", landingSchema)
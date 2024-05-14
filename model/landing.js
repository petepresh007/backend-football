const mongoose = require("mongoose");

//landing page schema
const landingSchema = new mongoose.Schema({
    file: String,
    writeup: {
        type: String,
        required: [true, "the write up is required..."]
    }
}, {timestamps: true});

module.exports = mongoose.model("Landingpage", landingSchema)
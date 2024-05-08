const mongoose = require('mongoose');

const footballSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'The title is required...'],
    unique: true
  },
  news: {
    type: String,
    required: [true, 'news is needed']
  },
  file: Array,
  category: {
    type: String,
    enum: ['News', 'EPL', 'Laliga', 'Serie A', 'Bundesliga', 'NPFL', 'Others', 'UCL'],
    required: [true, 'a category is needed..']
  },
  date: Date,
  createdBy: {
    type: mongoose.Types.ObjectId,
    required: [true, 'the creator is required']
  }

}, { timestamps: true });

module.exports = mongoose.model("Football", footballSchema)
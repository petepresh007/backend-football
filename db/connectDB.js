const mongoose = require('mongoose');

const connectDB = () => {
  const connectdatabase = mongoose.connect(process.env.URI);
  return connectdatabase;
};

module.exports = connectDB;

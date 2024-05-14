const mongoose = require('mongoose');

//a function for connecting database using mongoDB
const connectDB = () => {
  const connectdatabase = mongoose.connect(process.env.URI);
  return connectdatabase;
};

module.exports = connectDB;

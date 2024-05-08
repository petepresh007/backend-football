const { Schema, model } = require('mongoose');

const adminSchema = new Schema({
  username: {
    type: String,
    required: [true, 'username is required'],
    validate: {
      validator: function (v) {
        return !/\s/.test(v);
      },
      message: props => `${props.value} cannot contain spaces!`
    }
    // min: 8,
    // max: 12
  },
  email: {
    type: String,
    required: [true, 'please, enter an email address'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'password is required to loging....'],
    // max: 8,
    // min: 4
  },
  date: Date
});

const Admin = model('Admin', adminSchema);
module.exports = Admin;

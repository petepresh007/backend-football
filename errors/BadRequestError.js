const CustomApiError = require('./customApiError');

//a class for badrequest error
class BadRequestError extends CustomApiError {
  constructor (message) {
    super(message);
    this.statusCode = 400;
  }
}

module.exports = BadRequestError;

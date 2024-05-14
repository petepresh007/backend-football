const CustomApiError = require('./customApiError');

//a class for conflict error error
class ConflictError extends CustomApiError {
  constructor (message) {
    super(message);
    this.statusCode = 409;
  }
}

module.exports = ConflictError;

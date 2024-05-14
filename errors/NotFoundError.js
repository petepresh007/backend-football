const CustomApiError = require('./customApiError');

//not found error
class NotFoundError extends CustomApiError {
  constructor (message) {
    super(message);
    this.statusCode = 404;
  }
}

module.exports = NotFoundError;

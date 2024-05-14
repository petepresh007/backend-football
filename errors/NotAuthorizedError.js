const CustomApiError = require('./customApiError');

//not authourized error
class NotAuthorizedError extends CustomApiError {
  constructor (message) {
    super(message);
    this.statusCode = 401;
  }
}

module.exports = NotAuthorizedError;

// a class for custom api error
class CustomApiError extends Error {
  constructor (message) {
    super(message);
  }
}

module.exports = CustomApiError;

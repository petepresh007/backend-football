const BadRequestError = require('./BadRequestError');
const NotAuthorizedError = require('./NotAuthorizedError');
const ConflictError = require('./ConflictError');
const NotFoundError = require('./NotFoundError');

//exporting all the error handlers
module.exports = { BadRequestError, NotAuthorizedError, ConflictError, NotFoundError };

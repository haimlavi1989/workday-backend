const { validationResult } = require('express-validator');

// Middleware to handle validation errors
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: '400',
      error: {
        message: errors.array().map(error => error.msg).join(', ')
      }
    });
  }
  next();
}

module.exports = { validateRequest };
const { check } = require('express-validator');

exports.signupValidationRules = () => [
    check('name').custom((value) => {
      const parts = value?.split(' ') || [];
      if (parts.length < 2) {
        return false;
      }
      return true;
    }).withMessage('Full name must include both first name and last name'),
    check('email').isEmail().withMessage('Invalid email address'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    check('passwordConfirm').custom((value, { req }) => {
      if (value !== req.body.password) {
        return false;
      }
      return true;
    }).withMessage('Passwords do not match')
];
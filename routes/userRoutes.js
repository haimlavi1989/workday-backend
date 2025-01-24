const express = require('express');
const Router = express.Router();
const authController = require('./../controllers/authController');
const signupValidation = require('../validation/signupValidation');
const validationMiddleware = require('../validation/validationMiddleware');
const userController = require('./../controllers/userController');

Router.post('/signup',
  signupValidation.signupValidationRules(),
  validationMiddleware.validateRequest,
  authController.signup);
Router.post('/login',
  authController.login
);

Router.post('/forgotPassword', authController.forgotPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);


Router.route('/')
  .get(userController.getUsers)
  .post(userController.createUser)

Router.route('/:id')
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = Router;

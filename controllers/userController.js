const userModel = require('./../models/userModel');
const AppError = require('./..//utils/appError');
const factory = require('./../controllers/handlerFactory');

exports.getUsers = factory.getAll(userModel);
exports.updateUser = factory.updateOne(userModel);
exports.deleteUser = factory.deleteOne(userModel);
exports.createUser = factory.createOne(userModel);
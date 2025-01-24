const DietModel = require('../models/dietModel');
const ReminderModel = require('../models/reminderModel');
const AppError = require('./../utils/appError');
const factory = require('./../controllers/handlerFactory');
const moment = require('moment-timezone');

exports.getAllForSpecificUserID = factory.getAllForSpecificUserID(DietModel);
exports.getDiet = factory.getOne(DietModel);
exports.updateDiet = factory.updateOne(DietModel);
exports.deleteDiet = factory.deleteOne(DietModel);

exports.createDiet = async (req, res, next) => {
  try {
    console.log(req.body);
    const diet = new DietModel({
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      foodList: req.body.foodList,
      weight: Number(req.body.weight),
      createdBy: req.user.id
    });

    req.diet = await DietModel.create(diet);

    const defaultReminder = new ReminderModel({
      dietID: req.diet._id,
      createdBy: req.user.id
    });

    const savedReminder = await ReminderModel.create(defaultReminder);
    await DietModel.findByIdAndUpdate(req.diet._id, { reminderId: savedReminder._id });
    req.diet.reminderId = savedReminder._id;

    res.status(201).json({
      status: '201',
      data: {
        diet: req.diet
      }
    });
  } catch (err) {
    return next(new AppError(err, 500));
  }
};

exports.getDietWeightsForSpecificUserId = async (req, res, next) => {
  try {
    console.log(req.user);
    const userId = req.user.id;
    const  duration = req.query | (7 * 24 * 60 * 60 * 1000);

    const startTime = moment().subtract(duration, 'milliseconds').startOf('day').toDate();
    const endTime = moment().endOf('day').toDate();

    const weights = await DietModel.getDietWeightsForUserInTimeRange(userId, startTime, endTime);

    res.status(200).json({ series: { dataSeries1: weights } });
  } catch (error) {
    console.error('Error fetching diet weights:', error);
    return next(new AppError(error, 500));
  }
};





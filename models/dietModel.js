const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;
const ReminderModel = require('./reminderModel');

const dietSchema = new mongoose.Schema(
      {
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        },
        foodList: {
            type: [String],
            default: [],
        },
        reminderId:  {
          type: ObjectId,
          ref: 'Reminder',
        },
        weight: {
         type: Number
        },
        createdAt: {
          type: Date,
          default: Date(),
          select: false,
        },
        createdBy: {
          type: ObjectId,
          ref: 'User',
        }
      },
      {
          timestamps: true,
          toJSON: { virtuals: true },
          toObject: { virtuals: true }
      }
  );


dietSchema.pre('remove', { document: false, query: false }, async function (next) {
  try {
    // If there is a reminderId associated with this diet, remove it
    if (this.reminderId) {
      await ReminderModel.deleteOne({ _id: this.reminderId });
    }
    next();
  } catch (error) {
    next(error);
  }
});

const DietModel = mongoose.model('Diet', dietSchema);

// DietModel.getDietWeightsForUserInTimeRange = async (userid, startDateTime, endDateTime) => {
//   // Query the database for diet records within the specified time range for the given user ID
//   const weights = await DietModel.find({
//     createdBy: userid,
//     createdAt: { $gte: new Date(startDateTime), $lte: new Date(endDateTime) }
//   }).select('weight createdAt');
//
//   // Format the retrieved data into the expected format
//   return {
//     weights: weights.map(weight => weight.weight),
//     dates: weights.map(weight => weight.createdAt.toDateString()) // Format date as "Day Month Year"
//   };
// };

DietModel.getDietWeightsForUserInTimeRange = async (userid, startDateTime, endDateTime) => {
  try {
    console.log("Querying for records between", startDateTime, "and", endDateTime);

    const weights = await DietModel.find({
      createdBy: userid,
      createdAt: { $gte: startDateTime, $lte: endDateTime }
    }).select('weight createdAt');

    console.log("Retrieved weights:", weights);

    // Format the retrieved data into the expected format
    return {
      weights: weights.map(weight => weight.weight),
      dates: weights.map(weight => weight.createdAt.toDateString()) // Format date as "Day Month Year"
    };
  } catch (error) {
    console.error("Error fetching diet records:", error);
    throw error; // Handle or rethrow the error as needed
  }
};

module.exports = DietModel;

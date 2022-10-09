/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const Activity = require('./activityModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createAt: {
      type: Date,
      default: Date.now,
    },
    activity: {
      type: mongoose.Schema.ObjectId,
      ref: 'Activity',
      required: [true, 'Review must belong to a activity'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next(); //
});

reviewSchema.statics.calAverageRatings = async function (activityId) {
  const stats = await this.aggregate([
    {
      $match: { activity: activityId },
    },
    {
      $group: {
        _id: '$activity',
        nRating: { $sum: 1 },
        aveRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Activity.findByIdAndUpdate(activityId, {
      ratingQuantity: stats[0].nRating,
      ratingAverage: stats[0].aveRating,
    });
  } else {
    //default
    await Activity.findByIdAndUpdate(activityId, {
      ratingQuantity: 0,
      ratingAverage: 4.5,
    });
  }
};

reviewSchema.index({ activity: 1, user: 1 }, { unique: true });
reviewSchema.post('save', function () {
  this.constructor.calAverageRatings(this.activity);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

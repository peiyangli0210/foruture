/* eslint-disable no-unused-vars */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');
const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'an activity must have a string name'],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Activity should more than 0 day.'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Activity should have a max group size.'],
    },
    difficulty: {
      //改为type
      type: String,
      required: [true, 'Activity should tag a type.'],
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'no description'],
    },
    imageCover: {
      type: String,
      required: [true, 'no image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretActivity: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //先维度
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number], //先维度
        address: String,
        description: String,
        day: Number,
      },
    ],
    //reference user
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review',
    //   },
    // ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

activitySchema.index({ ratingAverage: 1 });
activitySchema.index({ startLocation: '2dsphere' });
//virual populate
activitySchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'activity',
  localField: '_id',
});

activitySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
activitySchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

activitySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
// //EMBEDDING GUIDE
// activitySchema.post('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;

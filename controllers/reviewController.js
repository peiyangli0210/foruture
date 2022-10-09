/* eslint-disable prettier/prettier */
const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const handler = require('./handler');
// eslint-disable-next-line prettier/prettier

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.activityId) filter = { activity: req.params.activityId };
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// exports.createReview = catchAsync(async (req, res, next) => {
//   if (!req.body.activity) req.body.activity = req.params.activityId;
//   if (!req.body.user) req.body.user = req.user.id;
//   const newReview = await Review.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview,
//     },
//   });
// });
exports.setActivityUserIds = (req, res, next) => {
  if (!req.body.activity) req.body.activity = req.params.activityId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getReview = handler.getOne(Review);
exports.createReview = handler.createOne(Review);
exports.updateReview = handler.updateOne(Review);
exports.deleteReview = handler.deleteOne(Review);

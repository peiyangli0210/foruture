/* eslint-disable prettier/prettier */
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const handler = require('./handler');
//const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // create error
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not use for password update,please use /updateMyPassword',
        400
      )
    );
  }
  //update data
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    date: null,
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'not yet defined  to signup',
  });
};
// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'not yet defined',
//   });
// };
// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'not yet define1d',
//   });
// };
// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'not yet defined',
//   });
// };
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getUser = handler.getOne(User, null);
//exports.createUser = handler.createOne(User);
exports.updateUser = handler.updateOne(User);

exports.deleteUser = handler.deleteOne(User);

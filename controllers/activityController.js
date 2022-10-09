/* eslint-disable lines-between-class-members */
/* eslint-disable prefer-object-spread */
/* eslint-disable prettier/prettier */
const fs = require('fs');
const Activity = require('./../models/activityModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handler = require('./handler');
// const activities = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/activities-origin.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   const id = req.params.id * 1; // 自动转化为数字类型
//   console.log(id);
//   if (id > activities.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'invalid ID',
//     });
//   }
//   next(); // go to next middleware
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'miss name or price',
//     });
//   }
//   next();
// };
exports.aliasTopActivities = (req, res, next) => {
  req.query.limit = '9';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name, price, ratingAverage';
  next();
};
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString }; // 硬拷贝对象
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    //let query = Activity.find(queryObjNew);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__V');
    }
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    // if (this.queryString.page) {
    //   const numActivities = await Activity.countDocuments();
    //   if (skip >= numActivities) throw new Error('This page does not exist');
    // }
    return this;
  }
}

exports.getAllActivities = catchAsync(async (req, res, next) => {
  // const queryObj = { ...req.query }; // 硬拷贝对象
  // const excludeFields = ['page', 'sort', 'limit', 'fields'];
  // excludeFields.forEach((el) => delete queryObj[el]);
  // console.log(req.query);
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  // const queryObjNew = JSON.parse(queryStr);
  // let query = Activity.find(queryObjNew);
  //sort
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');

  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('-createdAt');
  // }
  //fields
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__V');
  // }
  //page
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 5;
  // const skip = (page - 1) * limit;
  // query = query.skip(skip).limit(limit);
  // if (req.query.page) {
  //   const numActivities = await Activity.countDocuments();
  //   if (skip >= numActivities) throw new Error('This page does not exist');
  // }

  const features = new APIFeatures(Activity.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const activities = await features.query;

  res.status(200).json({
    status: 'success',
    results: activities.length,
    data: {
      activities, //上面const 解析的 activities
    },
  });
});
// exports.getActivity = catchAsync(async (req, res, next) => {
//   console.log(req.query);
//   const activity = await Activity.findById(req.params.id).populate('reviews'); //填充reference的数据 populate做中间件
//   if (!activity) {
//     return next(new AppError('activity ID is illegal', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       activity, //上面const 解析的 activities
//     },
//   });
// });
exports.getActivity = handler.getOne(Activity, { path: 'reviews' });
// exports.creatActivity = (req, res) => {
//   console.log(req.body);
//   //database can automatically get id however now there is no database
//   new id();
//   const newId = activities[activities.length - 1].id + 1;
//   //merge by assign
//   const newActivity = Object.assign({ id: newId }, req.body);
//   activities.push(newActivity);
//   fs.writeFile(
//     `${__dirname}/dev-data/data/activities-origin.json`,
//     JSON.stringify(activities),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           activity: newActivity,
//         },
//       });
//     }
//   );
//   res.send('Done');
// };

// exports.createActivity = catchAsync(async (req, res, next) => {
//   //test error

//   const newActivity = await Activity.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: newActivity,
//   });
// });
exports.createActivity = handler.createOne(Activity);
exports.updateActivity = handler.updateOne(Activity);
// exports.updateActivity = catchAsync(async (req, res, next) => {
//   const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!activity) {
//     return next(new AppError('activity ID is illegal', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       activity,
//     },
//   });
// });

exports.deleteActivity = handler.deleteOne(Activity);
// exports.deleteActivity = catchAsync(async (req, res, next) => {
//   const activity = await Activity.findByIdAndDelete(req.params.id);
//   if (!activity) {
//     return next(new AppError('activity ID is illegal', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

exports.getActivityStats = catchAsync(async (req, res, next) => {
  const stats = await Activity.aggregate([
    {
      //$match: { ratingAverage: { $gte: 4.0 } },
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: null,
        aveRating: { $avg: '$ratingAverage' },
        numRatings: { $sum: '$ratingsQuantity' },
        numActivities: { $sum: 1 },
        //aveRating: { $avg: '$rating' },
        avePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avePrice: 1 }, //表升序
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
// exports.getMonthlyPlan = async (req, res) => {
//   try {
//     const year = req.params.year * 1;
//     const plan = await Activity.aggregate([
//       {
//         $unwind: '$startDates',
//       },
//       {
//         $match: {
//           startDates: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { $month: '$startDates' },
//           numActivityStarts: { $add: 1 },
//           Activities: { $push: '$name' },
//         },
//       },
//     ]);
//     res.status(200).json({
//       status: 'success',
//       data: {
//         plan,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: 'err',
//     });
//   }
// };

exports.getActivityNear = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(new AppError('provide GPS pls', 400));
  }

  console.log(distance, lat, lng, unit);
  const activities = await Activity.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: activities.length,
    data: { activities },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(new AppError('provide GPS pls', 400));
  }

  const distances = await Activity.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',

    data: { distances },
  });
});

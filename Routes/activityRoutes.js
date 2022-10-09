/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const fs = require('fs');
const activityController = require('./../controllers/activityController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../Routes/reviewRoutes');
const router = express.Router();

router.use('/:activityId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(
    activityController.aliasTopActivities,
    activityController.getAllActivities
  );

router.route('/get-activity-stats').get(activityController.getActivityStats);
//router.route('/monthly-plan/:year').get(activityController.getMonthlyPlan);
router.param('id', (req, res, next, val) => {
  console.log(`activity id is ${val}`);
  next();
});

router
  .route('/activities-near/:distance/center/:latlng/unit/:unit')
  .get(activityController.getActivityNear); //latlng 经纬度
//router.param('id', activityController.checkID);

router
  .route('/distances/:latlng/unit/:unit')
  .get(activityController.getDistances);

router
  .route('/')
  .get(activityController.getAllActivities)
  //.post(activityController.checkBody, activityController.creatActivity);
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    activityController.createActivity
  );

router
  .route('/:id')
  .get(activityController.getActivity)
  .patch(activityController.updateActivity)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    activityController.deleteActivity
  );

// router
//   .route('/:activityId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user', 'admin'),
//     reviewController.createReview
//   );

module.exports = router;

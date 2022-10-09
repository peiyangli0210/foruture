/* eslint-disable prettier/prettier */
/* eslint-disable import/extensions */
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController');
const activityRouter = require('./Routes/activityRoutes.js');
const userRouter = require('./Routes/userRoutes.js');
const reviewRouter = require('./routes/reviewRoutes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

app.set('view engine', 'pug');
//set secure HTTP header
app.use(helmet());

//如何理解 next()
//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit request
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP, pls try again in an hour',
});
app.use('/api', limiter);

//reading date from body into req.body
app.use(express.json({ limit: '200kb' }));
//数据清理data sanitization  恶意查询
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
//serving static files
app.use(express.static(`${__dirname}/public`)); //ip地址就是public
// app.use((req, res, next) => {
//   console.log('Middleware!');
//   next();
// });
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});
//get http request
// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'Hello-world from server', app: 'foruture' });
// });

// app.post('/', (req, res) => {
//   res.send('you can post to this endpoint');
// });

// app.get('/api/v1/activities', getAllActivities);
// app.get('/api/v1/activities/:id', getActivity);
// app.post('/api/v1/activities', creatActivity);
// app.patch('/api/v1/activities/:id', updateActivity);
// app.delete('/api/v1/activities/:id', deleteActivity);

app.use('/api/v1/activities', activityRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
//差错控制 error handling
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can not find ${req.originalUrl} on this server`,
  // });
  // const err = new Error();
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can not find ${req.originalUrl} on this server `, 404));
});

app.use(globalErrorHandler);

module.exports = app;

/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('unhandled rejection');

  process.exit(1);
});
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connect successful!');
  });
dotenv.config({ path: `./${process.env.NODE_ENV}.env` });
console.log(app.get('env'));

// const testActivity = new Activity({
//   name: 'west Hua Garden',
//   rating: 4.6,
//   price: 50,
// });
// testActivity
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('error', err);
//   });
// //console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, (req, res) => {
  console.log(`starting on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandled rejection');
  server.close(() => {
    process.exit(1);
  });
});

//console.log(x);

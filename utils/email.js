/* eslint-disable prettier/prettier */
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    //host: process.env.EMAIL_HOST,
    service: 'qq',
    port: process.env.PORT,

    //secureConnection: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //create transporter
  //define email options
  const mailOptions = {
    from: '"Peillenlee" <1264292168@qq.com>',
    to: options.email,
    text: options.message,
    //html:
  };
  //send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

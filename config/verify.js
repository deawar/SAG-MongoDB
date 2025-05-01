import nodemailer from 'nodemailer';

const smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const sendMail = (mailOptions, cb) => {
  smtpTransport.sendMail(mailOptions, (error, data) => {
    if (error) {
      cb(error, null);
    } else {
      cb(null, data);
    }
  });
};

export default smtpTransport;

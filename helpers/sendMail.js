

const nodemailer = require("nodemailer");

module.exports.sendMail = (email, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
  });
  const mainOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: html,
  };
  transporter.sendMail(mainOptions, function (error, info) {
    if(error) {
      console.log(error);
      res.redirect("/");
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

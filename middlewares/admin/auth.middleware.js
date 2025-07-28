const systemConfig = require("../../config/system");

require("dotenv").config();

const jwt = require("jsonwebtoken");

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  const accessTokenSecret = process.env.JWT_SECRET;
  if(!token) {
    return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
  } 
  try {
    //decode
    const decode = jwt.verify(token, accessTokenSecret);
    req.authenticatedUser  = decode;
    next();
  } catch(error) {
    res.clearCookie("token");
    return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
  }
}
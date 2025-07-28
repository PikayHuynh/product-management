const systemConfig = require("../../config/system");

require("dotenv").config();

const jwt = require("jsonwebtoken");
const Account = require("../../models/account.model");

module.exports.requireAuth = async (req, res, next) => {
  const token = req.cookies.token;
  const accessTokenSecret = process.env.JWT_SECRET;
  if(!token) {
    return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
  } 
  try {
    //decode
    const decode = jwt.verify(token, accessTokenSecret);
    
    const user = await Account.findOne({ _id: decode.id });
    
    if(!user) {
      return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    } else {
      next();
    }
  } catch(error) {
    res.clearCookie("token");
    return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
  }
}
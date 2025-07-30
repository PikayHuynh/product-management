const systemConfig = require("../../config/system");

require("dotenv").config();

const authTokenHelper = require("../../helpers/authToken");

const ms = require("ms");

const Account = require("../../models/account.model");

const Role = require("../../models/role.model");

module.exports.requireAuth = async (req, res, next) => {
  const token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken; 

  if(!token) {
    return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
  } 

  try {
    const decode = authTokenHelper.verifyAccessToken(token);
    req.authenticatedAccount = decode;

    const user = await Account.findOne({ _id: decode.id }).select("-password");
      
    if(!user) {
      res.clearCookie("token");
      res.clearCookie("refreshToken");
      return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    } 

    const role = await Role.findOne({ _id: user.role_id }).select("title permissions");

    res.locals.user = user;
    res.locals.role = role;
    next();
  } catch(error) {

    if(!refreshToken) {
      return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }

    try{
      const decodeRefresh = authTokenHelper.verifyRefreshToken(refreshToken);

      const user = await Account.findOne({ _id: decodeRefresh.id }).select("-password");
      
      if(!user) {
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
      } 

      const role = await Role.findOne({ _id: user.role_id }).select("title permissions");

      const newAccessToken = authTokenHelper.generateAccessToken({
        id: user._id,
        role: user.role_id,
        email: user.email,
      });

      res.cookie("token", newAccessToken, {
        httpOnly: true,
        maxAge: ms(authTokenHelper.accessTokenLife),
      });

      req.authenticatedAccount = decodeRefresh;

      res.locals.user = user;
      res.locals.role = role;

      next();
    } catch(error) {
      res.clearCookie("token");
      res.clearCookie("refreshToken");
      return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }
  }
};
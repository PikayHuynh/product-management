require("dotenv").config();

const authTokenHelper = require("../../helpers/authToken");

const ms = require("ms");

const User = require("../../models/user.model");

module.exports.requireAuth = async (req, res, next) => {
  const tokenUser = req.cookies.tokenUser;
  const refreshTokenUser = req.cookies.refreshTokenUser; 

  if(!tokenUser) {
    return res.redirect(`/auth/login`);
  } 

  try {
    const decode = authTokenHelper.verifyAccessToken(tokenUser);

    const user = await User.findOne({ _id: decode.id }).select("-password");
      
    if(!user) {
      res.clearCookie("tokenUser");
      res.clearCookie("refreshTokenUser");
      return res.redirect(`/auth/login`);
    } 

    res.locals.user = user;
    next();
  } catch(error) {

    if(!refreshToken) {
      return res.redirect(`/auth/login`);
    }

    try{
      const decodeRefresh = authTokenHelper.verifyRefreshToken(refreshTokenUser);

      const user = await user.findOne({ _id: decodeRefresh.id }).select("-password");
      
      if(!user) {
        res.clearCookie("tokenUser");
        res.clearCookie("refreshTokenUser");
        return res.redirect(`/auth/login`);
      } 

      const payload = {
        id: user._id,
        email: user.email,
      };

      const newAccessToken = authTokenHelper.generateAccessToken(payload);

      res.cookie("tokenUser", newAccessToken, {
        httpOnly: true,
        maxAge: ms(authTokenHelper.accessTokenLife),
      });

      res.locals.user = user;

      next();
    } catch(error) {
      res.clearCookie("tokenUser");
      res.clearCookie("refreshTokenUser");
      return res.redirect(`/auth/login`);
    }
  }
};
const User = require("../../models/user.model");
const authTokenHelper = require("../../helpers/authToken");
const ms = require("ms");

const findActiveUserByEmail = async (email) =>
  User.findOne({
    email,
    status: "active",
    deleted: false
  }).select("-password");

const setAccessTokenCookie = (res, payload) => {
  const newAccessToken = authTokenHelper.generateAccessToken(payload);
  res.cookie("tokenUser", newAccessToken, {
    httpOnly: true,
    maxAge: ms(authTokenHelper.accessTokenLife)
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie("tokenUser");
  res.clearCookie("refreshTokenUser");
};

const handleRefreshToken = async (refreshTokenUser, res) => {
  try {
    const decodeRefresh = authTokenHelper.verifyRefreshToken(refreshTokenUser);
    if (!decodeRefresh?.email) return;

    const user = await findActiveUserByEmail(decodeRefresh.email);
    if(!user) return;

    res.locals.user = user;
    setAccessTokenCookie(res, { id: user._id, email: user.email });
    return true;
  } catch {
    clearAuthCookies(res);
  }
};

module.exports.infoUser = async (req, res, next) => {
  const tokenUser = req.cookies.tokenUser;
  const refreshTokenUser = req.cookies.refreshTokenUser;

  try {
    if (tokenUser) {
      try {
        const decode = authTokenHelper.verifyAccessToken(tokenUser);
        if (decode?.email) {
          const user = await findActiveUserByEmail(decode.email);
          if(user) {
            res.locals.user = user;
            return next();
          }
        }
      } catch {
        // Access token lỗi -> thử refresh token
        if(refreshTokenUser && await handleRefreshToken(refreshTokenUser, res)) {
          return next();
        }
      }
    } 
    // Không có access token -> thử refresh token
    else if (refreshTokenUser && await handleRefreshToken(refreshTokenUser, res)) {
      return next();
    }
  } catch {
    clearAuthCookies(res);
  }

  next();
};

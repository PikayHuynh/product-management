const jwt = require("jsonwebtoken");

require("dotenv").config();

const accessTokenSecret = process.env.JWT_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
const accessTokenLife = process.env.JWT_EXPIRES;
const refreshTokenLife = process.env.JWT_REFRESH_EXPIRES;

module.exports.generateAccessToken = (payload) => {
  return jwt.sign(payload, accessTokenSecret, { expiresIn: accessTokenLife });
};

module.exports.generateRefreshToken = (payload) => {
  return jwt.sign(payload, refreshTokenSecret, { expiresIn: refreshTokenLife });
};

module.exports.verifyAccessToken = (token) => {
  return jwt.verify(token, accessTokenSecret);
};

module.exports.verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshTokenSecret);
};

module.exports.accessTokenLife = accessTokenLife;
module.exports.refreshTokenLife = refreshTokenLife;
const User = require("../../models/user.model");

const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);

const ms = require("ms");

const authTokenHelper = require("../../helpers/authToken");

//[GET] /user/register
module.exports.register = async (req, res) => {
  res.render("client/pages/user/register", {
    pageTitle: "Đăng ký tài khoản"
  });
};

//[POST] /user/register
module.exports.registerPost = async (req, res) => {
  const existEmail = await User.findOne({ email: req.body.email });

  if(existEmail) {
    req.flash("error", `Email ${req.body.email} đã tồn tại`);
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }
  
  const hashPassword = bcrypt.hashSync(req.body.password, salt);

  req.body.password = hashPassword;

  const user = new User(req.body);
  await user.save();
  
  //Tạo token jwt
    const payload = {
      id: user._id,
      email: user.email
    };
    
    //encode
    const accessToken = authTokenHelper.generateAccessToken(payload);
    const refreshToken = authTokenHelper.generateRefreshToken(payload);
  
    res.cookie("tokenUser", accessToken, {
      httpOnly: true,
      maxAge: ms(authTokenHelper.accessTokenLife)
    });
  
    res.cookie("refreshTokenUser", refreshToken, {
      httpOnly: true,
      maxAge: ms(authTokenHelper.refreshTokenLife)
    });
  
  res.redirect("/");
};
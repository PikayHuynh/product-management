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

//[GET] /user/login
module.exports.login = async (req, res) => {
  res.render("client/pages/user/login", {
    pageTitle: "Đăng nhập tài khoản"
  });
};

//[POST] /user/login
module.exports.loginPost = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: email,
    status: "active",
    deleted: false
  });

  if(!user) {
    req.flash("error", "Email không tồn tại!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }

  const isPasswordMatch = bcrypt.compareSync(password, user.password);

  if(!isPasswordMatch) {
    req.flash("error", "Sai mật khẩu!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }

  if(user.status == "inactive") {
    req.flash("error", "Tài khoản đã bị khoá!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }
  
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

//[GET] /user/logout
module.exports.logout = async (req, res) => {
  res.clearCookie("tokenUser");
  res.clearCookie("refreshTokenUser");
  res.redirect("/");
};
const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");

const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);

const ms = require("ms");

const authTokenHelper = require("../../helpers/authToken");
const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail");

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
  
  const payload = {
    id: user._id,
    email: user.email
  };
  
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
  
  const payload = {
    id: user._id,
    email: user.email
  };
  
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


//[GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
  res.render("client/pages/user/forgot-password", {
    pageTitle: "Lấy lại mật khẩu"
  });
};

//[POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
  const email = req.body.email;

  const otp = generateHelper.generateRandomNumber(8);

  const user = await User.findOne({
    email: email,
    deleted: false,
    status: "active"
  });
  
  if(!user) {
    req.flash("error", "Email không tồn tại!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }

  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: Date.now()
  }

  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save()
  

  //Nếu tồn tại email thì gửi OTP qua email
  const subject = "Mã OTP xác minh lấy lại mật khẩu";
  const html = `
    Mã OTP để lấy lại mật khẩu là <b>${otp}</b>. Thời hạn sử dụng là 3 phút.
  `;

  sendMailHelper.sendMail(email, subject, html);
  
  res.redirect(`/user/password/otp?email=${email}`);
};

//[GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.query.email;

  res.render("client/pages/user/otp-password", {
    pageTitle: "Nhập mã OTP",
    email: email
  });
};

//[POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp
  });
  
  if(!result) {
    req.flash("error", "OTP không hợp lệ!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }

  const user = await User.findOne({
    email: email
  });

  const payload = {
    id: user._id,
    email: user.email
  };

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

  res.redirect("/user/password/reset");
};

//[GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
  res.render("client/pages/user/reset-password", {
    pageTitle: "Đổi mật khẩu"
  });
};

//[POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
  const password = req.body.password;
  const hashPassword = bcrypt.hashSync(password, salt);
  
  const tokenUser = req.cookies.tokenUser;

  const decode = authTokenHelper.verifyAccessToken(tokenUser);
  
  if(decode?.email) {
    await User.updateOne({
      email: decode.email
    }, {
      password: hashPassword
    });
  }
  req.flash("success", "Đổi mật khẩu thành công!");
  res.redirect("/");
};

//[GET] /user/info
module.exports.info = async (req, res) => {
  res.render("client/pages/user/info", {
    pageTitle: "Thông tin tài khoản",
  });
}
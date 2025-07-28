const Account = require("../../models/account.model");

const systemConfig = require("../../config/system");

const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);

const authTokenHelper = require("../../helpers/authToken");

const ms = require("ms");

//[GET] /admin/auth/login
module.exports.login = async (req, res) => {
  const token = req.cookies.token;
  if(token) {
    res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
  } else {
    res.render("admin/pages/auth/login", {
      pageTitle: "Đăng nhập",
    });
  }
};

//[POST] /admin/auth/login
module.exports.loginPost = async (req, res) => {
  const { email, password } = req.body;
  
  const user = await Account.findOne({
    email: email,
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
    req.flash("error", "Tài khoản đã bị khóa!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }
  
  //Tạo token jwt
  const payload = {
    id: user._id,
    role: user.role_id,
    email: user.email
  };
  
  //encode
  const accessToken = authTokenHelper.generateAccessToken(payload);
  const refreshToken = authTokenHelper.generateRefreshToken(payload);

  res.cookie("token", accessToken, {
    httpOnly: true,
    maxAge: ms(authTokenHelper.accessTokenLife)
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: ms(authTokenHelper.refreshTokenLife)
  });

  res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
};

//[GET] /admin/auth/logout
module.exports.logout = async (req, res) => {
  // Xóa token
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
};
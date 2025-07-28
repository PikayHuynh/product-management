const Account = require("../../models/account.model");

const systemConfig = require("../../config/system");

const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);

//[GET] /admin/auth/login
module.exports.login = async (req, res) => {
  res.render("admin/pages/auth/login", {
    pageTitle: "Đăng nhập",
  });
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
  
  res.cookie("token", user.token);
  res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
};

const Account = require("../../models/account.model");

const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);

//[GET] /admin/my-account
module.exports.index = async (req, res) => {
  res.render("admin/pages/my-account/index", {
    pageTitle: "Thông tin cá nhân"
  });
};

//[GET] /admin/my-account/edit
module.exports.edit = async (req, res) => {
  res.render("admin/pages/my-account/edit", {
    pageTitle: "chỉnh sửa thông tin cá nhân"
  });
};

//[PATCH] /admin/my-account/edit
module.exports.editPatch = async (req, res) => {
  const id = res.locals.user.id;

  const emailExist = await Account.findOne({
    _id: { $ne: id },
    email: req.body.email,
    deleted: false
  });

  if(emailExist) {
    req.flash("error", `Email ${req.body.email} đã được sử dụng`);
  } else {
    if(req.body.password) {
      const hashPassword = bcrypt.hashSync(req.body.password, salt);
      req.body.password = hashPassword;
    } else {
      delete req.body.password;
    }
    
    await Account.updateOne( { _id: id }, req.body );

    req.flash("success", "Cập nhật tài khoản thành công!");
  }
  const backURL = req.get("Referer");
  res.redirect(backURL);
};
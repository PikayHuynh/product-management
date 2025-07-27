const Account = require("../../models/account.model");
const Role = require("../../models/role.model");

const systemConfig = require("../../config/system");

const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);

//[GET] /admin/accounts
module.exports.index = async (req, res) => {
  let find = {
    deleted: false
  };

  const records = await Account.find(find).select("-password -token");
  
  for(const record of records) {
    const role = await Role.findOne({
      _id: record.role_id,
      deleted: false
    });
    record.role = role;
  }

  res.render("admin/pages/accounts/index", {
    pageTitle: "Danh sách tài khoản",
    records: records
  });
};

//[GET] /admin/accounts/create
module.exports.create = async (req, res) => {
  const roles = await Role.find({ deleted: false });
  res.render("admin/pages/accounts/create", {
    pageTitle: "Tạo mới tài khoản", 
    roles: roles
  });
};

//[POST] /admin/accounts/create
module.exports.createPost = async (req, res) => {
  const emailExist = await Account.findOne({
    email: req.body.email,
    deleted: false
  });

  if(emailExist) {
    req.flash("error", `Email ${req.body.email} đã được sử dụng`);
    const backURL = req.get("Referer");
    res.redirect(backURL);
  } else {
    const hashPassword = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hashPassword;

    const account = new Account(req.body);
    await account.save();

    req.flash("success", "Đã thêm tài khoản thành công");
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
  }
};
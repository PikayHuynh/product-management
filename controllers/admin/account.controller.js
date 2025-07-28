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

//[GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
  let find = {
    _id: req.params.id,
    deleted: false
  };

  try {
    const data = await Account.findOne(find);

    const roles = await Role.find({
      deleted: false
    });
    res.render("admin/pages/accounts/edit", {
      pageTitle: "Chỉnh sửa tài khoản", 
      data: data,
      roles: roles
    });
  } catch(error) {
    req.flash("error", "Không tìm thấy tài khoản");
    res.redirect(`${systemConfig.prefixAdmin}/accounts`)
  }
};

//[PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
  const id = req.params.id;

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
const Role = require("../../models/role.model");

const systemConfig = require("../../config/system");
const { model } = require("mongoose");
const { tree } = require("../../helpers/createTree");

//[GET] /admin/roles
module.exports.index = async (req, res) => {
  let find = {
    deleted: false
  };

  const records = await Role.find(find);
  res.render("admin/pages/roles/index", {
    pageTitle: "Trang nhóm quyền",
    records: records
  });
};

//[GET] /admin/roles/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/roles/create", {
    pageTitle: "Tạo nhóm quyền"
  });
};

//[POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
  const role = new Role(req.body);
  await role.save();
  req.flash("success", "Đã thêm mới nhóm quyền thành công");
  res.redirect(`$${systemConfig.prefixAdmin}/roles`);
};

//[GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    let find = {
      _id: id,
      deleted: false
    };

    const data = await Role.findOne(find);

    res.render("admin/pages/roles/edit", {
      pageTitle: "Sửa nhóm quyền",
      data: data
    });
  } catch(error) {
    req.flash("error", "Không tìm thấy nhóm quyền");
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  }
};

//[PATCH] /admin/roles/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    await Role.updateOne({ _id: id }, req.body);

    req.flash("success", "Cập nhập nhóm quyền thành công");
  } catch(error) {
    req.flash("error", "Cập nhập nhóm quyền thất bại");
  }
  const backURL = req.get("Referer");
  res.redirect(backURL);
};

//[GET] /admin/roles/detail/:id
module.exports.detail = async (req, res) => {
  const id = req.params.id;

  let find = {
    _id: id,
    deleted: false
  };

  const role = await Role.findOne(find);

  res.render("admin/pages/roles/detail", {
    pageTitle: "Chi tiết nhóm quyền",
    role: role
  });
}

//[DELETE] /admin/roles/delete/:id
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;

  await Role.updateOne(
    { _id: id },
    {
      deleted: true,
      deletedAt: new Date()
    }
  );

  req.flash("success", "Đã xóa thành công nhóm quyền");
  const backURL = req.get("Referer");
  res.redirect(backURL);
}
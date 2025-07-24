const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");

const systemConfig = require("../../config/system");

const createTreeHelper = require("../../helpers/createTree");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");

const router = require("../../routes/admin/product.route");

//[GET] /admin/products
module.exports.index = async (req, res) => {
  const filterStatus = filterStatusHelper(req.query);

  let find = {
    deleted: false,
  };

  if (req.query.status) {
    find.status = req.query.status;
  }

  const objectSearch = searchHelper(req.query);

  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  // pagination
  const countProducts = await Product.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 4,
    },
    req.query,
    countProducts
  );
  // End pagination

  // Sort
  let sort = {};
  if(req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  } 
  // End Sort

  const products = await Product.find(find).sort(sort).limit(objectPagination.limitItems).skip(objectPagination.skip);

  res.render("admin/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

//[PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  await Product.updateOne({ _id: id }, { status: status });

  req.flash("success", `Trạng thái của sản phẩm đã được cập nhật.`);

  const backURL = req.get("Referer");
  res.redirect(backURL);
};

//[PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", ");

  switch (type) {
    case "active":
      await Product.updateMany({ _id: { $in: ids } }, { status: "active" });
      req.flash("success", `Trạng thái của ${ids.length} sản phẩm đã được cập nhật.`);
      break;
    case "inactive":
      await Product.updateMany({ _id: { $in: ids } }, { status: "inactive" });
      req.flash("success", `Trạng thái của ${ids.length} sản phẩm đã được cập nhật.`);
      break;
    case "delete-all":
      await Product.updateMany(
        { _id: { $in: ids } },
        {
          deleted: true,
          deletedAt: new Date(),
        }
      );
      req.flash("success", `Đã xóa thành công ${ids.length} sản phẩm!`);
      break;
    case "change-position":
      for(const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Product.updateOne({ _id: id }, { position: position });
        req.flash("success", `Vị trí của ${ids.length} sản phẩm đã được cập nhật thành công.`);
      }
      break;
    default:
      break;
  }
  const backURL = req.get("Referer");
  res.redirect(backURL);
};

//[DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;

  // await Product.deleteOne({ _id: id });
  await Product.updateOne(
    { _id: id },
    {
      deleted: true,
      deletedAt: new Date(),
    }
  );
  req.flash("success", `Đã xóa thành công sản phẩm!`);
  const backURL = req.get("Referer");
  res.redirect(backURL);
};

//[GET] /admin/products/trash
module.exports.trashProduct = async (req, res) => {
  let find = {
    deleted: true,
  };

  const objectSearch = searchHelper(req.query);

  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  // pagination
  const countProducts = await Product.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 4,
    },
    req.query,
    countProducts
  );
  // End pagination

  const products = await Product.find(find).sort({ position: "desc" }).limit(objectPagination.limitItems).skip(objectPagination.skip);

  res.render("admin/pages/products/trash", {
    pageTitle: "Danh sách sản phẩm đã xóa",
    products: products,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

//[PATCH] /admin/products/trash/:id
module.exports.restoreItem = async (req, res) => {
  const id = req.params.id;
  await Product.updateOne(
    { _id: id },
    {
      deleted: false,
      $unset: { deletedAt: "" }, //Xóa cột
    }
  );
  req.flash("success", `Đã khôi phục thành công sản phẩm!`);
  const backURL = req.get("Referer");
  res.redirect(backURL);
};

//[PATCH] /admin/products/trash/restore-multi
module.exports.restoreMulti = async (req, res) => {
  const ids = req.body.ids.split(", ");
  for (const id of ids) {
    await Product.updateOne(
      { _id: id },
      {
        deleted: false,
        $unset: { deletedAt: "" },
      }
    );
  }
  req.flash("success", `Đã khôi phục thành công ${ids.length} sản phẩm!`);
  const backURL = req.get("Referer");
  res.redirect(backURL);
};

//[GET] /admin/products/create
module.exports.create = async (req, res) => {

  const category = await ProductCategory.find({ deleted: false });

  const newCategory = createTreeHelper.tree(category);

  res.render("admin/pages/products/create", {
    pageTitle: "Thêm mới sản phẩm",
    category: newCategory
  });
};

//[POST] /admin/products/create
module.exports.createPost = async (req, res) => {
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);

  if(req.body.position == "") {
    const countProducts = await Product.countDocuments();
    req.body.position = countProducts + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }

  const product = new Product(req.body);
  await product.save();

  res.redirect(`${systemConfig.prefixAdmin}/products`);
};

//[GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const product = await Product.findOne(find);

    res.render("admin/pages/products/edit", {
      pageTitle: "Chỉnh sửa sản phẩm",
      product: product,
    });
  } catch(error) {
    req.flash("error", "Không tìm được sản phẩm cần cập nhập!");
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};

//[PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
  const id = req.params.id;

  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);
  req.body.position = parseInt(req.body.position);

  try {
    await Product.updateOne({ _id: id }, req.body);
    req.flash("success", "Cập nhật sản phẩm thành công!");
  } catch (error) {
    req.flash("error", "Không tìm được sản phẩm cần cập nhập!");
  }
  const backURL = req.get("Referer");
  res.redirect(backURL);
};

//[GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const product = await Product.findOne(find);
    
    res.render("admin/pages/products/detail", {
      pageTitle: product.title,
      product: product,
    });
  } catch(error) {
    req.flash("error", "Không tìm được sản phẩm cần cập nhập!");
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};
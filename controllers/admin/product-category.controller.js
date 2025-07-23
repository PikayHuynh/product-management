const ProductCategory = require("../../models/product-category.model");

const systemConfig = require("../../config/system");

const createTreeHelper = require("../../helpers/createTree");
const filterStatusHelper = require("../../helpers/filterStatus");
const paginationHelper = require("../../helpers/pagination");
const searchHelper = require("../../helpers/search");

//[GET] /admin/products-category
module.exports.index = async (req, res) => {
  const filterStatus = filterStatusHelper(req.query);

  let find = {
    deleted: false,
  };

  if(req.query.status) {
    find.status = req.query.status;
  }

  const objectSearch = searchHelper(req.query);

  if(objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  // Sort
  let sort = {};
  if(req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  } 
  // End Sort

  const records = await ProductCategory.find(find).sort(sort);

  const newRecords = createTreeHelper.tree(records);

  res.render("admin/pages/products-category/index", {
    pageTitle: "Danh mục sản phẩm",
    records: newRecords,
    objectSearch: objectSearch.keyword,
    filterStatus: filterStatus,
  });
};

//[GET] /admin/products-category/create
module.exports.create = async (req, res) => {
  let find = {
    deleted: false
  };

  const records = await ProductCategory.find(find);

  const newRecords = createTreeHelper.tree(records);

  res.render("admin/pages/products-category/create", {
    pageTitle: "Tạo danh mục sản phẩm",
    records: newRecords
  });
};

//[POST] /admin/products-category/create
module.exports.createPost = async (req, res) => {
  if(req.body.position == "") {
    const count = await ProductCategory.countDocuments();
    req.body.position = count + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }
  
  const record = new ProductCategory(req.body);
  await record.save();

  req.flash("success", "Thêm mới danh mục thành công!");
  res.redirect(`${systemConfig.prefixAdmin}/products-category`);
};

//[PATCH] /admin/products-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;
  await ProductCategory.updateOne({ _id: id }, { status: status });
  req.flash("success", "Trạng thái danh mục của sản phẩm đã được cập nhật.");
  const backURL = req.get("Referer");
  res.redirect(backURL);
}

//[PATCH] /admin/products-category/change-multi
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", ");
  switch(type) {
    case "active":
      await ProductCategory.updateMany({ _id: {$in : ids} }, { status: type });
      req.flash("success", `Trạng thái của ${ids.length} danh mục sản phẩm đã được cập nhật.`);
      break;
    case "inactive":
      await ProductCategory.updateMany({ _id: {$in : ids} }, { status: type });
      req.flash("success", `Trạng thái của ${ids.length} danh mục sản phẩm đã được cập nhật.`);
      break;
    case "delete-all":
      await ProductCategory.updateMany(
        { _id: { $in: ids} },
        {
          deleted: true,
          deletedAt: new Date()
        }
      );
      req.flash("success", `Đã xóa thành công ${ids.length} danh mục sản phẩm.`);
      break;
    case "change-position":
      for(const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await ProductCategory.updateOne({ _id: id }, { position: position });
      }
      req.flash("success", `Vị trí của ${ids.length} sản phẩm đã được cập nhật thành công.`);
      break;
    default:
      break;
  }
  const backURL = req.get("Referer");
  res.redirect(backURL);
}

//[DELETE] /admin/products-category/delete/:id
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  await ProductCategory.updateOne({ _id: id }, { 
    deleted: true,
    deletedAt: new Date()
  });
  req.flash("success", "Đã xóa thành công danh mục sản phẩm");
  const backURL = req.get("Referer");
  res.redirect(backURL);
}

//[GET] /admin/products-category/trash
module.exports.trashProductCategory = async (req, res) => {
  let find = {
    deleted: true
  };

  const objectSearch = searchHelper(req.query);
  if(objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  const count = await ProductCategory.countDocuments();
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItem: 4
    },
    req.query,
    count
  );

  const records = await ProductCategory.find(find).sort({ position: "desc" }).limit(objectPagination.limitItem).skip(objectPagination.skip);
  
  res.render("admin/pages/products-category/trash", {
    pageTitle: "Danh mục sản phẩm bị xóa",
    pagination: objectPagination,
    keyword: objectSearch.keyword,
    records: records
  });
};

//[PATCH] /admin/products-category/trash/:id
module.exports.restoreItem = async (req, res) => {
  const id = req.params.id;
  await ProductCategory.updateOne(
    { _id: id },
    {
      deleted: false,
      $unset: { deletedAt: "" }, //Xóa cột
    }
  );
  req.flash("success", `Đã khôi phục thành công danh mục sản phẩm!`);
  const backURL = req.get("Referer");
  res.redirect(backURL);
};

//[PATCH] /admin/products-category/trash/restore-multi
module.exports.restoreMulti = async (req, res) => {
  const ids = req.body.ids.split(", ");
  for(const id of ids) {
    await ProductCategory.updateOne({ _id: id }, {
      deleted: false,
      $unset: { deletedAt: "" }
    });
  }
  req.flash("success", `Đã khôi phục thành công ${ids.length} danh mục sản phẩm`);
  const backURL = req.get("Referer");
  res.redirect(backURL);
}
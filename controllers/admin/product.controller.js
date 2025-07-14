const Product = require("../../models/product.model");

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");

const router = require("../../routes/admin/product.route");

//[GET] /admin/products
module.exports.index = async (req, res) => {
    
    const filterStatus = filterStatusHelper(req.query);

    let find = {
        deleted: false
    };

    if(req.query.status) {
        find.status = req.query.status;
    }

    const objectSearch = searchHelper(req.query);

    if(objectSearch.regex) {
        find.title = objectSearch.regex;
    }


    // pagination
    const countProducts = await Product.countDocuments(find);
    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItem: 4
        },
        req.query,
        countProducts
    );
    // End pagination

    const products = await Product.find(find).sort({ position: "desc" }).limit(objectPagination.limitItem).skip(objectPagination.skip);
    
    res.render("admin/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

//[PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await Product.updateOne({ _id: id }, { status: status });

    req.flash("success", `Trạng thái của sản phẩm đã được cập nhật.`);

    const backURL = req.get("Referer");
    res.redirect(backURL);
}

//[PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch(type) {
        case "active":
            await Product.updateMany({ _id: { $in: ids } }, {status: "active"});
            req.flash("success", `Trạng thái của ${ids.length} sản phẩm đã được cập nhật.`);
            break;
        case "inactive":
            await Product.updateMany({ _id: { $in: ids } }, {status: "inactive"});
            req.flash("success", `Trạng thái của ${ids.length} sản phẩm đã được cập nhật.`);
            break;
        case "delete-all":
            await Product.updateMany(
                { _id: { $in: ids } }, 
                {
                    deleted: true, 
                    deletedAt: new Date()
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
}

//[DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    // await Product.deleteOne({ _id: id });
    await Product.updateOne({ _id: id }, { 
        deleted: true,
        deletedAt: new Date()
    });
    req.flash("success", `Đã xóa thành công sản phẩm!`);
    const backURL = req.get("Referer");
    res.redirect(backURL);
}
const Product = require("../../models/product.model");

const filterStatusHelper = require("../../helpers/filterStatus");

const searchHelper = require("../../helpers/search");
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
    let objectPagination = {
        currentPage: 1,
        limitItem: 4
    };

    if(req.query.page) {
        if(!isNaN(parseInt(req.query.page))) {
            objectPagination.currentPage = parseInt(req.query.page);
        } else {
            objectPagination.currentPage = 1;
        }
    }

    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItem;
    
    const countProducts = await Product.countDocuments(find);
    const totalPage = Math.ceil(countProducts / objectPagination.limitItem);
    
    objectPagination.totalPage = totalPage;
    
    // End pagination

    const products = await Product.find(find).limit(objectPagination.limitItem).skip(objectPagination.skip);
    
    res.render("admin/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}
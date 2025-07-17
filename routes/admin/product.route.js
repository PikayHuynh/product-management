const express = require("express");
const multer = require("multer");
const router = express.Router();
const storageMulter = require("../../helpers/storageMulter");
const upload = multer({ storage: storageMulter() })

const controller = require("../../controllers/admin/product.controller");

router.get("/", controller.index);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.patch("/change-multi", controller.changeMulti);
router.delete("/delete/:id", controller.deleteItem);
router.get("/trash", controller.trashProduct);
router.patch("/restore/:id", controller.restoreItem);
router.patch("/restore-multi", controller.restoreMulti);
router.get("/create", controller.create);
router.post("/create", upload.single("thumbnail"), controller.createPost);

module.exports = router;
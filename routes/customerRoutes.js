const router = require("express").Router();
const { createCustomerCtrl, getAllCustomersCtrl, updateCustomerCtrl, deleteCustomerCtrl, getFilteredCustomersCtrl } = require("../controllers/customerController");
const verifyToken = require("../middlewares/verifyToken");
const { singleUpload, clearUploadedFiles } = require("../middlewares/photoUpload");

// api/customers
router.post("/", verifyToken, singleUpload("avatar"), createCustomerCtrl, clearUploadedFiles);

// api/customers
router.get("/", verifyToken, getAllCustomersCtrl);

// api/customers/:id
router.put("/:id", verifyToken, updateCustomerCtrl);

// api/customers/:id
router.delete("/:id", verifyToken, deleteCustomerCtrl);

// api/customers/filtered
router.get("/filtered", verifyToken, getFilteredCustomersCtrl);

module.exports = router;
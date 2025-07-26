const router = require("express").Router();
const { createDealCtrl, getAllDealsCtrl, updateDealCtrl, deleteDealCtrl, getFilteredDealsCtrl } = require("../controllers/dealController");
const { multipleUpload, clearUploadedFiles } = require("../middlewares/photoUpload");
const verifyToken = require("../middlewares/verifyToken");

// api/deals
router.post("/", verifyToken, multipleUpload("roomImages"), createDealCtrl, clearUploadedFiles);

// api/deals
router.get("/", verifyToken, getAllDealsCtrl);

// api/deals/:id
router.put("/:id", verifyToken, updateDealCtrl);

// api/deals/:id
router.delete("/:id", verifyToken, deleteDealCtrl);

// api/deals/filtered
router.get("/filtered", verifyToken, getFilteredDealsCtrl);

module.exports = router;
const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  addStock,
  removeStock,
  getStockMovements,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getProducts);

router.get("/movements", getStockMovements);

router.get("/:id", getProductById);

router.post("/", createProduct);

router.put("/:id", updateProduct);

router.post("/:id/stock/in", addStock);

router.post("/:id/stock/out", removeStock);

module.exports = router;
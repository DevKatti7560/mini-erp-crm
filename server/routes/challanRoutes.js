const express = require("express");

const {
  getChallans,
  getChallanById,
  createChallan,
  confirmChallan,
  cancelChallan,
} = require("../controllers/challanController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getChallans);

router.get("/:id", getChallanById);

router.post("/", createChallan);

router.post("/:id/confirm", confirmChallan);

router.post("/:id/cancel", cancelChallan);

module.exports = router;
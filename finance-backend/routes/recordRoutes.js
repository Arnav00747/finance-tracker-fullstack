const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const checkRole = require("../middleware/role");

const {
  addRecord,
  getRecords,
  deleteRecord,
  updateRecord,
  getSummary
} = require("../controllers/recordController");

// 🔥 ALL CAN VIEW
router.get("/", auth, checkRole(["viewer", "analyst", "admin"]), getRecords);

// 🔥 ANALYST + ADMIN
router.post("/", auth, checkRole(["analyst", "admin"]), addRecord);

// 🔥 ADMIN ONLY
router.delete("/:id", auth, checkRole(["admin"]), deleteRecord);

// 🔥 ANALYST + ADMIN
router.put("/:id", auth, checkRole(["analyst", "admin"]), updateRecord);

// 🔥 SUMMARY (viewer bhi dekh sakta)
router.get("/summary", auth, checkRole(["viewer", "analyst", "admin"]), getSummary);

module.exports = router;
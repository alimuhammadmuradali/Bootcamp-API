const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const advanceResults = require("../middleware/advanceResults");
const User = require("../models/User");

const {
  getUser,
  getUsers,
  createUser,
  deleteUser,
  updateUser,
} = require("../controllers/user");

const ReviewRouter = require("./review");
router.use("/:userId/reviews", ReviewRouter);

router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advanceResults(User), getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;

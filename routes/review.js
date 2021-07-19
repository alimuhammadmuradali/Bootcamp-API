const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/review");

const Review = require("../models/Reviews");
const advanceResults = require("../middleware/advanceResults");
//merging from bootcamps
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    advanceResults(Review, {
      path: "bootcamp",
      select: "name description",
    }),
    getReviews
  )
  .post(protect, authorize("user", "admin"), addReview);

router
  .route("/:id")
  .get(getReview)
  .put(protect, authorize("user", "admin"), updateReview)
  .delete(protect, authorize("user", "admin"), deleteReview);
module.exports = router;

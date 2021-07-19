const express = require("express");
const {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");
const advanceResults = require("../middleware/advanceResults");

//include other resource routers
const CourseRouter = require("./courses");
const ReviewRouter = require("./review");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

//Reroute into other resource router
router.use("/:bootcampId/courses", CourseRouter);
router.use("/:bootcampId/reviews", ReviewRouter);

router
  .route("/")
  .get(advanceResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamp);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

router.route("/radius/:zipcode/:distance").get(getBootcampInRadius);

module.exports = router;

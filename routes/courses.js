const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses");

const Cource = require("../models/Course");
const advanceResults = require("../middleware/advanceResults");
//merging from bootcamps
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    advanceResults(Cource, {
      path: "bootcamp",
      select: "name description",
    }),
    getCourses
  )
  .post(protect, authorize("publisher", "admin"), addCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(protect, authorize("publisher", "admin"), updateCourse)
  .delete(protect, authorize("publisher", "admin"), deleteCourse);

module.exports = router;

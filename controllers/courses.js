const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

// @desc  Get courses
// @route Get /api/v1/cources
// @route Get /api/v1/bootcamps/:bootcampId/cources

exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    const cources = Course.find({ bootcamp: req.params.bootcampId }); // mamtch bootcamp id
    return res.status(200).json({
      success: true,
      count: cources.length,
      data: cources,
    });
  } else {
    res.status(200).json(res.advanceResults);
  }
});

// @desc  Get courses by id
// @route Get /api/v1/bootcamps/:bootcampId/cources

exports.getCourse = asyncHandler(async (req, res, next) => {
  const cource = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!cource) {
    return next(
      new ErrorResponse(`No course with id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: cource,
  });
});

// @desc  create new Cource
// @route POST /api/v1/bootcamps/:bootcampId/courses
//private
exports.addCourse = asyncHandler(async (req, res, next) => {
  //if bootcamp exist
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`),
      404
    );
  }
  if (req.user.id != bootcamp.user.toString() && req.user.role != "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to adda cource to bootcamp ${req.params.bootcampId}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});

// @desc  update new Cource
// @route PUT /api/v1/cources/:id
//private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with id of ${req.params.id}`),
      404
    );
  }
  if (req.user.id != course.user.toString() && req.user.role != "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update a  cource ${course._id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    success: true,
    data: course,
  });
});
//@desc  deleteCource
// @route DELETE /api/v1/cources/:id
//private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with id of ${req.params.id}`),
      404
    );
  }
  if (req.user.id != course.user.toString() && req.user.role != "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete a  cource ${course._id}`,
        401
      )
    );
  }

  await Course.remove();

  res.status(201).json({
    success: true,
    data: {},
  });
});

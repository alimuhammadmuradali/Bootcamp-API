const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/Reviews");
const Bootcamp = require("../models/Bootcamp");

// @desc  Get Reviews
// @route Get /api/v1/reviews
// @route Get /api/v1/bootcamps/:bootcampId/review
// @route Get /api/v1/users/:bootcampId/reviews

exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId }); // mamtch bootcamp id
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else if (req.params.userId) {
    const reviews = await Review.find({ user: req.params.userId }); // mamtch userid
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advanceResults);
  }
});

// @desc  Get review by id
// @route Get /api/v1/reviews/:id

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc  add review by Bootcampid
// @route Get /api/v1/bootcamps/:bootcampId/reviews
//private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    next(
      new ErrorResponse(
        `Bootcamp not found with id ${req.params.bootcampId}`,
        404
      )
    );
  }
  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc  update review
// @route PUT /api/v1/reviews/:id
//private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with id of ${req.params.id}`),
      404
    );
  }
  if (req.user.id != review.user.toString() && req.user.role != "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update a  review ${review._id}`,
        401
      )
    );
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc  update review
// @route PUT /api/v1/reviews/:id
//private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with id of ${req.params.id}`),
      404
    );
  }
  if (req.user.id != review.user.toString() && req.user.role != "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete a  review ${review._id}`,
        401
      )
    );
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(201).json({
    success: true,
  });
});

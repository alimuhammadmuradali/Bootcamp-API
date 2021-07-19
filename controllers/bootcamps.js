const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");

// @desc  Get all Bootcamps
// @route Get /api/v1/bootcamps
//async handler gor removing retundent try catch

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advanceResults);
});

// @desc  Get Single Bootcamp
// @route Get /api/v1/bootcamps/:id
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id).populate("courses");

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found of id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc  create new Bootcamp
// @route POST /api/v1/bootcamps

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  //assosiate user with bootcamp
  req.body.user = req.user.id;

  //checking published bootcamp
  const publishBootcamp = await Bootcamp.findOne({ user: req.user.id });

  if (publishBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user ID ${req.user.id} has already publish a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc  Update single Bootcamp
// @route PUT /api/v1/bootcamps/:id
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found of id ${req.params.id}`, 404)
    );
  }

  //make sure user is bookcamp owner
  if (req.user.id != bootcamp.user.toString() && req.user.role != "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update bootcamp ${req.params.id}`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc  Delete single Bootcamp
// @route DELETE /api/v1/bootcamps/:id

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found of id ${req.params.id}`, 404)
    );
  }
  if (req.user.id != bootcamp.user.toString() && req.user.role != "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete bootcamp ${req.params.id}`,
        401
      )
    );
  }

  bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc  get bootcamp within radius
// @route Get /api/v1/bootcamps/radius/:zipcode/:distance

exports.getBootcampInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params; // from url

  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //calc radius using radian ---divide distance by radius of earth
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc  upload photo Bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
//private

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found of id ${req.params.id}`, 404)
    );
  }
  if (req.user.id != bootcamp.user.toString() && req.user.role != "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update bootcamp ${req.params.id}`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload file`, 400));
  }

  const file = req.files.file;

  //photo validation
  if (!file.mimetype.startWith("image")) {
    return next(new ErrorResponse(`Please upload image file`, 400));
  }
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // create custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse("Problem with upload file", 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});

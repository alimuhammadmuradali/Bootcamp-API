const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

//desc    Get all users
//route   Get /api/v1/users
//private/admin

exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advanceResults);
});

//desc    Get single user
//route   Get /api/v1/users/:id
//private/admin

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse("user not found", 404));
  }
  res.status(200).json({ success: true, data: user });
});

//desc   Create User
//route   POST /api/v1/users
//private/admin

exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({ success: true, data: user });
});

//desc   Update User
//route   PUT /api/v1/users/:id
//private/admin

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidator: true,
  });

  res.status(200).json({ success: true, data: user });
});

//desc   delete User
//route   DElete /api/v1/users/:id
//private/admin

exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true });
});

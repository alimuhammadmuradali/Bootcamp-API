const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

//desc    Register USer
//route   Get /api/v1/auth/register
//public

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  SendTokenResponse(user, 200, res);
});

//desc    login User
//route   post /api/v1/auth/login
//public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //validate with email and password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }
  //check user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid  Credential", 401));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid  Credential", 401));
  }

  SendTokenResponse(user, 200, res);
});

//desc    get current user login
//route   Get /api/v1/auth/me
//private -- need token

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});
//desc    get logout and clear cookie
//route   Get /api/v1/auth/logout
//private -- need token

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  //reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ ValidateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetPassword/${resetToken}`;

  const message = `put request to ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message: message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not sent ", 500));
  }
});

//desc   Reset Pass
//route  PUT /api/v1/auth/resetPassword/:resetToken
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid Token ", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  SendTokenResponse(user, 200, res);
});

//get token from model , creatte cookie and send response
const SendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};

//desc    upfate user name and email detail
//route   Get /api/v1/auth/updatedetails
//private -- need token
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

//desc    update  pass detail
//route   Get /api/v1/auth/updatedetails
//private -- need token
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.matchPassword(req.body.currentPassword))) {
    next(new ErrorResponse("pass is incorrect ", 401));
  }
  user.password = req.body.newPassword;
  await user.save();

  SendTokenResponse(user, 200, res);
});

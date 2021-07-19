const express = require("express");
const {
  register,
  login,
  getMe,
  logout,
  resetPassword,
  forgotPassword,
  updatePassword,
  updateDetails,
} = require("../controllers/auth");
const router = express.Router();
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.put("/updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);

router.post("/forgotPassword", forgotPassword);
router.put("/resetPassword/:resetToken", resetPassword);

module.exports = router;

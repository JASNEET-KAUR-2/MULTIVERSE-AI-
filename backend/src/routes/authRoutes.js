import { Router } from "express";
import {
  forgotPassword,
  login,
  me,
  resetPassword,
  signup,
  verifyLoginOtp,
  verifySignupOtp
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-signup-otp", verifySignupOtp);
router.post("/verify-login-otp", verifyLoginOtp);
router.get("/me", authMiddleware, me);

export default router;

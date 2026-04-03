import { Router } from "express";
import { login, me, signup, verifyLoginOtp, verifySignupOtp } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-signup-otp", verifySignupOtp);
router.post("/verify-login-otp", verifyLoginOtp);
router.get("/me", authMiddleware, me);

export default router;

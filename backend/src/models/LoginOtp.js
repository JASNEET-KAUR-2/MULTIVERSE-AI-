import mongoose from "mongoose";

const loginOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  purpose: {
    type: String,
    enum: ["signup", "login", "reset-password"],
    default: "login"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  otpHash: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300
  }
});

const LoginOtp = mongoose.model("LoginOtp", loginOtpSchema);

export default LoginOtp;

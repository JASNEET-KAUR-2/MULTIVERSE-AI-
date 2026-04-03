import mongoose from "mongoose";

const verificationLogSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    purpose: {
      type: String,
      required: true,
      default: "login"
    },
    status: {
      type: String,
      required: true,
      enum: ["otp_sent", "otp_failed", "otp_verified", "otp_rejected"]
    },
    attempts: {
      type: Number,
      default: 0
    },
    ipAddress: String,
    userAgent: String,
    verifiedAt: Date
  },
  { timestamps: true }
);

const VerificationLog = mongoose.model("VerificationLog", verificationLogSchema);

export default VerificationLog;

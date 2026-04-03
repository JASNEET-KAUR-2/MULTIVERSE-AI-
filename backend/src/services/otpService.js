import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const OTP_EXPIRY_SECONDS = 300;
const OTP_COOLDOWN_MS = 2 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 3;

export const isEmailOtpConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

let transporter = null;

const getTransporter = () => {
  if (!isEmailOtpConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  return transporter;
};

export const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const hashOtp = async (otp) => bcrypt.hash(otp, 10);

export const compareOtp = async (otp, otpHash) => bcrypt.compare(otp, otpHash);

const buildOtpEmailTemplate = (title, description, otp) => `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #f4faff; border-radius: 16px; color: #183549;">
        <h2 style="margin: 0 0 12px; color: #1d4ed8;">${title}</h2>
        <p style="margin: 0 0 16px; line-height: 1.6;">${description}</p>
        <div style="padding: 16px; border-radius: 14px; background: #ffffff; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 10px; color: #1e40af;">
          ${otp}
        </div>
        <p style="margin: 16px 0 0; line-height: 1.6;">This code is valid for 5 minutes and can be used once.</p>
      </div>
    `;

export const sendLoginOtpEmail = async (email, otp) => {
  const mailer = getTransporter();

  if (!mailer) {
    const error = new Error("Secure email OTP is not configured on the server.");
    error.status = 503;
    throw error;
  }

  await mailer.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your multiverse ai login OTP",
    html: buildOtpEmailTemplate(
      "multiverse ai login verification",
      "Use this one-time password to finish signing in.",
      otp
    )
  });

  return { delivered: true };
};

export const sendSignupOtpEmail = async (email, otp) => {
  const mailer = getTransporter();

  if (!mailer) {
    const error = new Error("Secure email OTP is not configured on the server.");
    error.status = 503;
    throw error;
  }

  await mailer.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your multiverse ai email",
    html: buildOtpEmailTemplate(
      "multiverse ai email verification",
      "Use this one-time password to verify your email and complete account creation.",
      otp
    )
  });

  return { delivered: true };
};

export const otpSecurityConfig = {
  expirySeconds: OTP_EXPIRY_SECONDS,
  cooldownMs: OTP_COOLDOWN_MS,
  maxAttempts: OTP_MAX_ATTEMPTS
};

import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const OTP_EXPIRY_SECONDS = 300;
const OTP_COOLDOWN_MS = 2 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 3;

const parseBoolean = (value, fallback = false) => {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim().toLowerCase() === "true";
};

const getEmailConfig = () => {
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER?.trim() || process.env.EMAIL_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim() || process.env.EMAIL_PASS?.trim();
  const smtpSecure = parseBoolean(process.env.SMTP_SECURE, smtpPort === 465);
  const smtpService = process.env.SMTP_SERVICE?.trim() || "gmail";
  const emailFrom = process.env.EMAIL_FROM?.trim() || smtpUser;

  return {
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    smtpSecure,
    smtpService,
    emailFrom
  };
};

export const isEmailOtpConfigured = () => {
  const { smtpUser, smtpPass } = getEmailConfig();
  return Boolean(smtpUser && smtpPass);
};

let transporter = null;

const getTransporter = () => {
  if (!isEmailOtpConfigured()) {
    return null;
  }

  if (!transporter) {
    const { smtpHost, smtpPort, smtpUser, smtpPass, smtpSecure, smtpService } = getEmailConfig();

    transporter = smtpHost
      ? nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        })
      : nodemailer.createTransport({
          service: smtpService,
          auth: {
            user: smtpUser,
            pass: smtpPass
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
  const { emailFrom } = getEmailConfig();

  if (!mailer) {
    const error = new Error("Secure email OTP is not configured on the server. Add SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASS.");
    error.status = 503;
    throw error;
  }

  await mailer.sendMail({
    from: emailFrom,
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
  const { emailFrom } = getEmailConfig();

  if (!mailer) {
    const error = new Error("Secure email OTP is not configured on the server. Add SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASS.");
    error.status = 503;
    throw error;
  }

  await mailer.sendMail({
    from: emailFrom,
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

export const sendPasswordResetOtpEmail = async (email, otp) => {
  const mailer = getTransporter();
  const { emailFrom } = getEmailConfig();

  if (!mailer) {
    const error = new Error("Secure email OTP is not configured on the server. Add SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASS.");
    error.status = 503;
    throw error;
  }

  await mailer.sendMail({
    from: emailFrom,
    to: email,
    subject: "Reset your multiverse ai password",
    html: buildOtpEmailTemplate(
      "multiverse ai password reset",
      "Use this one-time password to create a new password for your workspace.",
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

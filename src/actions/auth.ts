"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { headers } from "next/headers";
import { sendPasswordResetEmail, sendEmailVerification, sendWelcomeEmail } from "@/lib/emails";

const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// ─── Helpers ──────────────────────────────────────────────────────────────

function getClientIp(): string {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
}

async function checkRateLimit(
  ip: string,
  action: "SIGNUP" | "PASSWORD_RESET" | "VERIFY_RESEND",
  windowMinutes: number,
  maxRequests: number
) {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  const count = await prisma.authLog.count({
    where: { ipAddress: ip, action, createdAt: { gte: windowStart } },
  });
  if (count >= maxRequests) {
    throw new Error("Too many requests. Please try again later.");
  }
}

// ─── Register ─────────────────────────────────────────────────────────────

export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const ip = getClientIp();
  await checkRateLimit(ip, "SIGNUP", 60, 5);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error("This email is already registered. Please sign in.");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role: "ATTENDEE",
      emailVerified: new Date(), // auto-verify for simplicity (no email gate)
      securityStamp: crypto.randomUUID(),
    },
  });

  await prisma.authLog.create({
    data: { ipAddress: ip, email: user.email, action: "SIGNUP" },
  });

  // Send welcome email (non-blocking — don't fail registration if email fails)
  sendWelcomeEmail(user.email, user.firstName || data.firstName).catch(() => {});

  return { success: true };
}

// ─── Email verification ───────────────────────────────────────────────────

export async function verifyEmailToken(token: string) {
  const rec = await prisma.verificationToken.findUnique({ where: { token } });
  if (!rec) throw new Error("Invalid or expired verification token.");
  if (rec.expires < new Date()) throw new Error("This verification token has expired.");

  const user = await prisma.user.findUnique({ where: { email: rec.identifier } });
  if (!user) throw new Error("User not found.");

  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
  await prisma.verificationToken.delete({ where: { token } });

  return { success: true };
}

export async function resendVerificationEmail(email: string) {
  const ip = getClientIp();
  await checkRateLimit(ip, "VERIFY_RESEND", 1, 1);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { success: true }; // silent for security
  if (user.emailVerified) throw new Error("Account is already verified.");

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = crypto.randomUUID();
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    },
  });

  await prisma.authLog.create({
    data: { ipAddress: ip, email: user.email, action: "VERIFY_RESEND" },
  });

  const verifyUrl = `${SITE_URL}/verify-email?token=${token}`;
  await sendEmailVerification(email, verifyUrl);

  return { success: true };
}

// ─── Password Reset ───────────────────────────────────────────────────────

export async function requestPasswordReset(email: string) {
  const ip = getClientIp();
  await checkRateLimit(ip, "PASSWORD_RESET", 15, 3);

  await prisma.authLog.create({
    data: { ipAddress: ip, email, action: "PASSWORD_RESET" },
  });

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success silently — never reveal whether email exists
  if (!user || !user.password) return { success: true };

  // Delete any old tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  const token = crypto.randomUUID();
  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    },
  });

  const resetUrl = `${SITE_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetUrl);

  return { success: true };
}

export async function validateResetToken(token: string) {
  const rec = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!rec || rec.expires < new Date()) {
    throw new Error("Invalid or expired reset token.");
  }
  return { success: true, email: rec.email };
}

export async function resetPassword(token: string, newPassword: string) {
  const rec = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!rec || rec.expires < new Date()) {
    throw new Error("This reset link has expired. Please request a new one.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email: rec.email },
    data: {
      password: hashedPassword,
      securityStamp: crypto.randomUUID(), // invalidates all existing sessions
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  await prisma.passwordResetToken.delete({ where: { token } });

  return { success: true };
}

// ─── Change Password (authenticated) ─────────────────────────────────────

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");

  if (!user.password) {
    throw new Error("This account was created without a password. Please use the reset password flow.");
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new Error("Incorrect current password.");

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedNewPassword,
      securityStamp: crypto.randomUUID(),
    },
  });

  return { success: true };
}

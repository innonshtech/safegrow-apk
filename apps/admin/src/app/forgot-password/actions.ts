"use server";

import { prisma } from '@safegrow/db';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// Request Password Reset (Step 1)
export async function requestPasswordResetAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { ...prevState, step: 1, error: 'Email or User ID is required', success: '' };
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ userId: email }, { email: email }]
      }
    });

    if (!user || !user.email) {
      // Return a generic message to prevent user enumeration
      return { ...prevState, step: 2, email: email, success: 'If that email exists in our system, a reset code has been sent.', error: '' };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpiry: expiresAt,
      }
    });

    // Send beautiful email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlTemplate = `
      <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #eaeaea;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1a1a1a; margin: 0; font-size: 24px;">Password Reset Request</h2>
        </div>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          Hello ${user.name || 'User'},
        </p>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          We received a request to reset your SafeGrow password. Enter the code below to complete the reset. <strong>This code is valid for exactly 5 minutes.</strong>
        </p>
        <div style="background-color: #f4f8f4; border: 1px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #047857;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
          If you didn't request this reset, you can safely ignore this email. Your password will not change.
        </p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          SafeGrow Secure Authentication<br/>
          This is an automated message, please do not reply.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: '"SafeGrow Support" <noreply@safegrow.com>',
      to: user.email,
      subject: "Your SafeGrow Password Reset Code",
      text: `Your password reset code is: ${otp}. It will expire in 5 minutes.`,
      html: htmlTemplate,
    });

    return { ...prevState, step: 2, email: user.email, success: 'Reset code sent successfully', error: '' };
  } catch (err) {
    console.error('Request password reset error:', err);
    return { ...prevState, step: 1, error: 'Failed to send reset code. Please try again.', success: '' };
  }
}

// Verify OTP and Reset Password (Step 2)
export async function verifyAndResetPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const otp = formData.get('otp') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!email || !otp || !newPassword) {
    return { ...prevState, step: 2, email, error: 'All fields are required', success: '' };
  }

  if (newPassword.length < 6) {
    return { ...prevState, step: 2, email, error: 'Password must be at least 6 characters', success: '' };
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!user) {
      return { ...prevState, step: 2, email, error: 'Invalid or expired code', success: '' };
    }

    if (user.resetOtp !== otp) {
      return { ...prevState, step: 2, email, error: 'Invalid verification code', success: '' };
    }

    if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
      return { ...prevState, step: 2, email, error: 'Verification code has expired', success: '' };
    }

    // Valid OTP! Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        plainPassword: newPassword, // Retaining plain password for admin viewing as per previous architecture
        resetOtp: null,
        resetOtpExpiry: null,
      }
    });

    return { ...prevState, step: 3, success: 'Password reset successfully!', error: '' };
  } catch (err) {
    console.error('Reset password error:', err);
    return { ...prevState, step: 2, email, error: 'Failed to reset password. Please try again.', success: '' };
  }
}

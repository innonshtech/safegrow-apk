import { NextResponse } from "next/server";
import { prisma } from "@safegrow/db";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ userId: userId }, { email: userId }]
      }
    });

    if (!user || !user.email) {
      return NextResponse.json({ error: "User not found or no email registered" }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpiry: expiresAt,
      }
    });

    // Mask email for response
    const [namePart, domainPart] = user.email.split('@');
    const maskedName = namePart.substring(0, 2) + '*'.repeat(Math.max(namePart.length - 2, 4));
    const maskedEmail = `${maskedName}@${domainPart}`;

    // Send email (in a real app this would go to a queue or background worker)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.mailtrap.io",
      port: parseInt(process.env.SMTP_PORT || "2525"),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: '"SafeGrow Support" <noreply@safegrow.com>',
      to: user.email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${otp}. It will expire in 15 minutes.`,
      html: `<p>Your password reset code is: <strong>${otp}</strong>. It will expire in 15 minutes.</p>`,
    });

    return NextResponse.json({ 
      success: true, 
      maskedEmail 
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

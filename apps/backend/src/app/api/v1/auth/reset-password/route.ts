import { NextResponse } from "next/server";
import { prisma } from "@safegrow/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, otp, newPassword } = body;

    if (!userId || !otp || !newPassword) {
      return NextResponse.json({ error: "User ID, OTP, and new password are required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ userId: userId }, { email: userId }]
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.resetOtp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        plainPassword: newPassword, // Update plain password for admin viewing as requested previously
        resetOtp: null,
        resetOtpExpiry: null,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@safegrow/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, otp } = body;

    if (!userId || !otp) {
      return NextResponse.json({ error: "User ID and OTP are required" }, { status: 400 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

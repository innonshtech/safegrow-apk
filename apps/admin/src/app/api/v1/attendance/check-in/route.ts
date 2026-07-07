export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { CheckInRequestSchema } from "@safegrow/shared";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = CheckInRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const { time, lat, lng, photoUrl } = result.data;

    // Check if there's already an open attendance for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const existing = await prisma.attendance.findFirst({
      where: {
        userId: auth.id,
        date: { gte: startOfDay },
        checkOutTime: null
      }
    });

    if (existing) {
      return NextResponse.json({ error: "User is already checked in", attendanceId: existing.id }, { status: 400 });
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId: auth.id,
        date: new Date(time), // using the check-in time as the date baseline
        checkInTime: new Date(time),
        checkInLat: lat,
        checkInLng: lng,
        checkInPhotoUrl: photoUrl
      }
    });

    return NextResponse.json({ message: "Checked in successfully", attendanceId: attendance.id });
  } catch (error) {
    console.error("Check-in Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

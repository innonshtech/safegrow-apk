export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { CheckOutRequestSchema } from "@safegrow/shared";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = CheckOutRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const { time, lat, lng, photoUrl } = result.data;

    // Find the currently open attendance
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const openAttendance = await prisma.attendance.findFirst({
      where: {
        userId: auth.id,
        date: { gte: startOfDay },
        checkOutTime: null
      }
    });

    if (!openAttendance) {
      return NextResponse.json({ error: "No active check-in found for today" }, { status: 404 });
    }

    const attendance = await prisma.attendance.update({
      where: { id: openAttendance.id },
      data: {
        checkOutTime: new Date(time),
        checkOutLat: lat,
        checkOutLng: lng,
        checkOutPhotoUrl: photoUrl
      }
    });

    return NextResponse.json({ message: "Checked out successfully", attendanceId: attendance.id });
  } catch (error) {
    console.error("Check-out Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

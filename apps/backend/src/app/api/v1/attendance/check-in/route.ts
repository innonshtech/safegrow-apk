import { NextResponse } from "next/server";
import { CheckInRequestSchema } from "@safegrow/shared";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../../lib/auth";
import { withErrorHandler } from "../../../../../lib/apiHandler";
import { UnauthorizedError, AppError } from "../../../../../lib/errors";

export const POST = withErrorHandler(async (request: Request) => {
  const auth = verifyAuth(request);
  if (!auth) {
    throw new UnauthorizedError();
  }

  const body = await request.json();
  const result = CheckInRequestSchema.parse(body);

  const { time, lat, lng, photoUrl } = result;

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
    throw new AppError("User is already checked in", 400);
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
});

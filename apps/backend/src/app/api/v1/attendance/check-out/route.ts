import { NextResponse } from "next/server";
import { CheckOutRequestSchema } from "@safegrow/shared";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../../lib/auth";
import { withErrorHandler } from "../../../../../lib/apiHandler";
import { UnauthorizedError, NotFoundError } from "../../../../../lib/errors";

export const POST = withErrorHandler(async (request: Request) => {
  const auth = verifyAuth(request);
  if (!auth) {
    throw new UnauthorizedError();
  }

  const body = await request.json();
  const result = CheckOutRequestSchema.parse(body);

  const { time, lat, lng, photoUrl } = result;

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
    throw new NotFoundError("No active check-in found for today");
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
});

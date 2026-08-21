import { NextResponse } from "next/server";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../../lib/auth";
import { withErrorHandler } from "../../../../../lib/apiHandler";
import { UnauthorizedError } from "../../../../../lib/errors";

export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(async (request: Request) => {
  const auth = verifyAuth(request);
  if (!auth) {
    throw new UnauthorizedError();
  }

  const userId = auth.id;

  // Calculate start of today (midnight)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Auto-checkout any stale unclosed attendance records from previous days
  const unclosedPastAttendances = await prisma.attendance.findMany({
    where: {
      userId,
      date: { lt: startOfToday },
      checkOutTime: null,
    },
  });

  for (const att of unclosedPastAttendances) {
    const autoCheckOutTime = new Date(att.date);
    autoCheckOutTime.setHours(23, 59, 59, 999);

    await prisma.attendance.update({
      where: { id: att.id },
      data: {
        checkOutTime: autoCheckOutTime,
        checkOutPhotoUrl: 'auto_checkout',
      },
    });
  }

  // Check if there is an active check-in for TODAY
  const activeAttendance = await prisma.attendance.findFirst({
    where: {
      userId,
      date: { gte: startOfToday },
      checkOutTime: null,
    },
  });

  // Count visits recorded TODAY
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const todayVisitsCount = await prisma.visit.count({
    where: {
      userId,
      time: { gte: startOfToday, lt: endOfToday },
    },
  });

  if (!activeAttendance) {
    return NextResponse.json({
      isCheckedIn: false,
      attendance: null,
      todayVisitsCount,
    });
  }

  return NextResponse.json({
    isCheckedIn: true,
    attendance: {
      id: activeAttendance.id,
      checkInTime: activeAttendance.checkInTime,
      checkInLat: activeAttendance.checkInLat,
      checkInLng: activeAttendance.checkInLng,
      checkInPhotoUrl: activeAttendance.checkInPhotoUrl,
    },
    todayVisitsCount,
  });
});

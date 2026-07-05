import { NextResponse } from "next/server";
import { CreateVisitRequestSchema } from "@safegrow/shared";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../lib/auth";
import { withErrorHandler } from "../../../../lib/apiHandler";
import { UnauthorizedError, AppError } from "../../../../lib/errors";

export const POST = withErrorHandler(async (request: Request) => {
  const auth = verifyAuth(request);
  if (!auth) {
    throw new UnauthorizedError();
  }

  const body = await request.json();
  const result = CreateVisitRequestSchema.parse(body);

  const { attendanceId, time, lat, lng, photoUrl, vendorName, area, outcome, notes } = result;

    // Verify attendance belongs to user
  const attendance = await prisma.attendance.findUnique({
    where: { id: attendanceId }
  });

  if (!attendance || attendance.userId !== auth.id) {
    throw new AppError("Invalid attendance record", 400);
  }

    const visit = await prisma.visit.create({
      data: {
        attendanceId,
        userId: auth.id,
        time: new Date(time),
        lat,
        lng,
        photoUrl,
        vendorName,
        area,
        outcome,
        notes
      }
    });

  return NextResponse.json({ message: "Visit created successfully", visitId: visit.id });
});

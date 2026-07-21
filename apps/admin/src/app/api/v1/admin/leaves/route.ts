import { NextResponse } from "next/server";
import { prisma } from "@safegrow/db";
import { getCurrentAdmin } from "../../../../../lib/auth";
import { withErrorHandler } from "../../../../../lib/apiHandler";
import { UnauthorizedError, AppError } from "../../../../../lib/errors";

export const GET = withErrorHandler(async (request: Request) => {
  const auth = await getCurrentAdmin();
  if (!auth || auth.role !== "ADMIN") {
    throw new UnauthorizedError();
  }

  const leaves = await prisma.leaveRequest.findMany({
    include: {
      user: {
        select: {
          name: true,
          employeeId: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ leaves });
});

export const POST = withErrorHandler(async (request: Request) => {
  const auth = await getCurrentAdmin();
  if (!auth || auth.role !== "ADMIN") {
    throw new UnauthorizedError();
  }

  const body = await request.json();
  const { leaveId, status } = body;

  if (!leaveId || !['APPROVED', 'REJECTED'].includes(status)) {
    throw new AppError("Invalid input", 400);
  }

  const leaveRequest = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status }
  });

  return NextResponse.json({ success: true, request: leaveRequest });
});

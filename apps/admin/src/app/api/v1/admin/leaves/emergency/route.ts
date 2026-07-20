import { NextResponse } from "next/server";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../../lib/auth";
import { withErrorHandler } from "../../../../../lib/apiHandler";
import { UnauthorizedError, AppError } from "../../../../../lib/errors";

export const POST = withErrorHandler(async (request: Request) => {
  const auth = verifyAuth(request);
  if (!auth || auth.role !== "ADMIN") {
    throw new UnauthorizedError();
  }

  const body = await request.json();
  const { userId, type, startDate, endDate, reason } = body;

  if (!userId || !type || !startDate || !endDate || !reason) {
    throw new AppError("Missing required fields", 400);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    throw new AppError("End date must be after start date", 400);
  }

  // Calculate total days excluding Sundays
  let totalDays = 0;
  let currentDate = new Date(start);
  while (currentDate <= end) {
    if (currentDate.getDay() !== 0) {
      totalDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (totalDays === 0) {
    throw new AppError("Selected date range contains no valid working days.", 400);
  }

  // Admin override automatically ignores quotas. Just determine paid vs unpaid if Medical.
  let paidDays = 0;
  let unpaidDays = totalDays;

  if (type === 'MEDICAL') {
    const startOfYear = new Date(start.getFullYear(), 0, 1);
    const endOfYear = new Date(start.getFullYear(), 11, 31, 23, 59, 59, 999);
    
    const leavesThisYear = await prisma.leaveRequest.findMany({
      where: {
        userId,
        type,
        status: { in: ['APPROVED', 'PENDING'] },
        startDate: {
          gte: startOfYear,
          lte: endOfYear
        }
      }
    });

    const medicalUsedYear = leavesThisYear.reduce((acc, curr) => acc + curr.paidDays, 0);
    const startOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);

    const leavesThisMonth = leavesThisYear.filter(l => l.startDate >= startOfMonth && l.startDate <= endOfMonth);
    const medicalUsedMonth = leavesThisMonth.reduce((acc, curr) => acc + curr.paidDays, 0);

    const remainingYearly = Math.max(0, 5 - medicalUsedYear);
    const remainingMonthly = Math.max(0, 2 - medicalUsedMonth);
    
    const availablePaidDays = Math.min(remainingYearly, remainingMonthly);
    
    paidDays = Math.min(totalDays, availablePaidDays);
    unpaidDays = totalDays - paidDays;
  }

  const leaveRequest = await prisma.leaveRequest.create({
    data: {
      userId,
      startDate: start,
      endDate: end,
      type,
      reason: `[Admin Override] ${reason}`,
      totalDays,
      paidDays,
      unpaidDays,
      status: 'APPROVED' // Auto-approve
    },
    include: {
      user: {
        select: { name: true, employeeId: true }
      }
    }
  });

  return NextResponse.json({ success: true, request: leaveRequest });
});

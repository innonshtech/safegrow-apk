import { NextResponse } from "next/server";
import { CreateLeaveRequestSchema } from "@safegrow/shared";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../../lib/auth";
import { withErrorHandler } from "../../../../../lib/apiHandler";
import { UnauthorizedError, AppError } from "../../../../../lib/errors";

export const DELETE = withErrorHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const auth = verifyAuth(request);
  if (!auth) {
    throw new UnauthorizedError();
  }

  const { id } = params;

  const leave = await prisma.leaveRequest.findUnique({
    where: { id },
  });

  if (!leave) {
    throw new AppError("Leave request not found", 404);
  }

  if (leave.userId !== auth.id && auth.role !== 'ADMIN') {
    throw new AppError("Unauthorized to delete this leave request", 403);
  }

  if (leave.status !== 'PENDING') {
    throw new AppError("Only pending leave requests can be deleted", 400);
  }

  await prisma.leaveRequest.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Leave request deleted successfully" });
});

export const PUT = withErrorHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const auth = verifyAuth(request);
  if (!auth) {
    throw new UnauthorizedError();
  }

  const { id } = params;

  const leave = await prisma.leaveRequest.findUnique({
    where: { id },
  });

  if (!leave) {
    throw new AppError("Leave request not found", 404);
  }

  if (leave.userId !== auth.id && auth.role !== 'ADMIN') {
    throw new AppError("Unauthorized to update this leave request", 403);
  }

  if (leave.status !== 'PENDING' && auth.role !== 'ADMIN') {
    throw new AppError("Only pending leave requests can be modified", 400);
  }

  const body = await request.json();
  const result = CreateLeaveRequestSchema.parse(body);

  const { startDate, endDate, type, reason, isAdminOverride, targetUserId } = result;

  if (isAdminOverride && auth.role !== 'ADMIN') {
    throw new AppError("Only admins can override leave quotas", 403);
  }

  const userId = isAdminOverride && targetUserId ? targetUserId : leave.userId;

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    throw new AppError("End date must be after start date", 400);
  }

  const overlappingLeave = await prisma.leaveRequest.findFirst({
    where: {
      userId,
      id: { not: id }, // Exclude current leave
      status: { in: ['APPROVED', 'PENDING'] },
      startDate: { lte: end },
      endDate: { gte: start }
    }
  });

  if (overlappingLeave) {
    throw new AppError("You already have a pending or approved leave request during these dates.", 400);
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

  let paidDays = 0;
  let unpaidDays = totalDays;

  // Fetch yearly data for quotas
  const startOfYear = new Date(start.getFullYear(), 0, 1);
  const endOfYear = new Date(start.getFullYear(), 11, 31, 23, 59, 59, 999);
  
  const leavesThisYear = await prisma.leaveRequest.findMany({
    where: {
      userId,
      type,
      id: { not: id }, // Exclude current leave
      status: { in: ['APPROVED', 'PENDING'] },
      startDate: {
        gte: startOfYear,
        lte: endOfYear
      }
    }
  });

  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: ['LEAVE_QUOTA_CASUAL', 'LEAVE_QUOTA_PRIVILEGE', 'LEAVE_QUOTA_MEDICAL_YEARLY', 'LEAVE_QUOTA_MEDICAL_MONTHLY']
      }
    }
  });
  
  const getSetting = (key: string, defaultVal: number) => {
    const s = settings.find(x => x.key === key);
    return s ? parseInt(s.value, 10) : defaultVal;
  };

  const limitCasual = getSetting('LEAVE_QUOTA_CASUAL', 5);
  const limitPrivilege = getSetting('LEAVE_QUOTA_PRIVILEGE', 10);
  const limitMedicalYearly = getSetting('LEAVE_QUOTA_MEDICAL_YEARLY', 5);
  const limitMedicalMonthly = getSetting('LEAVE_QUOTA_MEDICAL_MONTHLY', 2);

  if (type === 'CASUAL') {
    const casualUsed = leavesThisYear.reduce((acc, curr) => acc + curr.totalDays, 0);
    if (!isAdminOverride && casualUsed + totalDays > limitCasual) {
      throw new AppError(`Yearly casual leave quota exceeded (${limitCasual}). You have already used ${casualUsed} days.`, 400);
    }
    paidDays = 0;
    unpaidDays = totalDays;
  } else if (type === 'PRIVILEGE') {
    const privilegeUsed = leavesThisYear.reduce((acc, curr) => acc + curr.totalDays, 0);
    if (!isAdminOverride && privilegeUsed + totalDays > limitPrivilege) {
      throw new AppError(`Yearly privilege leave quota exceeded (${limitPrivilege}). You have already used ${privilegeUsed} days.`, 400);
    }
    paidDays = 0;
    unpaidDays = totalDays;
  } else if (type === 'MEDICAL') {
    const medicalUsedYear = leavesThisYear.reduce((acc, curr) => acc + curr.paidDays, 0);
    const startOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);

    const leavesThisMonth = leavesThisYear.filter(l => l.startDate >= startOfMonth && l.startDate <= endOfMonth);
    const medicalUsedMonth = leavesThisMonth.reduce((acc, curr) => acc + curr.paidDays, 0);

    const remainingYearly = Math.max(0, limitMedicalYearly - medicalUsedYear);
    const remainingMonthly = Math.max(0, limitMedicalMonthly - medicalUsedMonth);
    
    const availablePaidDays = Math.min(remainingYearly, remainingMonthly);
    
    paidDays = Math.min(totalDays, availablePaidDays);
    unpaidDays = totalDays - paidDays;
  }

  const updatedLeave = await prisma.leaveRequest.update({
    where: { id },
    data: {
      startDate: start,
      endDate: end,
      type,
      reason: isAdminOverride ? `[Admin Override] ${reason}` : reason,
      totalDays,
      paidDays,
      unpaidDays,
    }
  });

  return NextResponse.json({ message: "Leave request updated successfully", leaveRequest: updatedLeave });
});

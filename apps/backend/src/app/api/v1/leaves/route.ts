import { NextResponse } from "next/server";
import { CreateLeaveRequestSchema } from "@safegrow/shared";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../lib/auth";
import { withErrorHandler } from "../../../../lib/apiHandler";
import { UnauthorizedError, AppError } from "../../../../lib/errors";

export const GET = withErrorHandler(async (request: Request) => {
  const auth = verifyAuth(request);
  if (!auth) {
    throw new UnauthorizedError();
  }

  const leaves = await prisma.leaveRequest.findMany({
    where: { userId: auth.id },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ leaves });
});

export const POST = withErrorHandler(async (request: Request) => {
  const auth = verifyAuth(request);
  if (!auth) {
    throw new UnauthorizedError();
  }

  const body = await request.json();
  const result = CreateLeaveRequestSchema.parse(body);

  const { startDate, endDate, type, reason, isAdminOverride, targetUserId } = result;

  // Check admin privileges if overriding
  if (isAdminOverride && auth.role !== 'ADMIN') {
    throw new AppError("Only admins can override leave quotas", 403);
  }

  const userId = isAdminOverride && targetUserId ? targetUserId : auth.id;

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    throw new AppError("End date must be after start date", 400);
  }

  // Calculate total days excluding Sundays
  let totalDays = 0;
  let currentDate = new Date(start);
  while (currentDate <= end) {
    // 0 is Sunday
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
      status: { in: ['APPROVED', 'PENDING'] }, // Count pending as well
      startDate: {
        gte: startOfYear,
        lte: endOfYear
      }
    }
  });

  // Fetch dynamic quotas
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
    // Casual leaves are always unpaid
    paidDays = 0;
    unpaidDays = totalDays;
  } else if (type === 'PRIVILEGE') {
    const privilegeUsed = leavesThisYear.reduce((acc, curr) => acc + curr.totalDays, 0);
    if (!isAdminOverride && privilegeUsed + totalDays > limitPrivilege) {
      throw new AppError(`Yearly privilege leave quota exceeded (${limitPrivilege}). You have already used ${privilegeUsed} days.`, 400);
    }
    // Privilege leaves are always unpaid
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
    
    // We can only pay for what remains in both yearly and monthly quotas
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
      reason: isAdminOverride ? `[Admin Override] ${reason}` : reason,
      totalDays,
      paidDays,
      unpaidDays,
      status: isAdminOverride ? 'APPROVED' : 'PENDING' // Auto-approve if admin bypass
    }
  });

  return NextResponse.json({ message: "Leave request created successfully", leaveRequest });
});

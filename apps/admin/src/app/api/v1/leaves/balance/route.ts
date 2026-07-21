import { NextResponse } from "next/server";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../../lib/auth";
import { withErrorHandler } from "../../../../../lib/apiHandler";
import { UnauthorizedError } from "../../../../../lib/errors";

export const GET = withErrorHandler(async (request: Request) => {
  const auth = verifyAuth(request);
  if (!auth) {
    throw new UnauthorizedError();
  }

  const now = new Date();
  
  // Year boundaries
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  
  // Month boundaries
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Fetch all approved leaves for this year
  const leavesThisYear = await prisma.leaveRequest.findMany({
    where: {
      userId: auth.id,
      status: 'APPROVED',
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

  let casualUsed = 0;
  let privilegeUsed = 0;
  let medicalUsedYear = 0;
  let medicalUsedMonth = 0;

  for (const leave of leavesThisYear) {
    if (leave.type === 'CASUAL') casualUsed += leave.totalDays;
    if (leave.type === 'PRIVILEGE') privilegeUsed += leave.totalDays;
    if (leave.type === 'MEDICAL') {
      medicalUsedYear += leave.paidDays;
      if (leave.startDate >= startOfMonth && leave.startDate <= endOfMonth) {
        medicalUsedMonth += leave.paidDays;
      }
    }
  }

  return NextResponse.json({
    casual: { used: casualUsed, limit: limitCasual },
    privilege: { used: privilegeUsed, limit: limitPrivilege },
    medical: { usedThisYear: medicalUsedYear, usedThisMonth: medicalUsedMonth, yearlyLimit: limitMedicalYearly, monthlyLimit: limitMedicalMonthly }
  });
});

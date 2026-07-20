import { NextResponse } from "next/server";
import { prisma } from "@safegrow/db";
import { getCurrentAdmin } from "../../../../../lib/auth";
import { withErrorHandler } from "../../../../../lib/apiHandler";
import { UnauthorizedError } from "../../../../../lib/errors";

export const GET = withErrorHandler(async (request: Request) => {
  const auth = await getCurrentAdmin();
  if (!auth || auth.role !== "ADMIN") {
    throw new UnauthorizedError();
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'leaves') {
    const leaves = await prisma.leaveRequest.findMany({
      include: { user: { select: { name: true, employeeId: true } } },
      orderBy: { createdAt: 'desc' }
    });

    let csv = 'ID,Employee Name,Employee ID,Leave Type,Start Date,End Date,Total Days,Paid Days,Unpaid Days,Reason,Status,Created At\n';
    for (const l of leaves) {
      csv += `"${l.id}","${l.user.name}","${l.user.employeeId || ''}","${l.type}","${l.startDate.toISOString().split('T')[0]}","${l.endDate.toISOString().split('T')[0]}","${l.totalDays}","${l.paidDays}","${l.unpaidDays}","${l.reason.replace(/"/g, '""')}","${l.status}","${l.createdAt.toISOString()}"\n`;
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="leaves_export.csv"'
      }
    });

  } else if (type === 'attendance') {
    // Need to join Attendance and AttendanceRequests? 
    // Usually export just the raw Attendance table
    const attendances = await prisma.attendance.findMany({
      include: { user: { select: { name: true, employeeId: true } } },
      orderBy: { date: 'desc' }
    });

    let csv = 'ID,Employee Name,Employee ID,Date,Check-In Time,Check-In Lat,Check-In Lng,Check-Out Time,Check-Out Lat,Check-Out Lng\n';
    for (const a of attendances) {
      csv += `"${a.id}","${a.user.name}","${a.user.employeeId || ''}","${a.date.toISOString().split('T')[0]}","${a.checkInTime.toISOString()}","${a.checkInLat}","${a.checkInLng}","${a.checkOutTime ? a.checkOutTime.toISOString() : ''}","${a.checkOutLat || ''}","${a.checkOutLng || ''}"\n`;
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="attendance_export.csv"'
      }
    });
  }

  return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
});

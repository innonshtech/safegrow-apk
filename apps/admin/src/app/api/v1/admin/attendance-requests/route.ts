import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';

// GET /api/v1/admin/attendance-requests
// POST /api/v1/admin/attendance-requests
export async function GET(request: Request) {
  try {
    const requests = await prisma.attendanceRequest.findMany({
      include: {
        user: { select: { name: true, employeeId: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requestId, status } = body; // status: APPROVED or REJECTED

    if (!requestId || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const attRequest = await prisma.attendanceRequest.findUnique({ where: { id: requestId } });
    if (!attRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Update the request status
    const updatedRequest = await prisma.attendanceRequest.update({
      where: { id: requestId },
      data: { status }
    });

    // If APPROVED, we need to create or update the Attendance record
    if (status === 'APPROVED') {
      let attendance = await prisma.attendance.findFirst({
        where: { userId: attRequest.userId, date: attRequest.date }
      });

      if (attendance) {
        // Update existing
        await prisma.attendance.update({
          where: { id: attendance.id },
          data: {
            checkInTime: attRequest.checkInTime || attendance.checkInTime,
            checkOutTime: attRequest.checkOutTime || attendance.checkOutTime,
          }
        });
      } else {
        // Create new
        if (attRequest.checkInTime) {
          await prisma.attendance.create({
            data: {
              userId: attRequest.userId,
              date: attRequest.date,
              checkInTime: attRequest.checkInTime,
              checkInLat: 0,
              checkInLng: 0,
              checkInPhotoUrl: 'manual',
              checkOutTime: attRequest.checkOutTime || null,
              checkOutLat: attRequest.checkOutTime ? 0 : null,
              checkOutLng: attRequest.checkOutTime ? 0 : null,
              checkOutPhotoUrl: attRequest.checkOutTime ? 'manual' : null,
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error('Error updating attendance request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

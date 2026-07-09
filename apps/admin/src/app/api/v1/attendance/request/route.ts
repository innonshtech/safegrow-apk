import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';
import jwt from 'jsonwebtoken';

// POST /api/v1/attendance/request
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-dev');
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { date, checkInTime, checkOutTime, reason } = body;

    if (!date || !reason) {
      return NextResponse.json({ error: 'Date and reason are required' }, { status: 400 });
    }

    if (!checkInTime && !checkOutTime) {
      return NextResponse.json({ error: 'Either checkInTime or checkOutTime is required' }, { status: 400 });
    }

    const newRequest = await prisma.attendanceRequest.create({
      data: {
        userId: decoded.id,
        date: new Date(date),
        checkInTime: checkInTime ? new Date(checkInTime) : null,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
        reason,
        status: 'PENDING',
      }
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error('Error creating attendance request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

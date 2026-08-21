import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all attendances from previous days where checkOutTime is null
    const unclosedPastAttendances = await prisma.attendance.findMany({
      where: {
        date: { lt: today },
        checkOutTime: null,
      },
    });

    let checkedOutCount = 0;

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

      // Optionally record a fraud alert for missing checkout
      const existingAlert = await prisma.fraudAlert.findFirst({
        where: {
          userId: att.userId,
          type: 'NO_CHECK_OUT',
          createdAt: { gte: att.date },
        },
      });

      if (!existingAlert) {
        await prisma.fraudAlert.create({
          data: {
            userId: att.userId,
            type: 'NO_CHECK_OUT',
            metadata: { message: 'Day auto checked out by system cron' },
          },
        });
      }

      checkedOutCount++;
    }

    return NextResponse.json({ success: true, checkedOutCount });
  } catch (error) {
    console.error('Cron auto-checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

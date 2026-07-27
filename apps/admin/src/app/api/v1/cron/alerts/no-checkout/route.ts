import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';
import { getISTDayBoundaries } from '../timezone-helper';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get today's start and end date in IST (since this runs at 11:55 PM IST)
    const { startOfDayUTC, endOfDayUTC, targetDate } = getISTDayBoundaries();

    const attendances = await prisma.attendance.findMany({
      where: {
        date: targetDate,
        checkOutTime: null,
      }
    });

    let createdCount = 0;

    for (const att of attendances) {
      const existingAlert = await prisma.fraudAlert.findFirst({
        where: {
          userId: att.userId,
          type: 'NO_CHECK_OUT',
          createdAt: {
            gte: startOfDayUTC,
            lt: endOfDayUTC,
          }
        }
      });

      if (!existingAlert) {
        await prisma.fraudAlert.create({
          data: {
            userId: att.userId,
            type: 'NO_CHECK_OUT',
            metadata: { message: 'Day left incomplete, no check-out registered' }
          }
        });
        createdCount++;
      }
    }

    // Silently check them out for the next day to start fresh
    await prisma.attendance.updateMany({
      where: {
        date: targetDate,
        checkOutTime: null,
      },
      data: {
        autoCheckedOut: true,
      }
    });

    return NextResponse.json({ success: true, alertsCreated: createdCount, autoCheckedOut: attendances.length });
  } catch (error) {
    console.error('Cron no-checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

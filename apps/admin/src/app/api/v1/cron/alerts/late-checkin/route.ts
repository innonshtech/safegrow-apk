import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';
import { getISTDayBoundaries } from '../timezone-helper';

export async function GET(request: Request) {
  // Simple cron secret check
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get standard check-in time from settings (default to 08:00 if not found)
    const setting = await prisma.setting.findUnique({
      where: { key: 'STANDARD_CHECKIN_TIME' }
    });
    const standardTimeStr = setting?.value || '08:00';
    const [stdHour, stdMinute] = standardTimeStr.split(':').map(Number);

    // 2. Get today's start and end date in IST
    const { startOfDayUTC, endOfDayUTC, targetDate, year, month, day } = getISTDayBoundaries();

    // 3. Fetch all attendances for today
    const attendances = await prisma.attendance.findMany({
      where: {
        date: targetDate
      },
      include: {
        user: true,
      }
    });

    let createdCount = 0;
    let resolvedCount = 0;

    // 4. Evaluate each attendance
    for (const att of attendances) {
      const checkIn = new Date(att.checkInTime);
      
      // Calculate standard check-in time for this specific day in IST -> converted to UTC
      const expectedCheckInUTC = new Date(Date.UTC(year, month, day, stdHour, stdMinute, 0) - (5.5 * 60 * 60 * 1000));
      
      const isLate = checkIn > expectedCheckInUTC;

      // Find existing alert for this user today
      const existingAlert = await prisma.fraudAlert.findFirst({
        where: {
          userId: att.userId,
          type: 'LATE_CHECK_IN',
          createdAt: {
            gte: startOfDayUTC,
            lt: endOfDayUTC,
          }
        }
      });

      if (isLate) {
        if (!existingAlert) {
          // Create new alert
          await prisma.fraudAlert.create({
            data: {
              userId: att.userId,
              type: 'LATE_CHECK_IN',
              metadata: { expected: expectedCheckInUTC.toISOString(), actual: checkIn.toISOString() }
            }
          });
          createdCount++;
        } else if (existingAlert.resolvedAt) {
          // Re-open alert if it was resolved but still late (e.g., admin edited again)
          await prisma.fraudAlert.update({
            where: { id: existingAlert.id },
            data: { resolvedAt: null, resolvedById: null }
          });
          createdCount++;
        }
      } else {
        if (existingAlert && !existingAlert.resolvedAt) {
          // Check-in is on time (perhaps admin edited it), so resolve the alert
          await prisma.fraudAlert.update({
            where: { id: existingAlert.id },
            data: { resolvedAt: new Date(), metadata: { ...((existingAlert.metadata as any) || {}), resolvedReason: 'Admin corrected time to be on time' } }
          });
          resolvedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, createdCount, resolvedCount });
  } catch (error) {
    console.error('Cron late-checkin error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

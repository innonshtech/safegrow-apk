export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';
import { getISTDayBoundaries } from '../timezone-helper';
import { verifyCronAuth, unauthorizedCronResponse } from '../../cron-auth';

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return unauthorizedCronResponse();
  }

  try {
    const { startOfDayUTC, endOfDayUTC, targetDate } = getISTDayBoundaries();

    // Get all attendances today where checkout is null
    const attendances = await prisma.attendance.findMany({
      where: {
        date: targetDate,
        checkOutTime: null,
      },
      include: {
        locationPings: {
          orderBy: { time: 'desc' },
          take: 1
        }
      }
    });

    let createdCount = 0;
    const THIRTY_MINS_MS = 30 * 60 * 1000;

    for (const att of attendances) {
      if (att.locationPings.length > 0) {
        const lastPingTime = new Date(att.locationPings[0].time).getTime();
        const now = Date.now();

        if (now - lastPingTime > THIRTY_MINS_MS) {
          const existingAlert = await prisma.fraudAlert.findFirst({
            where: {
              userId: att.userId,
              type: 'TRACKING_OFF',
              createdAt: { gte: startOfDayUTC, lt: endOfDayUTC },
              resolvedAt: null
            }
          });

          if (!existingAlert) {
            await prisma.fraudAlert.create({
              data: {
                userId: att.userId,
                type: 'TRACKING_OFF',
                metadata: { lastPing: new Date(lastPingTime).toISOString() }
              }
            });
            createdCount++;
          }
        }
      }
    }

    return NextResponse.json({ success: true, createdCount });
  } catch (error) {
    console.error('Cron tracking-off error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

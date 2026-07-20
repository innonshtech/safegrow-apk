import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    // Look at yesterday's attendances since this runs at end of day or midnight
    const startOfYesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const endOfYesterday = new Date(startOfYesterday);
    endOfYesterday.setDate(endOfYesterday.getDate() + 1);

    const attendances = await prisma.attendance.findMany({
      where: {
        date: { gte: startOfYesterday, lt: endOfYesterday },
        checkOutTime: null,
      }
    });

    let createdCount = 0;

    for (const att of attendances) {
      const existingAlert = await prisma.fraudAlert.findFirst({
        where: {
          userId: att.userId,
          type: 'NO_CHECK_OUT',
          createdAt: { gte: startOfYesterday, lt: endOfYesterday },
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

    return NextResponse.json({ success: true, createdCount });
  } catch (error) {
    console.error('Cron no-checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Get all attendances today with visits count
    const attendances = await prisma.attendance.findMany({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
      },
      include: {
        _count: {
          select: { visits: true }
        }
      }
    });

    let createdCount = 0;

    for (const att of attendances) {
      if (att._count.visits === 0) {
        // Check if alert already exists
        const existingAlert = await prisma.fraudAlert.findFirst({
          where: {
            userId: att.userId,
            type: 'ZERO_VISITS',
            createdAt: { gte: startOfDay, lt: endOfDay },
          }
        });

        if (!existingAlert) {
          await prisma.fraudAlert.create({
            data: {
              userId: att.userId,
              type: 'ZERO_VISITS',
              metadata: { message: '0 visits recorded by the time the cron ran' }
            }
          });
          createdCount++;
        }
      }
    }

    return NextResponse.json({ success: true, createdCount });
  } catch (error) {
    console.error('Cron zero-visits error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

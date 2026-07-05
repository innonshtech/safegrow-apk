import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';
import { verifyAuth } from '@/lib/auth';
import { withErrorHandler } from '@/lib/apiHandler';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';

export const GET = withErrorHandler(async (request: Request) => {
  const user = verifyAuth(request);
  if (!user) {
    throw new UnauthorizedError();
  }

  if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
    throw new ForbiddenError('Forbidden. Manager role required.');
  }

    // Get today's start and end timestamps in UTC
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch team members
    const teamMembers = await prisma.user.findMany({
      where: {
        reportsToId: user.id,
      },
      select: {
        id: true,
        name: true,
        attendances: {
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay,
            }
          },
          include: {
            visits: true
          }
        }
      }
    });

    let checkedInCount = 0;
    let checkedOutCount = 0;
    let trackingOffCount = 0;

    const formattedMembers = teamMembers.map(member => {
      const todayAttendance = member.attendances[0]; // Assuming max 1 per day
      let status = 'Tracking off';
      
      if (todayAttendance) {
        if (todayAttendance.checkOutTime) {
          status = 'Checked out';
          checkedOutCount++;
        } else {
          status = 'Checked in';
          checkedInCount++;
        }
      } else {
        trackingOffCount++;
      }

      const visitsCount = todayAttendance?.visits.length || 0;

      return {
        id: member.id,
        name: member.name,
        status,
        visitsCount,
      };
    });

  return NextResponse.json({
    summary: {
      checkedIn: checkedInCount,
      checkedOut: checkedOutCount,
      trackingOff: trackingOffCount,
    },
    members: formattedMembers
  });
});

import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Manager role required.' }, { status: 403 });
    }

    const { id: memberId } = await params;
    
    // Verify the member actually reports to this manager
    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        reportsToId: user.id
      }
    });

    if (!member) {
      return NextResponse.json({ error: 'Team member not found or access denied.' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    let targetDate = new Date();
    
    if (dateParam) {
      targetDate = new Date(dateParam);
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: memberId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        }
      },
      include: {
        visits: {
          orderBy: { time: 'asc' }
        },
        locationPings: {
          orderBy: { time: 'asc' }
        }
      }
    });

    if (!attendance) {
      return NextResponse.json({ 
        member: { id: member.id, name: member.name },
        attendance: null 
      });
    }

    // Calculate distance (very rough estimate by sum of segments)
    let distanceKm = 0;
    const pings = attendance.locationPings;
    for (let i = 1; i < pings.length; i++) {
      const p1 = pings[i - 1];
      const p2 = pings[i];
      // Haversine formula
      const R = 6371; // km
      const dLat = (p2.lat - p1.lat) * Math.PI / 180;
      const dLon = (p2.lng - p1.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distanceKm += R * c;
    }

    return NextResponse.json({
      member: { id: member.id, name: member.name },
      attendance: {
        id: attendance.id,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        distanceKm: distanceKm.toFixed(1),
        visitsCount: attendance.visits.length,
        visits: attendance.visits,
        route: attendance.locationPings.map(p => ({
          latitude: p.lat,
          longitude: p.lng,
          time: p.time
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching team member day:', error);
    return NextResponse.json({ error: 'Failed to fetch team member day' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';

export async function GET(request: Request) {
  try {
    const alerts = await prisma.fraudAlert.findMany({
      where: { resolvedAt: null },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

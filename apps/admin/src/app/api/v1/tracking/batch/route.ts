export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { BatchLocationPingRequestSchema } from "@safegrow/shared";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = BatchLocationPingRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const { pings } = result.data;

    if (pings.length === 0) {
      return NextResponse.json({ message: "No pings provided" });
    }

    // Verify the attendance belongs to user (just checking the first ping for optimization)
    const firstPing = pings[0];
    const attendance = await prisma.attendance.findUnique({
      where: { id: firstPing.attendanceId }
    });

    if (!attendance || attendance.userId !== auth.id) {
      return NextResponse.json({ error: "Invalid attendance record for ping" }, { status: 400 });
    }

    await prisma.locationPing.createMany({
      data: pings.map((ping) => ({
        userId: auth.id,
        attendanceId: ping.attendanceId,
        time: new Date(ping.time),
        lat: ping.lat,
        lng: ping.lng,
        accuracy: ping.accuracy || null,
        speed: ping.speed || null
      })),
      skipDuplicates: true // in case the mobile app resyncs same pings
    });

    return NextResponse.json({ message: `Successfully inserted ${pings.length} location pings` });
  } catch (error) {
    console.error("Tracking Batch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

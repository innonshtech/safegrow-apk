import { NextResponse } from "next/server";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.id;

    // Fetch the user's attendance records, ordered by date descending
    const attendances = await prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30 // fetch last 30 days
    });

    // Fetch the user's manual requests
    const requests = await prisma.attendanceRequest.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30
    });

    return NextResponse.json({ attendances, requests });
  } catch (error) {
    console.error("Attendance History Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

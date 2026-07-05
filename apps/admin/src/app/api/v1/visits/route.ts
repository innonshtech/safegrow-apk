import { NextResponse } from "next/server";
import { CreateVisitRequestSchema } from "@safegrow/shared";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = CreateVisitRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const { attendanceId, time, lat, lng, photoUrl, buyerName, outcome, notes } = result.data;

    // Verify attendance belongs to user
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId }
    });

    if (!attendance || attendance.userId !== auth.id) {
      return NextResponse.json({ error: "Invalid attendance record" }, { status: 400 });
    }

    const visit = await prisma.visit.create({
      data: {
        attendanceId,
        userId: auth.id,
        time: new Date(time),
        lat,
        lng,
        photoUrl,
        vendorName: buyerName || "Unknown Buyer",
        area: "Unknown Area", // Add default area
        outcome,
        notes
      }
    });

    return NextResponse.json({ message: "Visit created successfully", visitId: visit.id });
  } catch (error) {
    console.error("Visit Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../../lib/auth";

export async function GET(request: Request) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const visits = await prisma.visit.findMany({
      where: {
        userId: auth.id
      },
      orderBy: {
        time: 'desc'
      }
    });

    // Map vendorName to buyerName for the mobile app, and ensure area is passed back
    const mappedVisits = visits.map(visit => ({
      ...visit,
      buyerName: visit.vendorName || "Unknown Buyer",
      area: visit.area || "Unknown Area"
    }));

    return NextResponse.json(mappedVisits);
  } catch (error) {
    console.error("Fetch Visits Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

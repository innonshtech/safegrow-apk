import { NextResponse } from "next/server";
import { prisma } from "@safegrow/db";
import { getCurrentAdmin } from "../../../../../lib/auth";
import { withErrorHandler } from "../../../../../lib/apiHandler";
import { UnauthorizedError } from "../../../../../lib/errors";

export const GET = withErrorHandler(async (request: Request) => {
  const auth = await getCurrentAdmin();
  if (!auth || auth.role !== "ADMIN") {
    throw new UnauthorizedError();
  }

  const settings = await prisma.setting.findMany();
  
  // Convert array of {key, value} to object { [key]: value }
  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return NextResponse.json({ settings: settingsMap });
});

export const POST = withErrorHandler(async (request: Request) => {
  const auth = await getCurrentAdmin();
  if (!auth || auth.role !== "ADMIN") {
    throw new UnauthorizedError();
  }

  const body = await request.json();
  const { settings } = body; // Expects an object { key: value, ... }

  if (!settings || typeof settings !== 'object') {
    return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
  }

  // Update or create each setting
  const updatePromises = Object.entries(settings).map(([key, value]) => {
    return prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) }
    });
  });

  await Promise.all(updatePromises);

  return NextResponse.json({ success: true, message: "Settings updated successfully" });
});

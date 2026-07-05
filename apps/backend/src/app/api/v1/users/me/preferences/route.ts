import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';
import { verifyAuth } from '../../../../../../lib/auth';
import { withErrorHandler } from '../../../../../../lib/apiHandler';
import { UnauthorizedError, ValidationError } from '../../../../../../lib/errors';
import { z } from 'zod';

const PreferencesSchema = z.object({
  pushEnabled: z.boolean().optional(),
  notifyCheckIn: z.boolean().optional(),
  notifyTrackingStopped: z.boolean().optional(),
  notifySyncIssues: z.boolean().optional(),
  notifyManagerMessages: z.boolean().optional(),
});

export const POST = withErrorHandler(async (request: Request) => {
  const auth = verifyAuth(request);
  if (!auth) {
    throw new UnauthorizedError();
  }

  const body = await request.json();
  const parsed = PreferencesSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Invalid request body', parsed.error.errors);
  }

  const updatedUser = await prisma.user.update({
    where: { id: auth.id },
    data: parsed.data,
    select: {
      pushEnabled: true,
      notifyCheckIn: true,
      notifyTrackingStopped: true,
      notifySyncIssues: true,
      notifyManagerMessages: true,
    }
  });

  return NextResponse.json({ success: true, preferences: updatedUser });
});

export const GET = withErrorHandler(async (request: Request) => {
  const auth = verifyAuth(request);
  if (!auth) {
    throw new UnauthorizedError();
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: {
      pushEnabled: true,
      notifyCheckIn: true,
      notifyTrackingStopped: true,
      notifySyncIssues: true,
      notifyManagerMessages: true,
    }
  });

  return NextResponse.json({ preferences: user });
});

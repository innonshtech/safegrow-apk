import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';
import { verifyAuth } from '../../../../../../lib/auth';
import { withErrorHandler } from '../../../../../../lib/apiHandler';
import { UnauthorizedError, ValidationError } from '../../../../../../lib/errors';
import { z } from 'zod';

const FcmSchema = z.object({
  fcmToken: z.string().min(1, 'Token is required'),
});

export const POST = withErrorHandler(async (request: Request) => {
  const auth = verifyAuth(request);
  if (!auth) {
    throw new UnauthorizedError();
  }

  const body = await request.json();
  const parsed = FcmSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Invalid request body', parsed.error.errors);
  }

  const { fcmToken } = parsed.data;

  const updatedUser = await prisma.user.update({
    where: { id: auth.id },
    data: { fcmToken },
  });

  return NextResponse.json({ success: true, message: 'FCM token updated successfully' });
});

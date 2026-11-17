import { NextResponse } from 'next/server';

export const DEFAULT_CRON_SECRET = 'sg_cron_x8j2n9kLmP4qRs7vW0yZ';

/**
 * Validates whether the incoming cron request has valid authorization.
 * Supports:
 *  1. Header: `Authorization: Bearer <secret>`
 *  2. Query Param: `?key=<secret>` or `?secret=<secret>`
 *  3. Vercel Cron header: `x-vercel-cron: 1`
 */
export function verifyCronAuth(request: Request): boolean {
  const expectedSecret = process.env.CRON_SECRET || DEFAULT_CRON_SECRET;

  // 1. Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader === `Bearer ${expectedSecret}`) {
    return true;
  }

  // 2. Check query parameter
  try {
    const url = new URL(request.url);
    const querySecret = url.searchParams.get('secret') || url.searchParams.get('key');
    if (querySecret && querySecret === expectedSecret) {
      return true;
    }
  } catch {
    // ignore URL parsing error
  }

  // 3. Check Vercel native cron header (if triggered from vercel.json cron)
  const vercelCron = request.headers.get('x-vercel-cron');
  if (vercelCron === '1') {
    return true;
  }

  return false;
}

export function unauthorizedCronResponse() {
  return NextResponse.json(
    {
      error: 'Unauthorized',
      message: 'Missing or invalid cron secret. Provide "Authorization: Bearer <secret>" header or "?key=<secret>" query parameter.',
    },
    { status: 401 }
  );
}


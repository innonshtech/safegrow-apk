import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@safegrow/db';

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev');
    const { payload } = await jwtVerify(token, secret);
    
    if (payload && payload.id) {
      const user = await prisma.user.findUnique({
        where: { id: payload.id as string }
      });
      return user;
    }
  } catch (err) {
    console.error('Error verifying JWT for current admin:', err);
  }

  return null;
}

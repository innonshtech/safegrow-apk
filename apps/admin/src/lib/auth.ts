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

export function verifyAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    const { verify } = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev";
    return verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

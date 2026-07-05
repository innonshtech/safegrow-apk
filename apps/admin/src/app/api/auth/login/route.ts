import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginRequestSchema } from '@safegrow/shared';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request using shared DTO
    const validation = LoginRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }

    const { userId, password } = validation.data;

    // Fetch user from db
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Ensure account is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
    }

    // Sign JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role, userId: user.userId },
      process.env.JWT_SECRET || 'fallback-secret-for-dev',
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

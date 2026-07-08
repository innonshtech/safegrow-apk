"use server";

import { prisma } from '@safegrow/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  console.log('[ACTION] Checking DATABASE_URL:', process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    // Check if the input is an email or userId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { userId: email }
        ]
      }
    });

    if (!user) {
      return { error: 'Invalid credentials' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return { error: 'Invalid credentials' };
    }

    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      return { error: 'Access denied. Admins and Managers only.' };
    }

    if (user.status !== 'ACTIVE') {
      return { error: 'Account is inactive' };
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, userId: user.userId, name: user.name },
      process.env.JWT_SECRET || 'fallback-secret-for-dev',
      { expiresIn: '1d' }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });
    
  } catch (err) {
    console.error('Login action error:', err);
    return { error: 'Internal server error' };
  }
  
  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/login');
}

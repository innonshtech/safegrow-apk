'use server';

import { getCurrentAdmin } from '../../lib/auth';
import { prisma } from '@safegrow/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function updatePasswordAction(formData: FormData) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: 'Not authenticated' };

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' };
  }

  const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!isValid) {
    return { error: 'Current password is incorrect' };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: admin.id },
    data: { passwordHash }
  });

  return { success: true };
}

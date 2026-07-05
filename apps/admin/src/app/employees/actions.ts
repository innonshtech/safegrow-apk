'use server';
import { prisma } from '@safegrow/db';
import { revalidatePath } from 'next/cache';

export async function toggleEmployeeStatusAction(id: string, currentStatus: string) {
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  
  await prisma.user.update({
    where: { id },
    data: { status: newStatus as any }
  });

  revalidatePath('/employees');
}

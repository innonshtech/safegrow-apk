"use server";

import { prisma } from '@safegrow/db';
import bcrypt from 'bcryptjs';

export async function createEmployeeAction(formData: FormData) {
  const name = formData.get('name') as string;
  const role = formData.get('role') as 'MANAGER' | 'REP';
  const email = formData.get('email') as string;
  const userId = formData.get('userId') as string;
  const tempPassword = formData.get('tempPassword') as string;
  const phone = formData.get('phone') as string;
  const territory = formData.get('territory') as string;
  const employeeId = formData.get('employeeId') as string;
  const joiningDateStr = formData.get('joiningDate') as string;
  const managerId = formData.get('managerId') as string;

  if (!name || !userId || !tempPassword) {
    return { error: 'Missing required fields' };
  }

  try {
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email || undefined,
        userId,
        role,
        passwordHash,
        plainPassword: tempPassword,
        phone: phone || undefined,
        territory: territory || undefined,
        employeeId: employeeId || undefined,
        joiningDate: joiningDateStr ? new Date(joiningDateStr) : undefined,
        reportsToId: managerId && managerId !== 'none' ? managerId : undefined,
        status: 'ACTIVE'
      }
    });

    return { success: true, user: { id: user.id, userId: user.userId, name: user.name } };
  } catch (err: any) {
    console.error('Create Employee Error:', err);
    if (err.code === 'P2002') {
      return { error: 'User ID or Email already exists' };
    }
    return { error: 'Internal server error' };
  }
}

export async function getManagersAction() {
  try {
    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER' },
      select: { id: true, name: true }
    });
    return { success: true, managers };
  } catch (err) {
    console.error('Error fetching managers:', err);
    return { error: 'Failed to fetch managers' };
  }
}

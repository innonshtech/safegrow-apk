'use server';
import { prisma } from '@safegrow/db';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function updateEmployeeAction(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const territory = formData.get('territory') as string;
  const managerIdRaw = formData.get('managerId') as string;
  const newPassword = formData.get('newPassword') as string;
  
  const reportsToId = (managerIdRaw && managerIdRaw !== 'none') ? managerIdRaw : null;

  const dataToUpdate: any = { name, phone, email, territory, reportsToId };

  if (newPassword && newPassword.trim() !== '') {
    dataToUpdate.passwordHash = await bcrypt.hash(newPassword, 10);
    dataToUpdate.plainPassword = newPassword;
  }

  await prisma.user.update({
    where: { id },
    data: dataToUpdate
  });

  redirect(`/employees/${id}`);
}

export async function deactivateEmployeeAction(formData: FormData) {
  const id = formData.get('id') as string;
  const reassignToId = formData.get('reassignToId') as string;

  // If a reassignToId was provided, update all subordinates first
  if (reassignToId && reassignToId !== 'none') {
    await prisma.user.updateMany({
      where: { reportsToId: id },
      data: { reportsToId: reassignToId }
    });
  } else {
    // If no reassign, ensure they are removed from this manager
    await prisma.user.updateMany({
      where: { reportsToId: id },
      data: { reportsToId: null }
    });
  }

  // Deactivate the user
  await prisma.user.update({
    where: { id },
    data: { status: 'INACTIVE' }
  });

  redirect('/employees');
}

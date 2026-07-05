import { prisma } from './src/index';
import bcrypt from 'bcryptjs';

async function updatePassword() {
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.update({
    where: { userId: 'siya.goyal' },
    data: { passwordHash }
  });
  console.log("Password updated!");
}
updatePassword().then(() => process.exit(0));

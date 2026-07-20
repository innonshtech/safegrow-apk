import { prisma } from './src/index';
import bcrypt from 'bcryptjs';

async function updatePassword() {
  const passwordHash = await bcrypt.hash('safegrow@2026', 10);
  await prisma.user.update({
    where: { email: 'safegrowapp@gmail.com' },
    data: { passwordHash }
  });
  console.log("Password updated!");
}
updatePassword().then(() => process.exit(0));

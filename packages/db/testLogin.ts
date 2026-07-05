import { prisma } from './src/index';
import bcrypt from 'bcryptjs';

async function testLogin() {
  const userId = 'siya.goyal';
  const password = 'password123';
  
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { userId: userId },
        { email: userId }
      ]
    }
  });

  if (!user) {
    console.log("User not found!");
    return;
  }
  console.log("User found:", user.userId);

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    console.log("Password invalid!");
  } else {
    console.log("Password valid!");
  }
}

testLogin().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

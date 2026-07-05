import { prisma } from './src/index';

async function activateUser() {
  await prisma.user.update({
    where: { userId: 'siya.goyal' },
    data: { status: 'ACTIVE' }
  });
  console.log("User activated!");
}

activateUser().then(() => process.exit(0));

import { prisma } from './src/index';

async function getUsers() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    console.log(`userId: ${u.userId}, email: ${u.email}, name: ${u.name}, status: ${u.status}`);
  }
}

getUsers().then(() => process.exit(0));

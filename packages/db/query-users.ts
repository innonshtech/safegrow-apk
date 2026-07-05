import { prisma } from './src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany();
  console.log('All users in DB:');
  users.forEach(u => console.log(`Name: ${u.name}, ID: ${u.userId}, Role: ${u.role}`));
}

main().finally(() => prisma.$disconnect());

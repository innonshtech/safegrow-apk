import 'dotenv/config';
import { prisma } from '../src/index';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Start seeding...');
  
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { userId: 'ramesh.kale' },
    update: {},
    create: {
      userId: 'ramesh.kale',
      email: 'admin@safegrow.com',
      passwordHash,
      name: 'Ramesh Kale',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const rep = await prisma.user.upsert({
    where: { userId: 'siya.goyal' },
    update: {},
    create: {
      userId: 'siya.goyal',
      email: 'siya.goyal@safegrow.com',
      passwordHash,
      name: 'Siya Goyal',
      role: 'REP',
      status: 'ACTIVE',
    },
  });

  console.log(`Created admin user: ${admin.userId}`);
  console.log(`Created rep user: ${rep.userId}`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

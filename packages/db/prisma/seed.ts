import 'dotenv/config';
import { prisma } from '../src/index';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Start seeding...');
  
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@safegrow.com' },
    update: {
      name: 'System Admin' // Changed from Ramesh Kale to a generic name
    },
    create: {
      userId: 'admin',
      email: 'admin@safegrow.com',
      passwordHash,
      name: 'System Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(`Created master admin user: ${admin.email}`);
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

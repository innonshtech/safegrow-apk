const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.attendance.deleteMany().then(() => {
  console.log('Deleted all attendances');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});

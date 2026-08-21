const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const attendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: new Date("2026-07-26T18:30:00Z"),
        lt: new Date("2026-07-27T18:29:59Z")
      }
    }
  });
  console.log("Attendances for today:", attendances);
}
run().catch(console.error);

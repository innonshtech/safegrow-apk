const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year').value);
  const month = parseInt(parts.find(p => p.type === 'month').value) - 1;
  const day = parseInt(parts.find(p => p.type === 'day').value);
  
  const startOfDayUTC = new Date(Date.UTC(year, month, day, 0, 0, 0) - (5.5 * 60 * 60 * 1000));
  const endOfDayUTC = new Date(Date.UTC(year, month, day, 23, 59, 59, 999) - (5.5 * 60 * 60 * 1000));
  const targetDate = new Date(Date.UTC(year, month, day));
  
  console.log('TargetDate:', targetDate);
  const attendances = await prisma.attendance.findMany({ where: { date: targetDate } });
  console.log('Found attendances:', attendances.length);
  
  for(const att of attendances) {
    const checkIn = new Date(att.checkInTime);
    const expectedCheckInUTC = new Date(Date.UTC(year, month, day, 8, 0, 0) - (5.5 * 60 * 60 * 1000));
    const isLate = checkIn > expectedCheckInUTC;
    console.log('User:', att.userId, 'CheckIn:', checkIn, 'Expected:', expectedCheckInUTC, 'isLate:', isLate);
    
    const existingAlert = await prisma.fraudAlert.findFirst({
      where: {
        userId: att.userId,
        type: 'LATE_CHECK_IN',
        createdAt: { gte: startOfDayUTC, lt: endOfDayUTC }
      }
    });
    console.log('Existing Alert:', existingAlert);
  }
}

run().catch(console.error);

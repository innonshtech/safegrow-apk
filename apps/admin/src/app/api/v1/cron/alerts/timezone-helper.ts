export function getISTDayBoundaries() {
  const now = new Date();
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year')!.value);
  const month = parseInt(parts.find(p => p.type === 'month')!.value) - 1; // 0-indexed
  const day = parseInt(parts.find(p => p.type === 'day')!.value);

  // 00:00:00 IST is 18:30:00 UTC the previous day
  // Date.UTC gives UTC time, so we subtract 5.5 hours to get the exact UTC time that equals 00:00:00 IST
  const startOfDayUTC = new Date(Date.UTC(year, month, day, 0, 0, 0) - (5.5 * 60 * 60 * 1000));
  const endOfDayUTC = new Date(Date.UTC(year, month, day, 23, 59, 59, 999) - (5.5 * 60 * 60 * 1000));
  
  return { startOfDayUTC, endOfDayUTC, year, month, day };
}

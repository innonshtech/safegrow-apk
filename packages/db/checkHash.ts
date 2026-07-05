import { prisma } from './src/index';

async function main() {
  const user = await prisma.user.findUnique({ where: { userId: 'siya.goyal' } });
  console.log('Hash in DB:', user.passwordHash);
}
main().then(() => process.exit(0));

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function main() {
  try {
    const count = await prisma.user.count();
    console.log('Connected! User count:', count);
  } catch (e) {
    console.error('FULL ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();

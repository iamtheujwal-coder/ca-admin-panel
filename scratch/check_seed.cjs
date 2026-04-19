const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'demo@anand.com' } });
  console.log('Seeded User Check:', user ? 'FOUND' : 'NOT FOUND');
  process.exit(0);
}
main();

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing connection to Neon...');
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Connection successful:', result);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function dropTable() {
  try {
    // THIS IS HIGHLY DANGEROUS AND NOT RECOMMENDED FOR PRODUCTION SCHEMA MANAGEMENT
    // Always prefer Prisma Migrations for schema changes.
    await prisma.$executeRaw(Prisma.sql`DROP TABLE "User" CASCADE;`);
    console.log('Table "User" dropped successfully.');
  } catch (error) {
    console.error('Error dropping table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

dropTable();
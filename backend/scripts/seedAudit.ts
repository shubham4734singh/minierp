import prisma from '../src/utils/db';

async function seed() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.log("No admin found. Skip seeding audit.");
    return;
  }

  await prisma.auditLog.createMany({
    data: [
      {
        action: 'CREATE',
        entityType: 'PRODUCT',
        entityId: 'prod-001',
        userId: admin.id,
        details: 'Created product "Industrial Steel Pipe"'
      },
      {
        action: 'UPDATE',
        entityType: 'CUSTOMER',
        entityId: 'cust-042',
        userId: admin.id,
        details: 'Updated customer status to ACTIVE'
      },
      {
        action: 'DELETE',
        entityType: 'CHALLAN',
        entityId: 'chl-099',
        userId: admin.id,
        details: 'Cancelled challan due to incorrect pricing'
      },
      {
        action: 'LOGIN',
        entityType: 'USER',
        entityId: admin.id,
        userId: admin.id,
        details: 'User logged in successfully'
      },
      {
        action: 'UPDATE',
        entityType: 'PRODUCT',
        entityId: 'prod-002',
        userId: admin.id,
        details: 'Adjusted inventory level manually'
      }
    ]
  });

  console.log("Seeded 5 audit logs.");
}

seed().catch(console.error).finally(() => prisma.$disconnect());

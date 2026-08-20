const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding permissions...');
  
  const resources = ['vendor', 'ticket', 'schedule', 'staff', 'finance', 'festival', 'settings'];
  const actions = ['view', 'create', 'edit', 'delete', 'export'];
  
  let count = 0;
  for (const resource of resources) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: {
          resource_action: {
            resource,
            action
          }
        },
        update: {},
        create: {
          resource,
          action
        }
      });
      count++;
    }
  }
  
  console.log(`Seeded ${count} permissions successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

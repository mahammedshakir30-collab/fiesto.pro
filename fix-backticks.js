const fs = require('fs');
const files = [
  'src/lib/auth.ts',
  'src/actions/notifications.ts',
  'src/actions/roles.ts',
  'src/app/dashboard/[festivalId]/notifications/NotificationsClient.tsx',
  'src/app/dashboard/[festivalId]/settings/roles/RolesClient.tsx',
  'src/components/organizer/SetupChecklist.tsx',
  'src/components/organizer/RoleModal.tsx',
  'src/app/dashboard/[festivalId]/page.tsx'
];

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\\`/g, '`');
    content = content.replace(/\\\$/g, '$');
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  } catch (e) {
    console.log(`Could not process ${file}`);
  }
}

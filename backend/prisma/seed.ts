import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Ensure a default Permission Group exists for permissions
  const defaultGroup = await (prisma.permissionGroup as any).upsert({
    where: { name: 'System & Management' },
    update: {},
    create: { 
      name: 'System & Management', 
      description: 'Core system and administrative permissions' 
    },
  });

  // 2. Define all application permissions
  const permissionNames = [
    'dashboard:watch',
    'permission:create', 'permission:read', 'permission:update', 'permission:delete',
    'role:create', 'role:read', 'role:update', 'role:delete',
    'user:create', 'user:read', 'user:update', 'user:delete',
    'media:upload', 'media:read', 'media:write', 'media:delete',
    'category:create', 'category:read', 'category:update', 'category:delete',
    'brand:create', 'brand:read', 'brand:update', 'brand:delete',
    'attribute:create', 'attribute:read', 'attribute:update', 'attribute:delete',
    'product:create', 'product:read', 'product:update', 'product:delete',
  ];

  const createdPermissions: any[] = [];
  for (const name of permissionNames) {
    const permission = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { 
        name, 
        description: `Allows action: ${name}`,
        groupId: defaultGroup.id,
      } as any,
    });
    createdPermissions.push(permission);
  }
  console.log(`✅ Seeded ${createdPermissions.length} permissions.`);

  // 3. Hash passwords
  const superAdminPassword = await bcrypt.hash('SuperAdmin123!', 10);
  const catalogUserPassword = await bcrypt.hash('CatalogUser123!', 10);

  // 4. Create Super Administrator Role
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Administrator' },
    update: {},
    create: {
      name: 'Super Administrator',
      description: 'Full system access across all modules.',
    },
  });

  // Link all permissions to Super Admin role
  for (const p of createdPermissions) {
    await (prisma as any).rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: p.id,
      },
    }).catch(() => {});
  }
  console.log('✅ Seeded Super Administrator role & permissions.');

  // 5. Create Super Administrator User (Using passwordHash)
  await (prisma.user as any).upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      passwordHash: superAdminPassword,
      isActive: true,
      roleId: superAdminRole.id,
    },
  });
  console.log('✅ Seeded Super Administrator user.');

  // 6. Create Limited Catalog Role
  const catalogRole = await prisma.role.upsert({
    where: { name: 'Catalog Manager' },
    update: {},
    create: {
      name: 'Catalog Manager',
      description: 'Catalog and media access only. No user, role, or permission access.',
    },
  });

  const catalogPermissionNames = createdPermissions.filter((p) => 
    p.name.startsWith('product:') ||
    p.name.startsWith('category:') ||
    p.name.startsWith('brand:') ||
    p.name.startsWith('attribute:') ||
    p.name.startsWith('media:') ||
    p.name === 'dashboard:watch'
  );

  for (const p of catalogPermissionNames) {
    await (prisma as any).rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: catalogRole.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: catalogRole.id,
        permissionId: p.id,
      },
    }).catch(() => {});
  }
  console.log('✅ Seeded Catalog Manager role & permissions.');

  // 7. Create Limited User (Using passwordHash)
  await (prisma.user as any).upsert({
    where: { email: 'catalog@example.com' },
    update: {},
    create: {
      name: 'Catalog User',
      email: 'catalog@example.com',
      passwordHash: catalogUserPassword,
      isActive: true,
      roleId: catalogRole.id,
    },
  });
  console.log('✅ Seeded Limited Catalog user.');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
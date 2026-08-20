"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function getRoles(festivalId: string) {
  // Requires staff:view
  await requirePermission(festivalId, "staff", "view");

  return prisma.role.findMany({
    where: { festivalId },
    include: {
      permissions: true,
      _count: {
        select: { userRoles: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });
}

export async function getAllPermissions() {
  return prisma.permission.findMany({
    orderBy: [
      { resource: 'asc' },
      { action: 'asc' }
    ]
  });
}

export async function createRole(festivalId: string, data: { name: string; description?: string; panelType: any; permissionIds: string[] }) {
  await requirePermission(festivalId, "staff", "edit_roles");

  // Enforce name uniqueness
  const existing = await prisma.role.findUnique({
    where: { festivalId_name: { festivalId, name: data.name } }
  });
  if (existing) throw new Error("A role with this name already exists");

  if (data.permissionIds.length === 0) {
    throw new Error("At least one permission must be selected");
  }

  const role = await prisma.role.create({
    data: {
      festivalId,
      name: data.name,
      description: data.description,
      panelType: data.panelType,
      kind: "CUSTOM",
      permissions: {
        connect: data.permissionIds.map(id => ({ id }))
      }
    }
  });

  revalidatePath(`/organizer/${festivalId}/settings/roles`);
  return role;
}

export async function updateRole(festivalId: string, roleId: string, data: { name: string; description?: string; panelType: any; permissionIds: string[] }) {
  await requirePermission(festivalId, "staff", "edit_roles");

  const existingRole = await prisma.role.findUnique({ where: { id: roleId } });
  if (!existingRole || existingRole.festivalId !== festivalId) throw new Error("Role not found");
  
  if (existingRole.kind === "SYSTEM") {
    throw new Error("System roles cannot be edited");
  }

  // Enforce name uniqueness
  if (existingRole.name !== data.name) {
    const existingName = await prisma.role.findUnique({
      where: { festivalId_name: { festivalId, name: data.name } }
    });
    if (existingName) throw new Error("A role with this name already exists");
  }

  if (data.permissionIds.length === 0) {
    throw new Error("At least one permission must be selected");
  }

  const role = await prisma.role.update({
    where: { id: roleId },
    data: {
      name: data.name,
      description: data.description,
      panelType: data.panelType,
      permissions: {
        set: data.permissionIds.map(id => ({ id }))
      }
    }
  });

  revalidatePath(`/organizer/${festivalId}/settings/roles`);
  return role;
}

export async function deleteRole(festivalId: string, roleId: string) {
  await requirePermission(festivalId, "staff", "edit_roles");

  const existingRole = await prisma.role.findUnique({ 
    where: { id: roleId },
    include: { _count: { select: { userRoles: true } } }
  });
  
  if (!existingRole || existingRole.festivalId !== festivalId) throw new Error("Role not found");
  
  if (existingRole.kind === "SYSTEM") {
    throw new Error("System roles cannot be deleted");
  }

  if (existingRole._count.userRoles > 0) {
    throw new Error("Cannot delete a role that is assigned to users. Reassign them first.");
  }

  await prisma.role.delete({ where: { id: roleId } });
  
  revalidatePath(`/organizer/${festivalId}/settings/roles`);
  return { success: true };
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requirePermission(festivalId: string, resource: string, action: string) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  // Super admins bypass festival-level permission checks
  if (session.user.role === "SUPER_ADMIN") {
    return true;
  }

  const festivalPerms = (session.user as any).festivalPermissions?.[festivalId] || [];
  const permString = `${resource}:${action}`;
  
  if (!festivalPerms.includes(permString)) {
    throw new Error(`Forbidden: Missing permission ${permString} for festival ${festivalId}`);
  }

  return true;
}

export async function hasPermission(festivalId: string, resource: string, action: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session) return false;
  if (session.user.role === "SUPER_ADMIN") return true;

  const festivalPerms = (session.user as any).festivalPermissions?.[festivalId] || [];
  return festivalPerms.includes(`${resource}:${action}`);
}

import { getRoles, getAllPermissions } from "@/actions/roles";
import RolesClient from "./RolesClient";
import { notFound } from "next/navigation";

export default async function RolesPage({ params }: { params: { festivalId: string } }) {
  try {
    const [roles, permissions] = await Promise.all([
      getRoles(params.festivalId),
      getAllPermissions()
    ]);
    
    return (
      <div className="max-w-5xl">
        <RolesClient festivalId={params.festivalId} initialRoles={roles} allPermissions={permissions} />
      </div>
    );
  } catch (error: any) {
    if (error.message.includes("Forbidden")) {
      return (
        <div className="p-12 text-center text-muted-foreground">
          <h2 className="text-2xl font-bold mb-2 text-foreground">Access Denied</h2>
          <p>You do not have permission to view or manage roles.</p>
        </div>
      );
    }
    throw error;
  }
}

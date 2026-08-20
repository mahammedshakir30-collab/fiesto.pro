import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <ShieldAlert className="h-24 w-24 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter">Access Denied</h1>
        <p className="text-muted-foreground text-lg">
          You do not have permission to view this page. If you believe this is an error, please contact your administrator.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild variant="default">
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Switch Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

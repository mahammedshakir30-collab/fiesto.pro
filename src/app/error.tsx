"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold font-heading mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        We encountered an unexpected error while loading this page. Our team has been notified.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()} variant="outline">
          Reload Page
        </Button>
        <Button onClick={() => reset()} className="bg-[#504E76] hover:bg-[#504E76]/90 text-white">
          Try Again
        </Button>
      </div>
    </div>
  );
}

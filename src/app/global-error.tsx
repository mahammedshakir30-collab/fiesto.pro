"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
          <p className="text-gray-600 max-w-md">{error.message || "An unexpected error occurred."}</p>
          {error.digest && <p className="text-xs text-gray-400">Digest: {error.digest}</p>}
          <Button onClick={() => reset()} className="mt-4">
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}

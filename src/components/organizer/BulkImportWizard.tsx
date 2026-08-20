"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Download, UploadCloud, AlertCircle, CheckCircle2 } from "lucide-react";
import { ImportEntity } from "@prisma/client";
import { createImportJob, getImportJobStatus } from "@/actions/imports";
import { toast } from "sonner";
import Pusher from "pusher-js";

interface BulkImportWizardProps {
  festivalId: string;
  entity: ImportEntity;
  title: string;
  trigger?: React.ReactNode;
}

export function BulkImportWizard({ festivalId, entity, title, trigger }: BulkImportWizardProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState({ successCount: 0, errorCount: 0 });

  // Reset when opened
  useEffect(() => {
    if (open) {
      setStep(1);
      setFile(null);
      setJobId(null);
      setProgress(0);
      setResult({ successCount: 0, errorCount: 0 });
    }
  }, [open]);

  useEffect(() => {
    if (!jobId || !open) return;

    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      // Fallback polling if Pusher isn't configured
      const interval = setInterval(async () => {
        try {
          const { status, successCount, errorCount } = await getImportJobStatus(jobId);
          setProgress(p => Math.min(p + 15, 95)); // Simulate progress
          
          if (status === 'COMPLETED' || status === 'FAILED') {
            clearInterval(interval);
            setProgress(100);
            // Without Pusher we don't get exact success/error counts immediately, so we set -1 to hide the count
            setResult({ successCount: successCount ?? -1, errorCount: errorCount ?? -1 });
            setStep(3);
          }
        } catch (e) {
          console.error(e);
        }
      }, 1000);
      return () => clearInterval(interval);
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`festival-${festivalId}-imports`);

    channel.bind('job-progress', (data: any) => {
      if (data.jobId === jobId) {
        setProgress(data.progress);
        if (data.status === 'COMPLETED') {
          setResult({ successCount: data.successCount, errorCount: data.errorCount });
          setStep(3);
        }
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`festival-${festivalId}-imports`);
      pusher.disconnect();
    };
  }, [jobId, festivalId, open]);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const newJobId = await createImportJob(festivalId, entity, formData);
      setJobId(newJobId);
      setStep(2); // Processing
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline"><UploadCloud className="w-4 h-4 mr-2" /> Import</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {step === 1 && (
            <div className="space-y-4">
              <Label>Upload CSV or XLSX File</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <Input 
                  type="file" 
                  accept=".csv, .xlsx" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="max-w-xs mx-auto"
                />
                <p className="text-sm text-gray-500 mt-2">Maximum file size: 50MB</p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleUpload} disabled={!file || isUploading}>
                  {isUploading ? "Uploading..." : "Start Import"}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center">
              <div className="animate-pulse flex justify-center">
                <UploadCloud className="w-12 h-12 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Processing Import...</h3>
                <p className="text-sm text-gray-500">You can safely close this window. You'll be notified when it completes.</p>
              </div>
              
              <div className="space-y-2">
                <Progress value={progress} className="h-2 animate-pulse" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                {result.successCount === 0 && result.errorCount > 0 ? (
                  <AlertCircle className="w-16 h-16 text-destructive" />
                ) : result.successCount > 0 && result.errorCount > 0 ? (
                  <AlertCircle className="w-16 h-16 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-xl">
                  {result.successCount === 0 && result.errorCount > 0 
                    ? "Import Failed" 
                    : result.successCount > 0 && result.errorCount > 0 
                      ? "Import Completed with Errors" 
                      : "Import Complete"}
                </h3>
                {result.successCount >= 0 && (
                  <p className="text-sm mt-1">
                    {result.successCount === 0 && result.errorCount > 0 ? (
                      `0 of ${result.errorCount} rows were imported — see error log for details.`
                    ) : result.successCount > 0 && result.errorCount > 0 ? (
                      <span className="font-medium">${result.successCount} added &middot; ${result.errorCount} skipped</span>
                    ) : (
                      <span className="font-medium">${result.successCount} records added</span>
                    )}
                  </p>
                )}
                {result.successCount < 0 && (
                  <p className="text-sm mt-1">Import completed.</p>
                )}
              </div>
              
              <div className="flex flex-col space-y-2">
                {result.errorCount > 0 && (
                  <Button variant="outline" asChild className="w-full font-bold border-destructive text-destructive hover:bg-destructive/10">
                    <a href={`/api/imports/${jobId}/errors`} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download Error Log
                    </a>
                  </Button>
                )}
                <Button onClick={() => setOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React from 'react';

export function ImageCropper({ 
  open, 
  onOpenChange, 
  imageFile, 
  aspectRatio, 
  onCropComplete 
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File | null;
  aspectRatio: number;
  onCropComplete: (blob: Blob) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background p-6 rounded-xl border border-border text-center max-w-sm w-full space-y-4">
        <p className="text-sm font-medium">Image Cropper Placeholder</p>
        <p className="text-xs text-muted-foreground break-all">{imageFile ? `Selected: ${imageFile.name}` : 'No file selected'}</p>
        <div className="flex justify-end gap-2 mt-4">
          <button 
            className="px-4 py-2 border border-border rounded-md text-sm hover:bg-muted"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-[#504E76] text-white rounded-md text-sm hover:bg-[#504E76]/90"
            onClick={() => {
              // Create a dummy blob to simulate the cropped image
              const blob = new Blob(['dummy image data'], { type: 'image/jpeg' });
              onCropComplete(blob);
            }}
          >
            Simulate Crop & Upload
          </button>
        </div>
      </div>
    </div>
  );
}

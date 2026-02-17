import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Modal } from '@/components/features/Modal';
import { toast } from 'sonner';

interface UploadTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadTemplatesModal({ isOpen, onClose }: UploadTemplatesModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    toast.success('Template upload functionality will be implemented');
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Upload Templates"
      description="Upload custom Nuclei templates (.yaml, .yml)"
    >
      <div className="space-y-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 transition-colors hover:border-primary hover:bg-primary/5"
        >
          <Upload className="mb-3 size-12 text-muted-foreground" />
          <p className="text-sm font-medium">Click to browse or drag & drop</p>
          <p className="mt-1 text-xs text-muted-foreground">.yaml, .yml files only</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".yaml,.yml"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                toast.info(`${files.length} file(s) selected`);
              }
            }}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Upload
          </button>
        </div>
      </div>
    </Modal>
  );
}

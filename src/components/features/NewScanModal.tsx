import { useState } from 'react';
import { Modal } from '@/components/features/Modal';
import { useAppStore } from '@/stores/appStore';
import type { Scan } from '@/types';
import { toast } from 'sonner';

interface NewScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewScanModal({ isOpen, onClose }: NewScanModalProps) {
  const { addScan, templates } = useAppStore();
  const [scanName, setScanName] = useState('');

  const handleCreate = () => {
    if (!scanName.trim()) {
      toast.error('Please enter a scan name');
      return;
    }

    const newScan: Scan = {
      id: `scan-${Date.now()}`,
      name: scanName,
      description: '',
      status: 'queued',
      progress: 0,
      templatesProcessed: 0,
      templatesTotal: 100,
      targetsScanned: 0,
      targetsTotal: 5,
      currentTemplate: '',
      requestsPerSec: 0,
      findingsCount: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      totalFindings: 0,
      estimatedTimeRemaining: '~calculating',
      elapsedTime: '0s',
      cpuPercent: 0,
      memoryMB: 0,
      createdAt: new Date().toISOString(),
      config: {
        name: scanName,
        description: '',
        templateIds: [],
        targetListId: 'tl-001',
        concurrency: 25,
        rateLimit: 150,
        timeout: 10,
        retries: 1,
        minSeverity: 'info',
        includeRequestResponse: true,
        verboseMode: true,
        customFlags: '',
      },
    };

    addScan(newScan);
    toast.success(`Scan "${scanName}" created successfully`);
    setScanName('');
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Create New Scan"
      description="Configure a new security scan"
    >
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Scan Name</label>
          <input
            type="text"
            value={scanName}
            onChange={(e) => setScanName(e.target.value)}
            placeholder="e.g., WordPress Audit 2024"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            autoFocus
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
            onClick={handleCreate}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create Scan
          </button>
        </div>
      </div>
    </Modal>
  );
}

import { useState } from 'react';
import { RefreshCw, GitBranch } from 'lucide-react';
import { Modal } from '@/components/features/Modal';
import { toast } from 'sonner';

interface SyncOfficialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SyncOfficialModal({ isOpen, onClose }: SyncOfficialModalProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Templates synced successfully');
    setIsSyncing(false);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Sync Official Templates"
      description="Sync with projectdiscovery/nuclei-templates"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-4">
          <GitBranch className="size-5 text-muted-foreground" />
          <div className="flex-1">
            <div className="font-mono text-sm font-medium">projectdiscovery/nuclei-templates</div>
            <div className="font-mono text-xs text-muted-foreground">Branch: main · Last sync: Jul 14, 2024</div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isSyncing}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Start Sync'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

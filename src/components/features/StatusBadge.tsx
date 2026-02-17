import { SCAN_STATUS_CONFIG } from '@/constants/config';
import { cn } from '@/lib/utils';
import type { ScanStatus } from '@/types';

interface StatusBadgeProps {
  status: ScanStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = SCAN_STATUS_CONFIG[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-[10px] font-medium uppercase', config.bgClass, config.colorClass)}>
      {status === 'running' && (
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
      )}
      {config.label}
    </span>
  );
}

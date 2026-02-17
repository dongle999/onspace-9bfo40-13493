import { SEVERITY_CONFIG } from '@/constants/config';
import { cn } from '@/lib/utils';
import type { Severity } from '@/types';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export function SeverityBadge({ severity, size = 'sm', showDot = true }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono font-medium uppercase', config.bgClass, config.textClass, size === 'sm' ? 'text-[10px]' : 'text-xs')}>
      {showDot && <span className={cn('size-1.5 rounded-full', config.dotClass)} />}
      {config.label}
    </span>
  );
}

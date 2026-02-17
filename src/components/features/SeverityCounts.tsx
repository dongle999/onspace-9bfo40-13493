import { SEVERITY_CONFIG } from '@/constants/config';
import type { Severity } from '@/types';

interface SeverityCountsProps {
  counts: Record<Severity, number>;
  compact?: boolean;
}

export function SeverityCounts({ counts, compact }: SeverityCountsProps) {
  const severities: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 font-mono text-[10px]">
        {severities.map((s) => (
          <span key={s} className={`${SEVERITY_CONFIG[s].textClass}`}>
            {counts[s]}{s[0].toUpperCase()}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 font-mono text-[10px]">
      {severities.map((s) => (
        <div key={s} className="flex items-center gap-1">
          <span className={`size-1.5 rounded-full ${SEVERITY_CONFIG[s].dotClass}`} />
          <span className={SEVERITY_CONFIG[s].textClass}>{counts[s]}</span>
        </div>
      ))}
    </div>
  );
}

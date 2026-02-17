import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ progress, size = 'sm', showLabel = false, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  const heightClass = size === 'lg' ? 'h-3' : size === 'md' ? 'h-2' : 'h-1.5';

  return (
    <div className={cn('space-y-1', className)}>
      <div className={cn('w-full overflow-hidden rounded-full bg-muted', heightClass)}>
        <div
          className={cn('h-full rounded-full bg-primary transition-all', clamped > 0 && clamped < 100 && 'animate-pulse-glow')}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-right font-mono text-xs font-medium text-foreground">
          {Math.round(clamped)}%
        </div>
      )}
    </div>
  );
}

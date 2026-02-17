import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  accent?: boolean;
  className?: string;
}

export function StatsCard({ label, value, icon: Icon, trend, trendUp, accent, className }: StatsCardProps) {
  return (
    <div className={cn('group relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50', accent && 'border-primary/30 bg-primary/5', className)}>
      {accent && (
        <div className="absolute right-0 top-0 size-24 bg-primary/10 blur-3xl" />
      )}
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="font-mono text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <p className={cn('mt-1 font-mono text-xs', trendUp ? 'text-primary' : 'text-severity-critical')}>
              {trend}
            </p>
          )}
        </div>
        <div className={cn('rounded-md p-2', accent ? 'bg-primary/15' : 'bg-muted')}>
          <Icon className={cn('size-5', accent ? 'text-primary' : 'text-muted-foreground')} />
        </div>
      </div>
    </div>
  );
}

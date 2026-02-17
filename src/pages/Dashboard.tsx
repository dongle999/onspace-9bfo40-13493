import { FileCode2, Radar, ShieldAlert, Target, Activity } from 'lucide-react';
import { StatsCard } from '@/components/features/StatsCard';
import { MOCK_DASHBOARD_STATS } from '@/constants/mockData';

export default function Dashboard() {
  const stats = MOCK_DASHBOARD_STATS;

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Nuclei Command Center</h1>
        <p className="mt-2 text-muted-foreground">
          {stats.totalTemplates.toLocaleString()} templates loaded · {stats.activeScans} active scan
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Templates"
          value={stats.totalTemplates}
          icon={FileCode2}
          accent
        />
        <StatsCard
          label="Active Scans"
          value={stats.activeScans}
          icon={Radar}
        />
        <StatsCard
          label="Total Findings"
          value={stats.totalFindings}
          icon={ShieldAlert}
        />
        <StatsCard
          label="Targets Scanned"
          value={stats.targetsScanned}
          icon={Target}
        />
      </div>

      {/* Template Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Template Sources</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Official</span>
              </div>
              <span className="font-mono text-lg font-bold">{stats.officialTemplates}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-severity-medium" />
                <span className="text-sm text-muted-foreground">Custom</span>
              </div>
              <span className="font-mono text-lg font-bold">{stats.customTemplates}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Findings by Severity</h3>
          <div className="space-y-2">
            {Object.entries(stats.findingsBySeverity).map(([severity, count]) => (
              <div key={severity} className="flex items-center justify-between text-sm">
                <span className="capitalize text-muted-foreground">{severity}</span>
                <span className="font-mono font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        <div className="space-y-3">
          {stats.recentActivity.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <Activity className="size-5 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-foreground">{item.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

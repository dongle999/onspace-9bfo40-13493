import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Pause,
  Play,
  Square,
  RotateCcw,
  Download,
  ChevronRight,
  Timer,
  Cpu,
  MemoryStick,
  Zap,
  Crosshair,
  FileCode2,
  Trash2,
  CheckSquare,
  Square as SquareIcon,
} from 'lucide-react';
import { StatusBadge } from '@/components/features/StatusBadge';
import { ProgressBar } from '@/components/features/ProgressBar';
import { SeverityCounts } from '@/components/features/SeverityCounts';
import { NewScanModal } from '@/components/features/NewScanModal';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { formatDateTime, timeAgo } from '@/lib/helpers';
import { SEVERITY_CONFIG } from '@/constants/config';
import type { ScanStatus, Severity } from '@/types';
import { exportScansToExcel } from '@/lib/export';
import { toast } from 'sonner';

const TEMPLATE_NAMES = [
  'CVE-2024-3400', 'CVE-2024-21762', 'CVE-2023-46805', 'CVE-2023-44228',
  'CVE-2023-42793', 'CVE-2023-34362', 'CVE-2023-27997', 'CVE-2023-23397',
  'CVE-2023-20198', 'CVE-2022-40684', 'CVE-2022-26134', 'CVE-2021-44228',
  'exposed-env', 'subdomain-takeover', 'cors-misconfig', 'open-redirect',
  'git-config', 'nginx-version', 'wordpress-login', 'default-admin-creds',
  'ssl-cert-expiry', 'dns-zone-transfer', 'crlf-injection', 'apache-server-status',
];

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export default function Scans() {
  const { 
    scans, 
    selectedScanId, 
    setSelectedScanId, 
    updateScan, 
    pauseScan, 
    resumeScan, 
    stopScan, 
    restartScan,
    deleteScans,
  } = useAppStore();
  
  const elapsedRef = useRef<Map<string, number>>(new Map());
  const [showNewScanModal, setShowNewScanModal] = useState(false);
  const [selectedScans, setSelectedScans] = useState<Set<string>>(new Set());

  // Real-time scan simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const runningScans = scans.filter((s) => s.status === 'running');
      if (runningScans.length === 0) return;

      runningScans.forEach((scan) => {
        const prevElapsed = elapsedRef.current.get(scan.id) ?? Math.floor(Math.random() * 600 + 300);
        const newElapsed = prevElapsed + 1;
        elapsedRef.current.set(scan.id, newElapsed);

        const newProgress = Math.min(scan.progress + 0.5, 100);
        const progressRatio = newProgress / 100;
        const newTemplatesProcessed = Math.min(
          Math.round(scan.templatesTotal * progressRatio),
          scan.templatesTotal
        );
        const newTargetsScanned = Math.min(
          Math.max(scan.targetsScanned, Math.round(scan.targetsTotal * progressRatio)),
          scan.targetsTotal
        );

        const shouldAddFinding = Math.random() < 0.35;
        const newFindings = { ...scan.findingsCount };
        if (shouldAddFinding) {
          const roll = Math.random();
          if (roll < 0.03) newFindings.critical += 1;
          else if (roll < 0.12) newFindings.high += 1;
          else if (roll < 0.3) newFindings.medium += 1;
          else if (roll < 0.55) newFindings.low += 1;
          else newFindings.info += Math.floor(Math.random() * 3) + 1;
        }
        const newTotalFindings =
          newFindings.critical + newFindings.high + newFindings.medium + newFindings.low + newFindings.info;

        const baseRate = scan.config.rateLimit || 150;
        const newReqPerSec = Math.max(
          20,
          Math.round(baseRate * (0.7 + Math.random() * 0.5))
        );

        const changeTemplate = Math.random() < 0.15;
        const newCurrentTemplate = changeTemplate
          ? TEMPLATE_NAMES[Math.floor(Math.random() * TEMPLATE_NAMES.length)]
          : scan.currentTemplate;

        const remainingPct = 100 - newProgress;
        const estSeconds = remainingPct > 0 ? Math.round((remainingPct / 0.5)) : 0;
        const estMin = Math.floor(estSeconds / 60);
        const estSec = estSeconds % 60;
        const estimatedTimeRemaining = newProgress >= 100 ? '0s' : `${estMin}m ${String(estSec).padStart(2, '0')}s`;

        const newCpu = Math.min(99, Math.max(30, scan.cpuPercent + Math.round((Math.random() - 0.5) * 8)));
        const newMem = Math.max(1200, scan.memoryMB + Math.round((Math.random() - 0.5) * 100));

        const isComplete = newProgress >= 100;

        updateScan(scan.id, {
          progress: isComplete ? 100 : newProgress,
          templatesProcessed: isComplete ? scan.templatesTotal : newTemplatesProcessed,
          targetsScanned: isComplete ? scan.targetsTotal : newTargetsScanned,
          findingsCount: newFindings,
          totalFindings: newTotalFindings,
          requestsPerSec: isComplete ? 0 : newReqPerSec,
          currentTemplate: isComplete ? '' : newCurrentTemplate,
          estimatedTimeRemaining,
          elapsedTime: formatElapsed(newElapsed),
          cpuPercent: isComplete ? 0 : newCpu,
          memoryMB: isComplete ? 0 : newMem,
          status: isComplete ? 'completed' : 'running',
          completedAt: isComplete ? new Date().toISOString() : undefined,
        });

        if (isComplete) {
          const queued = scans.find((s) => s.status === 'queued');
          if (queued) {
            elapsedRef.current.set(queued.id, 0);
            updateScan(queued.id, {
              status: 'running',
              startedAt: new Date().toISOString(),
              requestsPerSec: Math.round((queued.config.rateLimit || 150) * 0.8),
              cpuPercent: 45,
              memoryMB: 1800,
            });
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [scans, updateScan]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ScanStatus | ''>('');

  const filtered = useMemo(() => {
    return scans.filter((s) => {
      if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      if (statusFilter && s.status !== statusFilter) return false;
      return true;
    });
  }, [scans, searchQuery, statusFilter]);

  const activeScan = scans.find((s) => s.status === 'running');
  const selectedScan = selectedScanId
    ? scans.find((s) => s.id === selectedScanId)
    : activeScan;

  const toggleSelectScan = (scanId: string) => {
    setSelectedScans((prev) => {
      const next = new Set(prev);
      if (next.has(scanId)) next.delete(scanId);
      else next.add(scanId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedScans.size === filtered.length) {
      setSelectedScans(new Set());
    } else {
      setSelectedScans(new Set(filtered.map((s) => s.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedScans.size === 0) {
      toast.error('No scans selected');
      return;
    }

    // Check if any running scans are selected
    const hasRunningScans = Array.from(selectedScans).some(
      (id) => scans.find((s) => s.id === id)?.status === 'running'
    );

    if (hasRunningScans && !confirm('Some selected scans are running. Stop and delete them?')) {
      return;
    }

    if (confirm(`Delete ${selectedScans.size} selected scan(s)?`)) {
      deleteScans(Array.from(selectedScans));
      setSelectedScans(new Set());
    }
  };

  const handleExportScans = () => {
    const dataToExport = selectedScans.size > 0 
      ? filtered.filter((s) => selectedScans.has(s.id))
      : filtered;

    if (dataToExport.length === 0) {
      toast.error('No scans to export');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    exportScansToExcel(dataToExport, `nuclei-scans-${timestamp}.xlsx`);
    toast.success(`Exported ${dataToExport.length} scan(s) to Excel`);
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <Crosshair className="size-7 text-primary" />
            Scans
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {scans.length} total · {scans.filter((s) => s.status === 'running').length} running ·{' '}
            {scans.filter((s) => s.status === 'queued').length} queued
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedScans.size > 0 && (
            <>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
              >
                <Trash2 className="size-4" />
                Delete ({selectedScans.size})
              </button>
              <button
                onClick={handleExportScans}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <Download className="size-4" />
                Export
              </button>
            </>
          )}

          <button
            onClick={() => setShowNewScanModal(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            New Scan
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Scan List */}
        <div className="flex w-[400px] flex-col gap-3">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search scans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ScanStatus | '')}
              className="rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="running">Running</option>
              <option value="queued">Queued</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="stopped">Stopped</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {/* Select All */}
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            {selectedScans.size === filtered.length ? (
              <CheckSquare className="size-4" />
            ) : (
              <SquareIcon className="size-4" />
            )}
            {selectedScans.size > 0 ? `${selectedScans.size} selected` : 'Select all'}
          </button>

          {/* Scan Items */}
          <div className="flex-1 space-y-2 overflow-auto">
            {filtered.map((scan) => (
              <div
                key={scan.id}
                className={cn(
                  'rounded-md border transition-colors',
                  selectedScan?.id === scan.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-muted/20',
                  selectedScans.has(scan.id) && 'ring-2 ring-primary/30'
                )}
              >
                <div className="flex items-center gap-2 px-3 py-2">
                  <button
                    onClick={() => toggleSelectScan(scan.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {selectedScans.has(scan.id) ? (
                      <CheckSquare className="size-4 text-primary" />
                    ) : (
                      <SquareIcon className="size-4" />
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedScanId(scan.id)}
                    className="flex flex-1 flex-col text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-medium text-foreground">
                        {scan.name}
                      </span>
                      <StatusBadge status={scan.status} />
                    </div>

                    {scan.status === 'running' && (
                      <div className="mt-1.5">
                        <ProgressBar progress={scan.progress} />
                      </div>
                    )}

                    <div className="mt-1.5 flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileCode2 className="size-3" />
                        {scan.templatesTotal.toLocaleString()} templates
                      </span>
                      <span className="flex items-center gap-1">
                        <Crosshair className="size-3" />
                        {scan.targetsTotal} targets
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="size-3" />
                        {scan.elapsedTime}
                      </span>
                    </div>

                    {scan.totalFindings > 0 && (
                      <div className="mt-1.5">
                        <SeverityCounts counts={scan.findingsCount} />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scan Detail Panel */}
        <div className="flex-1 overflow-auto rounded-md border border-border bg-card">
          {selectedScan ? (
            <ScanDetailPanel scan={selectedScan} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <Crosshair className="mb-4 size-16 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">
                Select a scan to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Scan Modal */}
      <NewScanModal isOpen={showNewScanModal} onClose={() => setShowNewScanModal(false)} />
    </div>
  );
}

function ScanDetailPanel({ scan }: { scan: import('@/types').Scan }) {
  const { pauseScan, resumeScan, stopScan, restartScan } = useAppStore();

  return (
    <div className="flex h-full flex-col">
      {/* Detail Header */}
      <div className="border-b border-border p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">{scan.name}</h2>
              <StatusBadge status={scan.status} />
            </div>

            {scan.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {scan.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {scan.status === 'running' && (
              <>
                <button
                  onClick={() => pauseScan(scan.id)}
                  className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  title="Pause scan"
                >
                  <Pause className="size-4" />
                  Pause
                </button>
                <button
                  onClick={() => stopScan(scan.id)}
                  className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                  title="Stop scan"
                >
                  <Square className="size-4" />
                  Stop
                </button>
              </>
            )}
            {scan.status === 'paused' && (
              <>
                <button
                  onClick={() => resumeScan(scan.id)}
                  className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  title="Resume scan"
                >
                  <Play className="size-4" />
                  Resume
                </button>
                <button
                  onClick={() => stopScan(scan.id)}
                  className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                  title="Stop scan"
                >
                  <Square className="size-4" />
                  Stop
                </button>
              </>
            )}
            {(scan.status === 'completed' || scan.status === 'failed' || scan.status === 'stopped') && (
              <>
                <button
                  onClick={() => restartScan(scan.id)}
                  className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  title="Restart scan"
                >
                  <RotateCcw className="size-4" />
                  Restart
                </button>
                <button
                  className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  title="Export results"
                >
                  <Download className="size-4" />
                  Export
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress (if running) */}
        {scan.status === 'running' && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between font-mono text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-bold text-primary">{scan.progress.toFixed(1)}%</span>
            </div>
            <ProgressBar progress={scan.progress} />

            {scan.currentTemplate && (
              <div className="mt-3 flex items-center gap-2 rounded bg-muted/50 p-2">
                <div className="size-1.5 animate-pulse rounded-full bg-primary" />
                <span className="font-mono text-xs text-muted-foreground">
                  Current:{' '}
                  <span className="font-medium text-foreground">{scan.currentTemplate}</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 border-b border-border p-6 lg:grid-cols-4">
        <MetricBox icon={Timer} label="Elapsed" value={scan.elapsedTime} />
        <MetricBox icon={Zap} label="Total Findings" value={scan.totalFindings.toLocaleString()} />
        {scan.status === 'running' && (
          <>
            <MetricBox icon={Cpu} label="CPU" value={`${scan.cpuPercent}%`} />
            <MetricBox icon={MemoryStick} label="Memory" value={`${(scan.memoryMB / 1024).toFixed(1)} GB`} />
          </>
        )}
        {scan.status !== 'running' && (
          <>
            <MetricBox icon={FileCode2} label="Templates" value={scan.templatesTotal.toLocaleString()} />
            <MetricBox icon={Crosshair} label="Targets" value={scan.targetsTotal.toString()} />
          </>
        )}
      </div>

      {/* Findings Breakdown */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Findings by Severity</h3>
        </div>
        <div className="space-y-3">
          {(['critical', 'high', 'medium', 'low', 'info'] as Severity[]).map((s) => {
            const count = scan.findingsCount[s];
            const total = scan.totalFindings || 1;
            const pct = (count / total) * 100;
            return (
              <div key={s} className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="capitalize text-foreground">{SEVERITY_CONFIG[s].label}</span>
                  <span className="font-bold text-foreground">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full transition-all', SEVERITY_CONFIG[s].bgBar)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Scan Config */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Configuration</h3>
          <div className="space-y-2 rounded-md border border-border bg-muted/20 p-4">
            <ConfigItem label="Concurrency" value={scan.config.concurrency.toString()} />
            <ConfigItem label="Rate Limit" value={`${scan.config.rateLimit} req/s`} />
            <ConfigItem label="Timeout" value={`${scan.config.timeout}s`} />
            <ConfigItem label="Min Severity" value={scan.config.minSeverity} />

            {scan.config.customFlags && (
              <div className="mt-3 border-t border-border pt-2">
                <ConfigItem label="Custom Flags" value={scan.config.customFlags} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-muted/30 p-3">
      <Icon className="size-5 text-primary" />
      <div>
        <div className="font-mono text-xs text-muted-foreground">{label}</div>
        <div className="font-mono text-sm font-bold text-foreground">{value}</div>
      </div>
    </div>
  );
}

function ConfigItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between font-mono text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

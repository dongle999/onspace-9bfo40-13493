import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Flag,
  StickyNote,
  Download,
  X,
  ShieldAlert,
  Globe,
  FileCode2,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { SeverityBadge } from '@/components/features/SeverityBadge';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/helpers';
import { MOCK_SCANS } from '@/constants/mockData';
import type { Severity, Finding } from '@/types';
import {
  exportFindingsToCSV,
  exportFindingsToJSON,
  exportFindingsToExcel,
  exportFindingsToPDF,
} from '@/lib/export';
import { toast } from 'sonner';

type GroupBy = 'severity' | 'target' | 'template';

export default function Results() {
  const { findings, toggleFalsePositive, deleteFindings } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | ''>('');
  const [selectedScanId, setSelectedScanId] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('severity');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFindings, setSelectedFindings] = useState<Set<string>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);

  const realFindings = findings.filter((f) => !f.isFalsePositive);

  const filtered = useMemo(() => {
    return findings.filter((f) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !f.templateName.toLowerCase().includes(q) &&
          !f.target.toLowerCase().includes(q) &&
          !f.description.toLowerCase().includes(q) &&
          !f.templateId.toLowerCase().includes(q)
        )
          return false;
      }
      if (selectedSeverity && f.severity !== selectedSeverity) return false;
      if (selectedScanId && f.scanId !== selectedScanId) return false;
      return true;
    });
  }, [findings, searchQuery, selectedSeverity, selectedScanId]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Finding[]>();

    filtered.forEach((f) => {
      let key = '';
      if (groupBy === 'severity') key = f.severity;
      else if (groupBy === 'target') key = f.target;
      else key = f.templateName;

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(f);
    });

    // Sort groups
    if (groupBy === 'severity') {
      const order: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
      const sorted = new Map<string, Finding[]>();
      order.forEach((s) => {
        if (groups.has(s)) sorted.set(s, groups.get(s)!);
      });
      return sorted;
    }

    return groups;
  }, [filtered, groupBy]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const severityCounts = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    filtered.forEach((f) => {
      counts[f.severity]++;
    });
    return counts;
  }, [filtered]);

  const toggleSelectFinding = (findingId: string) => {
    setSelectedFindings((prev) => {
      const next = new Set(prev);
      if (next.has(findingId)) next.delete(findingId);
      else next.add(findingId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFindings.size === filtered.length) {
      setSelectedFindings(new Set());
    } else {
      setSelectedFindings(new Set(filtered.map((f) => f.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedFindings.size === 0) {
      toast.error('No findings selected');
      return;
    }

    if (confirm(`Delete ${selectedFindings.size} selected finding(s)?`)) {
      deleteFindings(Array.from(selectedFindings));
      setSelectedFindings(new Set());
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'excel' | 'pdf') => {
    const dataToExport = selectedFindings.size > 0 
      ? filtered.filter((f) => selectedFindings.has(f.id))
      : filtered;

    if (dataToExport.length === 0) {
      toast.error('No findings to export');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const baseFilename = `nuclei-findings-${timestamp}`;

    switch (format) {
      case 'csv':
        exportFindingsToCSV(dataToExport, `${baseFilename}.csv`);
        break;
      case 'json':
        exportFindingsToJSON(dataToExport, `${baseFilename}.json`);
        break;
      case 'excel':
        exportFindingsToExcel(dataToExport, `${baseFilename}.xlsx`);
        break;
      case 'pdf':
        exportFindingsToPDF(dataToExport, `${baseFilename}.pdf`);
        break;
    }

    toast.success(`Exported ${dataToExport.length} finding(s) to ${format.toUpperCase()}`);
    setShowExportMenu(false);
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <ShieldAlert className="size-7 text-primary" />
            Results
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {filtered.length} findings across {MOCK_SCANS.length} scans
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedFindings.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
            >
              <Trash2 className="size-4" />
              Delete ({selectedFindings.size})
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Download className="size-4" />
              Export
              {selectedFindings.size > 0 && ` (${selectedFindings.size})`}
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-border bg-card shadow-lg">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent"
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Severity Summary Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          title={selectedFindings.size === filtered.length ? 'Deselect all' : 'Select all'}
        >
          {selectedFindings.size === filtered.length ? (
            <CheckSquare className="size-4" />
          ) : (
            <Square className="size-4" />
          )}
          {selectedFindings.size > 0 ? `${selectedFindings.size} selected` : 'Select all'}
        </button>

        {(['critical', 'high', 'medium', 'low', 'info'] as Severity[]).map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSeverity(selectedSeverity === s ? '' : s)}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 font-mono text-xs transition-colors',
              selectedSeverity === s
                ? SEVERITY_BG[s] + ' ' + SEVERITY_TEXT[s]
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <SeverityBadge severity={s} />
            {s} <span className="font-bold">{severityCounts[s]}</span>
          </button>
        ))}
      </div>

      {/* Search & Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by template, target, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={selectedScanId}
          onChange={(e) => setSelectedScanId(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
        >
          <option value="">All Scans</option>
          {MOCK_SCANS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">Group:</span>
          {(['severity', 'target', 'template'] as GroupBy[]).map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={cn(
                'rounded px-2 py-1 font-mono text-[10px] capitalize transition-colors',
                groupBy === g
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-auto rounded-md border border-border">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ShieldAlert className="mb-4 size-12 text-muted-foreground/50" />
            <p className="mb-1 text-lg font-medium text-foreground">No findings match</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {Array.from(grouped.entries()).map(([groupKey, items]) => (
              <div key={groupKey} className="bg-card">
                {/* Group Header */}
                <div className="flex items-center gap-3 bg-muted/50 px-4 py-2">
                  {groupBy === 'severity' && (
                    <SeverityBadge severity={groupKey as Severity} />
                  )}
                  {groupBy === 'target' && (
                    <div className="flex items-center gap-2">
                      <Globe className="size-4 text-muted-foreground" />
                      <span className="font-mono text-sm text-foreground">
                        {groupKey}
                      </span>
                    </div>
                  )}
                  {groupBy === 'template' && (
                    <div className="flex items-center gap-2">
                      <FileCode2 className="size-4 text-muted-foreground" />
                      <span className="font-mono text-sm text-foreground">
                        {groupKey}
                      </span>
                    </div>
                  )}
                  <span className="font-mono text-xs text-muted-foreground">
                    {items.length} finding{items.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Findings */}
                <div className="divide-y divide-border/50">
                  {items.map((finding) => (
                    <FindingRow
                      key={finding.id}
                      finding={finding}
                      expanded={expandedIds.has(finding.id)}
                      selected={selectedFindings.has(finding.id)}
                      onToggle={() => toggleExpand(finding.id)}
                      onToggleFP={() => toggleFalsePositive(finding.id)}
                      onToggleSelect={() => toggleSelectFinding(finding.id)}
                      groupBy={groupBy}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FindingRow({
  finding,
  expanded,
  selected,
  onToggle,
  onToggleFP,
  onToggleSelect,
  groupBy,
}: {
  finding: Finding;
  expanded: boolean;
  selected: boolean;
  onToggle: () => void;
  onToggleFP: () => void;
  onToggleSelect: () => void;
  groupBy: GroupBy;
}) {
  return (
    <div className={cn('bg-card', selected && 'bg-primary/5')}>
      <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30">
        <button
          onClick={onToggleSelect}
          className="text-muted-foreground hover:text-foreground"
        >
          {selected ? (
            <CheckSquare className="size-4 text-primary" />
          ) : (
            <Square className="size-4" />
          )}
        </button>

        <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
          {expanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>

        {groupBy !== 'severity' && (
          <SeverityBadge severity={finding.severity} />
        )}

        <div className="flex-1">
          <div className="font-mono text-sm font-medium text-foreground">
            {groupBy === 'template' ? finding.target : finding.templateName}
          </div>
          <div className="mt-0.5 font-mono text-xs text-muted-foreground">
            {groupBy === 'target' ? finding.templateName : finding.target}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {formatDateTime(finding.matchedAt)}
          </span>
          {finding.isFalsePositive && (
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-500">
              FP
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/50 bg-muted/20 px-4 py-4">
          {/* Description */}
          <p className="mb-4 text-sm text-foreground">{finding.description}</p>

          {/* Metadata */}
          <div className="mb-4 flex flex-wrap gap-4 text-xs">
            {finding.cvss !== undefined && finding.cvss > 0 && (
              <DetailItem label="CVSS" value={finding.cvss.toString()} />
            )}
            {finding.cwe && <DetailItem label="CWE" value={finding.cwe} />}
            <DetailItem
              label="Scan"
              value={
                MOCK_SCANS.find((s) => s.id === finding.scanId)?.name || finding.scanId
              }
            />
          </div>

          {/* Request/Response */}
          {finding.request && (
            <div className="mb-3">
              <div className="mb-1 font-mono text-xs font-medium text-muted-foreground">
                Request
              </div>
              <pre className="overflow-auto rounded bg-background p-2 font-mono text-[10px] leading-relaxed text-foreground">
                {finding.request}
              </pre>
            </div>
          )}
          {finding.response && (
            <div className="mb-3">
              <div className="mb-1 font-mono text-xs font-medium text-muted-foreground">
                Response
              </div>
              <pre className="max-h-32 overflow-auto rounded bg-background p-2 font-mono text-[10px] leading-relaxed text-foreground">
                {finding.response}
              </pre>
            </div>
          )}

          {/* Matcher */}
          {finding.matcherDetails && (
            <div className="mb-3">
              <div className="mb-1 font-mono text-xs font-medium text-muted-foreground">
                Matcher Details
              </div>
              <pre className="overflow-auto rounded bg-background p-2 font-mono text-[10px] text-foreground">
                {finding.matcherDetails}
              </pre>
            </div>
          )}

          {/* Notes */}
          {finding.notes && (
            <div className="mb-3 rounded bg-amber-500/10 p-2">
              <div className="mb-1 flex items-center gap-2 font-mono text-xs font-medium text-amber-600">
                <StickyNote className="size-3" />
                Note
              </div>
              <p className="text-xs text-foreground">{finding.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleFP}
              className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 font-mono text-xs transition-colors hover:bg-accent"
            >
              <Flag className="size-3" />
              {finding.isFalsePositive ? 'Marked as FP' : 'Mark False Positive'}
            </button>
            {finding.references && finding.references.length > 0 && (
              <a
                href={finding.references[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 font-mono text-xs transition-colors hover:bg-accent"
              >
                <ExternalLink className="size-3" />
                Reference
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span>{' '}
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

const SEVERITY_BG: Record<Severity, string> = {
  critical: 'bg-severity-critical/15',
  high: 'bg-severity-high/15',
  medium: 'bg-severity-medium/15',
  low: 'bg-severity-low/15',
  info: 'bg-severity-info/15',
};
const SEVERITY_TEXT: Record<Severity, string> = {
  critical: 'text-severity-critical',
  high: 'text-severity-high',
  medium: 'text-severity-medium',
  low: 'text-severity-low',
  info: 'text-severity-info',
};
const SEVERITY_DOT: Record<Severity, string> = {
  critical: 'bg-severity-critical',
  high: 'bg-severity-high',
  medium: 'bg-severity-medium',
  low: 'bg-severity-low',
  info: 'bg-severity-info',
};

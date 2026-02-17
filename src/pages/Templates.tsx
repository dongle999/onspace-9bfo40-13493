import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  FileCode2,
  ExternalLink,
  RefreshCw,
  Upload,
  ChevronDown,
  X,
  GitBranch,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { SeverityBadge } from '@/components/features/SeverityBadge';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/helpers';
import { UploadTemplatesModal } from '@/components/features/UploadTemplatesModal';
import { SyncOfficialModal } from '@/components/features/SyncOfficialModal';
import type { Severity, Protocol, TemplateSource, TemplateStatus } from '@/types';
import { toast } from 'sonner';

type ViewMode = 'list' | 'grid';

export default function Templates() {
  const { templates, validateTemplate } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSeverities, setSelectedSeverities] = useState<Severity[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | ''>('');
  const [selectedSource, setSelectedSource] = useState<TemplateSource | ''>('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [validatingTemplates, setValidatingTemplates] = useState<Set<string>>(new Set());

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Calculate official vs custom/unofficial counts
  const templateStats = useMemo(() => {
    const official = templates.filter((t) => t.source === 'official').length;
    const custom = templates.filter((t) => t.source === 'custom').length;
    return { official, custom, total: templates.length };
  }, [templates]);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.templateId.toLowerCase().includes(q) &&
          !t.description.toLowerCase().includes(q) &&
          !t.tags.some((tag) => tag.includes(q))
        )
          return false;
      }
      if (selectedSeverities.length > 0 && !selectedSeverities.includes(t.severity))
        return false;
      if (selectedProtocol && t.protocol !== selectedProtocol) return false;
      if (selectedSource && t.source !== selectedSource) return false;
      if (selectedTag && !t.tags.includes(selectedTag)) return false;
      return true;
    });
  }, [templates, searchQuery, selectedSeverities, selectedProtocol, selectedSource, selectedTag]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    templates.forEach((t) => t.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [templates]);

  const activeFilterCount = [
    selectedSeverities.length > 0,
    selectedProtocol !== '',
    selectedSource !== '',
    selectedTag !== '',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedSeverities([]);
    setSelectedProtocol('');
    setSelectedSource('');
    setSelectedTag('');
  };

  const toggleSeverity = (s: Severity) => {
    setSelectedSeverities((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleValidateTemplate = async (templateId: string) => {
    console.log('Starting validation for template:', templateId);
    setValidatingTemplates((prev) => new Set(prev).add(templateId));

    try {
      const isValid = await validateTemplate(templateId);
      
      if (isValid) {
        toast.success('Template validated successfully');
      } else {
        toast.error('Template validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Template validation error');
    } finally {
      setValidatingTemplates((prev) => {
        const next = new Set(prev);
        next.delete(templateId);
        return next;
      });
    }
  };

  const handleValidateCustomTemplates = async () => {
    const customTemplates = templates.filter((t) => t.source === 'custom' && t.status !== 'validating');
    
    if (customTemplates.length === 0) {
      toast.info('No custom templates to validate');
      return;
    }

    toast.info(`Validating ${customTemplates.length} custom templates...`);
    
    for (const template of customTemplates) {
      await handleValidateTemplate(template.id);
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold">
              <FileCode2 className="size-7 text-primary" />
              Templates
            </h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {templates.length.toLocaleString()} templates loaded ·{' '}
              {filtered.length.toLocaleString()} shown
            </p>
          </div>

          {/* Template Count Stats */}
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="flex size-2 rounded-full bg-primary" />
              <span className="font-mono text-xs text-muted-foreground">Official:</span>
              <span className="font-mono text-sm font-bold text-foreground">
                {templateStats.official}
              </span>
            </div>
            <div className="mx-2 h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex size-2 rounded-full bg-severity-medium" />
              <span className="font-mono text-xs text-muted-foreground">Custom:</span>
              <span className="font-mono text-sm font-bold text-foreground">
                {templateStats.custom}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleValidateCustomTemplates}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <CheckCircle2 className="size-4" />
            Validate Custom
          </button>
          <button
            onClick={() => setShowSyncModal(true)}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <RefreshCw className="size-4" />
            Sync Official
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Upload className="size-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
            showFilters || activeFilterCount > 0
              ? 'border-primary/50 bg-primary/10 text-primary'
              : 'border-border bg-card text-foreground hover:bg-accent'
          )}
        >
          <Filter className="size-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex rounded-md border border-border">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex size-9 items-center justify-center rounded-l-md transition-colors',
              viewMode === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="List view"
          >
            <List className="size-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'flex size-9 items-center justify-center rounded-r-md transition-colors',
              viewMode === 'grid' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Grid view"
          >
            <Grid3X3 className="size-4" />
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-card p-4">
          {/* Severity */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">Severity:</span>
            {(['critical', 'high', 'medium', 'low', 'info'] as Severity[]).map((s) => (
              <button
                key={s}
                onClick={() => toggleSeverity(s)}
                className={cn(
                  'rounded px-2 py-0.5 font-mono text-[10px] font-medium uppercase transition-colors',
                  selectedSeverities.includes(s)
                    ? `${SEVERITY_CONFIG_BG[s]} ${SEVERITY_CONFIG_TEXT[s]}`
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Protocol */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">Protocol:</span>
            <select
              value={selectedProtocol}
              onChange={(e) => setSelectedProtocol(e.target.value as Protocol | '')}
              className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">All</option>
              <option value="http">HTTP</option>
              <option value="dns">DNS</option>
              <option value="ssl">SSL</option>
              <option value="network">Network</option>
            </select>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Source */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">Source:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as TemplateSource | '')}
              className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">All</option>
              <option value="official">Official</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Tag */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">Tag:</span>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">All</option>
              {uniqueTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {activeFilterCount > 0 && (
            <>
              <div className="h-4 w-px bg-border" />
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded px-2 py-1 font-mono text-xs text-destructive transition-colors hover:bg-destructive/10"
              >
                <X className="size-3" />
                Clear all
              </button>
            </>
          )}
        </div>
      )}

      {/* Template List / Grid */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <FileCode2 className="mb-4 size-16 text-muted-foreground/30" />
            <p className="mb-1 text-lg font-medium text-foreground">No templates found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="overflow-auto rounded-md border border-border">
            <table className="w-full">
              <thead className="sticky top-0 bg-muted/50">
                <tr className="border-b border-border font-mono text-xs text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">
                    Template
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Severity
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Protocol
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Tags
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Author
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Source
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border/50 bg-card transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm font-medium text-foreground">
                        {t.name}
                      </div>
                      <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {t.templateId}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={t.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs uppercase text-foreground">
                        {t.protocol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {t.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                        {t.tags.length > 3 && (
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                            +{t.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-foreground">{t.author}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'rounded px-2 py-0.5 font-mono text-[10px] font-medium uppercase',
                        t.source === 'official' ? 'bg-primary/15 text-primary' : 'bg-severity-medium/15 text-severity-medium'
                      )}>
                        {t.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <TemplateStatusBadge 
                        status={t.status} 
                        isValidating={validatingTemplates.has(t.id)}
                        onValidate={() => handleValidateTemplate(t.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatDate(t.updatedAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <div className="mb-3 flex items-start justify-between">
                  <SeverityBadge severity={t.severity} />
                  <span className={cn(
                    'rounded px-2 py-0.5 font-mono text-[10px] font-medium uppercase',
                    t.source === 'official' ? 'bg-primary/15 text-primary' : 'bg-severity-medium/15 text-severity-medium'
                  )}>
                    {t.source}
                  </span>
                </div>

                <h3 className="mb-1 font-mono text-sm font-semibold text-foreground">
                  {t.name}
                </h3>
                <p className="mb-3 font-mono text-xs text-muted-foreground">
                  {t.templateId}
                </p>

                <div className="mb-3 flex flex-wrap gap-1">
                  {t.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 font-mono text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="size-3" />
                    {t.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDate(t.updatedAt)}
                  </span>
                </div>

                <div className="mt-2">
                  <TemplateStatusBadge 
                    status={t.status} 
                    isValidating={validatingTemplates.has(t.id)}
                    onValidate={() => handleValidateTemplate(t.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <UploadTemplatesModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />
      <SyncOfficialModal isOpen={showSyncModal} onClose={() => setShowSyncModal(false)} />
    </div>
  );
}

function TemplateStatusBadge({ 
  status, 
  isValidating, 
  onValidate 
}: { 
  status: TemplateStatus; 
  isValidating: boolean;
  onValidate: () => void;
}) {
  if (isValidating || status === 'validating') {
    return (
      <span className="flex items-center gap-1.5 rounded bg-blue-500/15 px-2 py-0.5 font-mono text-[10px] font-medium text-blue-500">
        <Loader2 className="size-3 animate-spin" />
        Validating...
      </span>
    );
  }

  if (status === 'valid') {
    return (
      <span className="flex items-center gap-1.5 rounded bg-green-500/15 px-2 py-0.5 font-mono text-[10px] font-medium text-green-500">
        <CheckCircle2 className="size-3" />
        Valid
      </span>
    );
  }

  if (status === 'invalid') {
    return (
      <button
        onClick={onValidate}
        className="flex items-center gap-1.5 rounded bg-red-500/15 px-2 py-0.5 font-mono text-[10px] font-medium text-red-500 transition-colors hover:bg-red-500/25"
      >
        <AlertCircle className="size-3" />
        Invalid - Retry
      </button>
    );
  }

  if (status === 'needs_update') {
    return (
      <button
        onClick={onValidate}
        className="flex items-center gap-1.5 rounded bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-medium text-amber-500 transition-colors hover:bg-amber-500/25"
      >
        <AlertCircle className="size-3" />
        Needs Update
      </button>
    );
  }

  // not_validated
  return (
    <button
      onClick={onValidate}
      className="flex items-center gap-1.5 rounded bg-muted px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent"
    >
      <CheckCircle2 className="size-3" />
      Validate
    </button>
  );
}

// Helper maps for inline filter styling
const SEVERITY_CONFIG_BG: Record<Severity, string> = {
  critical: 'bg-severity-critical/15',
  high: 'bg-severity-high/15',
  medium: 'bg-severity-medium/15',
  low: 'bg-severity-low/15',
  info: 'bg-severity-info/15',
};
const SEVERITY_CONFIG_TEXT: Record<Severity, string> = {
  critical: 'text-severity-critical',
  high: 'text-severity-high',
  medium: 'text-severity-medium',
  low: 'text-severity-low',
  info: 'text-severity-info',
};

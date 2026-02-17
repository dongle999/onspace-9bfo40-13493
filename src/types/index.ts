export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Protocol = 'http' | 'dns' | 'ssl' | 'network' | 'file' | 'headless';
export type TemplateSource = 'official' | 'custom';
export type TemplateStatus = 'valid' | 'invalid' | 'not_validated' | 'needs_update' | 'validating';
export type ScanStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'stopped';

export interface Template {
  id: string;
  name: string;
  templateId: string;
  severity: Severity;
  tags: string[];
  protocol: Protocol;
  author: string;
  source: TemplateSource;
  status: TemplateStatus;
  description: string;
  filePath: string;
  fileHash: string;
  createdAt: string;
  updatedAt: string;
  cvss?: number;
  cwe?: string;
  references?: string[];
  validatedAt?: string; // Track when validation happened
}

export interface ScanConfig {
  name: string;
  description: string;
  templateIds: string[];
  targetListId: string;
  concurrency: number;
  rateLimit: number;
  timeout: number;
  retries: number;
  minSeverity: Severity;
  includeRequestResponse: boolean;
  verboseMode: boolean;
  customFlags: string;
}

export interface Scan {
  id: string;
  name: string;
  description: string;
  status: ScanStatus;
  progress: number;
  templatesProcessed: number;
  templatesTotal: number;
  targetsScanned: number;
  targetsTotal: number;
  currentTemplate: string;
  requestsPerSec: number;
  findingsCount: Record<Severity, number>;
  totalFindings: number;
  estimatedTimeRemaining: string;
  elapsedTime: string;
  cpuPercent: number;
  memoryMB: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  stoppedAt?: string;
  pausedAt?: string;
  config: ScanConfig;
}

export interface Finding {
  id: string;
  scanId: string;
  templateId: string;
  templateName: string;
  severity: Severity;
  target: string;
  matchedAt: string;
  description: string;
  cwe?: string;
  cvss?: number;
  request?: string;
  response?: string;
  matcherDetails?: string;
  references?: string[];
  isFalsePositive: boolean;
  notes?: string;
  tags: string[];
}

export interface TargetList {
  id: string;
  name: string;
  targets: string[];
  createdAt: string;
  usedInScans: number;
}

export interface ScanProfile {
  id: string;
  name: string;
  description: string;
  config: Partial<ScanConfig>;
}

export interface DashboardStats {
  totalTemplates: number;
  officialTemplates: number;
  customTemplates: number;
  totalScans: number;
  activeScans: number;
  totalFindings: number;
  findingsBySeverity: Record<Severity, number>;
  targetsScanned: number;
  lastSyncDate: string;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'scan_started' | 'scan_completed' | 'templates_synced' | 'finding_critical' | 'templates_uploaded';
  message: string;
  timestamp: string;
  severity?: Severity;
}

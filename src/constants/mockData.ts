import type { Template, Scan, Finding, TargetList, DashboardStats, ActivityItem, ScanProfile } from '@/types';

const cveNames = [
  'CVE-2024-3400', 'CVE-2024-21762', 'CVE-2023-46805', 'CVE-2023-44228',
  'CVE-2023-42793', 'CVE-2023-38831', 'CVE-2023-36884', 'CVE-2023-34362',
  'CVE-2023-27997', 'CVE-2023-23397', 'CVE-2023-20198', 'CVE-2023-0669',
];

const vulnDescriptions: Record<string, string> = {
  'CVE-2024-3400': 'PAN-OS GlobalProtect Command Injection',
  'CVE-2024-21762': 'Fortinet FortiOS Out-of-Bound Write',
  'CVE-2023-46805': 'Ivanti Connect Secure Authentication Bypass',
  'CVE-2023-44228': 'Log4j2 Remote Code Execution',
  'CVE-2023-42793': 'JetBrains TeamCity Authentication Bypass',
  'CVE-2023-38831': 'WinRAR Code Execution via ZIP',
  'CVE-2023-36884': 'Microsoft Office Remote Code Execution',
  'CVE-2023-34362': 'MOVEit Transfer SQL Injection',
  'CVE-2023-27997': 'Fortinet FortiOS Heap Buffer Overflow',
  'CVE-2023-23397': 'Microsoft Outlook Privilege Escalation',
  'CVE-2023-20198': 'Cisco IOS XE Web UI Privilege Escalation',
  'CVE-2023-0669': 'GoAnywhere MFT Pre-Authentication RCE',
};

const severities: Array<'critical' | 'high' | 'medium' | 'low' | 'info'> = ['critical', 'high', 'medium', 'low', 'info'];
const protocols: Array<'http' | 'dns' | 'ssl' | 'network'> = ['http', 'http', 'http', 'dns', 'ssl', 'network'];
const authors = ['pdteam', 'daffainfo', 'dwisiswant0', 'pikpikcu', 'geeknik'];

export const MOCK_TEMPLATES: Template[] = cveNames.map((cve, i) => {
  const sev = i < 3 ? 'critical' : i < 6 ? 'high' : i < 9 ? 'medium' : 'low';
  const tags = ['cve'];
  if (sev === 'critical' || sev === 'high') tags.push('rce');

  return {
    id: `tmpl-${String(i + 1).padStart(4, '0')}`,
    name: vulnDescriptions[cve] || `${cve} Exploit`,
    templateId: cve.toLowerCase(),
    severity: sev,
    tags,
    protocol: protocols[i % protocols.length],
    author: authors[i % authors.length],
    source: i < 8 ? 'official' as const : 'custom' as const,
    status: 'valid' as const,
    description: `Detection template for ${vulnDescriptions[cve] || cve}.`,
    filePath: `cves/${cve}.yaml`,
    fileHash: `sha256:abc123`,
    createdAt: new Date(2024, 1, i + 1).toISOString(),
    updatedAt: new Date(2024, 5, i + 1).toISOString(),
    cvss: sev === 'critical' ? 9.8 : sev === 'high' ? 8.1 : sev === 'medium' ? 6.5 : 3.2,
    cwe: 'CWE-78',
    references: [`https://nvd.nist.gov/vuln/detail/${cve}`],
  };
});

const miscTemplates: Template[] = [
  { name: 'Nginx Version Detection', templateId: 'nginx-version', severity: 'info', tags: ['tech-detect', 'nginx'], protocol: 'http' },
  { name: 'WordPress Login Panel', templateId: 'wordpress-login', severity: 'info', tags: ['panel', 'wordpress'], protocol: 'http' },
].map((t, i) => ({
  ...t,
  id: `tmpl-${String(i + 13).padStart(4, '0')}`,
  author: 'pdteam',
  source: 'official' as const,
  status: 'valid' as const,
  description: `Detection template for ${t.name}.`,
  filePath: `misc/${t.templateId}.yaml`,
  fileHash: 'sha256:def456',
  createdAt: new Date(2024, 2, i + 1).toISOString(),
  updatedAt: new Date(2024, 6, i + 1).toISOString(),
  cvss: 0,
  references: [],
}));

export const ALL_TEMPLATES: Template[] = [...MOCK_TEMPLATES, ...miscTemplates];

export const MOCK_TARGET_LISTS: TargetList[] = [
  { id: 'tl-001', name: 'Example Corp', targets: ['example.com', 'shop.example.com', 'api.example.com'], createdAt: '2024-06-01T10:00:00Z', usedInScans: 5 },
  { id: 'tl-002', name: 'Target.io', targets: ['target.io', 'app.target.io'], createdAt: '2024-06-10T14:30:00Z', usedInScans: 3 },
];

export const MOCK_SCAN_PROFILES: ScanProfile[] = [
  { id: 'prof-001', name: 'Quick Scan', description: 'Fast scan with critical templates only', config: { concurrency: 50, rateLimit: 300, timeout: 5, minSeverity: 'critical' } },
  { id: 'prof-002', name: 'Full Audit', description: 'Comprehensive scan with all templates', config: { concurrency: 25, rateLimit: 150, timeout: 10, minSeverity: 'info' } },
];

export const MOCK_SCANS: Scan[] = [
  {
    id: 'scan-001', name: 'WordPress Audit 2024', description: 'Full scan', status: 'running',
    progress: 67.4, templatesProcessed: 184, templatesTotal: 273, targetsScanned: 2, targetsTotal: 3,
    currentTemplate: 'CVE-2024-3400', requestsPerSec: 143,
    findingsCount: { critical: 3, high: 18, medium: 52, low: 94, info: 247 }, totalFindings: 414,
    estimatedTimeRemaining: '8m 22s', elapsedTime: '17m 38s', cpuPercent: 72, memoryMB: 2340,
    createdAt: '2024-07-15T08:00:00Z', startedAt: '2024-07-15T08:01:12Z',
    config: { name: 'WordPress Audit 2024', description: '', templateIds: [], targetListId: 'tl-001', concurrency: 25, rateLimit: 150, timeout: 10, retries: 1, minSeverity: 'info', includeRequestResponse: true, verboseMode: true, customFlags: '' },
  },
  {
    id: 'scan-002', name: 'CVE Hunter', description: 'Critical CVEs only', status: 'queued',
    progress: 0, templatesProcessed: 0, templatesTotal: 15, targetsScanned: 0, targetsTotal: 5,
    currentTemplate: '', requestsPerSec: 0,
    findingsCount: { critical: 0, high: 0, medium: 0, low: 0, info: 0 }, totalFindings: 0,
    estimatedTimeRemaining: '~25m', elapsedTime: '0s', cpuPercent: 0, memoryMB: 0,
    createdAt: '2024-07-15T08:30:00Z',
    config: { name: 'CVE Hunter', description: '', templateIds: [], targetListId: 'tl-001', concurrency: 50, rateLimit: 300, timeout: 10, retries: 1, minSeverity: 'critical', includeRequestResponse: false, verboseMode: false, customFlags: '' },
  },
  {
    id: 'scan-003', name: 'API Security Check', description: 'API endpoints scan', status: 'completed',
    progress: 100, templatesProcessed: 142, templatesTotal: 142, targetsScanned: 2, targetsTotal: 2,
    currentTemplate: '', requestsPerSec: 0,
    findingsCount: { critical: 1, high: 5, medium: 12, low: 8, info: 34 }, totalFindings: 60,
    estimatedTimeRemaining: '0s', elapsedTime: '12m 15s', cpuPercent: 0, memoryMB: 0,
    createdAt: '2024-07-14T10:00:00Z', startedAt: '2024-07-14T10:01:00Z', completedAt: '2024-07-14T10:13:15Z',
    config: { name: 'API Security Check', description: '', templateIds: [], targetListId: 'tl-002', concurrency: 30, rateLimit: 200, timeout: 10, retries: 1, minSeverity: 'info', includeRequestResponse: true, verboseMode: false, customFlags: '' },
  },
];

export const MOCK_FINDINGS: Finding[] = [
  {
    id: 'finding-001', scanId: 'scan-001', templateId: 'cve-2024-3400', templateName: 'PAN-OS GlobalProtect Command Injection',
    severity: 'critical', target: 'example.com', matchedAt: '2024-07-15T08:15:00Z',
    description: 'Critical command injection vulnerability detected in GlobalProtect interface',
    cvss: 9.8, cwe: 'CWE-78', tags: ['cve', 'rce'],
    isFalsePositive: false,
  },
  {
    id: 'finding-002', scanId: 'scan-001', templateId: 'wordpress-login', templateName: 'WordPress Login Panel Detection',
    severity: 'info', target: 'blog.example.com', matchedAt: '2024-07-15T08:18:00Z',
    description: 'WordPress admin login page detected',
    tags: ['panel', 'wordpress'],
    isFalsePositive: false,
  },
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalTemplates: ALL_TEMPLATES.length,
  officialTemplates: ALL_TEMPLATES.filter(t => t.source === 'official').length,
  customTemplates: ALL_TEMPLATES.filter(t => t.source === 'custom').length,
  totalScans: MOCK_SCANS.length,
  activeScans: MOCK_SCANS.filter(s => s.status === 'running').length,
  totalFindings: MOCK_FINDINGS.length,
  findingsBySeverity: {
    critical: 3,
    high: 18,
    medium: 52,
    low: 94,
    info: 247,
  },
  targetsScanned: 12,
  lastSyncDate: '2024-07-14T18:00:00Z',
  recentActivity: [
    { id: 'act-001', type: 'scan_started', message: 'WordPress Audit 2024 started', timestamp: '2024-07-15T08:01:12Z' },
    { id: 'act-002', type: 'finding_critical', message: 'Critical finding detected on example.com', timestamp: '2024-07-15T08:15:00Z', severity: 'critical' },
  ],
};

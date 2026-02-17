export const APP_CONFIG = {
  name: 'Nuclei Command Center',
  shortName: 'NCC',
  version: '1.0.0',
  description: 'Security scan management and template orchestration',
  maxConcurrency: 100,
  maxRateLimit: 1000,
  maxTimeout: 60,
  maxRetries: 3,
  defaultConcurrency: 25,
  defaultRateLimit: 150,
  defaultTimeout: 10,
  defaultRetries: 1,
};

export const SEVERITY_CONFIG: Record<string, { label: string; color: string; bgClass: string; textClass: string; dotClass: string; bgBar: string }> = {
  critical: { label: 'Critical', color: 'hsl(var(--severity-critical))', bgClass: 'bg-severity-critical/15', textClass: 'text-severity-critical', dotClass: 'bg-severity-critical', bgBar: 'bg-severity-critical' },
  high: { label: 'High', color: 'hsl(var(--severity-high))', bgClass: 'bg-severity-high/15', textClass: 'text-severity-high', dotClass: 'bg-severity-high', bgBar: 'bg-severity-high' },
  medium: { label: 'Medium', color: 'hsl(var(--severity-medium))', bgClass: 'bg-severity-medium/15', textClass: 'text-severity-medium', dotClass: 'bg-severity-medium', bgBar: 'bg-severity-medium' },
  low: { label: 'Low', color: 'hsl(var(--severity-low))', bgClass: 'bg-severity-low/15', textClass: 'text-severity-low', dotClass: 'bg-severity-low', bgBar: 'bg-severity-low' },
  info: { label: 'Info', color: 'hsl(var(--severity-info))', bgClass: 'bg-severity-info/15', textClass: 'text-severity-info', dotClass: 'bg-severity-info', bgBar: 'bg-severity-info' },
};

export const SCAN_STATUS_CONFIG: Record<string, { label: string; colorClass: string; bgClass: string }> = {
  queued: { label: 'Queued', colorClass: 'text-muted-foreground', bgClass: 'bg-muted' },
  running: { label: 'Running', colorClass: 'text-primary', bgClass: 'bg-primary/15' },
  paused: { label: 'Paused', colorClass: 'text-severity-medium', bgClass: 'bg-severity-medium/15' },
  completed: { label: 'Completed', colorClass: 'text-primary', bgClass: 'bg-primary/15' },
  failed: { label: 'Failed', colorClass: 'text-severity-critical', bgClass: 'bg-severity-critical/15' },
  stopped: { label: 'Stopped', colorClass: 'text-severity-high', bgClass: 'bg-severity-high/15' },
};

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { label: 'Templates', path: '/templates', icon: 'FileCode2' },
  { label: 'Scans', path: '/scans', icon: 'Radar' },
  { label: 'Results', path: '/results', icon: 'ShieldAlert' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
] as const;

export const TEMPLATE_TAGS = [
  'cve', 'rce', 'sqli', 'xss', 'ssrf', 'lfi', 'rfi', 'auth-bypass',
  'idor', 'misconfig', 'exposure', 'default-login', 'takeover',
  'wordpress', 'joomla', 'drupal', 'nginx', 'apache', 'iis',
  'panel', 'tech-detect', 'token', 'cors', 'crlf', 'redirect',
];

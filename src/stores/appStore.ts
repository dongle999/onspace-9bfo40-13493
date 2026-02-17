import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Scan, Finding, Template } from '@/types';
import { MOCK_SCANS, MOCK_FINDINGS, ALL_TEMPLATES } from '@/constants/mockData';
import { toast } from 'sonner';

interface AppState {
  templates: Template[];
  scans: Scan[];
  findings: Finding[];
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  selectedScanId: string | null;
  setSelectedScanId: (id: string | null) => void;
  updateScan: (scanId: string, updates: Partial<Scan>) => void;
  addScan: (scan: Scan) => void;
  addTemplates: (newTemplates: Template[]) => void;
  toggleFalsePositive: (findingId: string) => void;
  addFindingNote: (findingId: string, note: string) => void;
  
  // Bulk operations
  deleteScan: (scanId: string) => void;
  deleteScans: (scanIds: string[]) => void;
  deleteFindings: (findingIds: string[]) => void;
  
  // Scan controls
  pauseScan: (scanId: string) => void;
  resumeScan: (scanId: string) => void;
  stopScan: (scanId: string) => void;
  restartScan: (scanId: string) => void;
  
  // Template validation
  validateTemplate: (templateId: string) => Promise<boolean>;
  updateTemplate: (templateId: string, updates: Partial<Template>) => void;
}

// Simulate template validation against nuclei
async function simulateTemplateValidation(template: Template): Promise<boolean> {
  console.log(`Validating template: ${template.templateId}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
  
  // 95% of templates are valid
  const isValid = Math.random() > 0.05;
  
  console.log(`Template ${template.templateId} validation result: ${isValid ? 'VALID' : 'INVALID'}`);
  
  return isValid;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      templates: ALL_TEMPLATES,
      scans: MOCK_SCANS,
      findings: MOCK_FINDINGS,
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      selectedScanId: null,
      setSelectedScanId: (id) => set({ selectedScanId: id }),
      
      updateScan: (scanId, updates) =>
        set((s) => ({
          scans: s.scans.map((scan) =>
            scan.id === scanId ? { ...scan, ...updates } : scan
          ),
        })),
      
      addScan: (scan) =>
        set((s) => ({ scans: [scan, ...s.scans] })),
      
      addTemplates: (newTemplates) =>
        set((s) => ({ templates: [...s.templates, ...newTemplates] })),
      
      toggleFalsePositive: (findingId) =>
        set((s) => ({
          findings: s.findings.map((f) =>
            f.id === findingId ? { ...f, isFalsePositive: !f.isFalsePositive } : f
          ),
        })),
      
      addFindingNote: (findingId, note) =>
        set((s) => ({
          findings: s.findings.map((f) =>
            f.id === findingId ? { ...f, notes: note } : f
          ),
        })),
      
      // Bulk operations
      deleteScan: (scanId) => {
        set((s) => ({
          scans: s.scans.filter((scan) => scan.id !== scanId),
          findings: s.findings.filter((f) => f.scanId !== scanId),
        }));
        toast.success('Scan deleted successfully');
      },
      
      deleteScans: (scanIds) => {
        const count = scanIds.length;
        set((s) => ({
          scans: s.scans.filter((scan) => !scanIds.includes(scan.id)),
          findings: s.findings.filter((f) => !scanIds.includes(f.scanId)),
        }));
        toast.success(`${count} scan${count > 1 ? 's' : ''} deleted successfully`);
      },
      
      deleteFindings: (findingIds) => {
        const count = findingIds.length;
        set((s) => ({
          findings: s.findings.filter((f) => !findingIds.includes(f.id)),
        }));
        toast.success(`${count} finding${count > 1 ? 's' : ''} deleted successfully`);
      },
      
      // Scan controls
      pauseScan: (scanId) => {
        const scan = get().scans.find((s) => s.id === scanId);
        if (scan && scan.status === 'running') {
          get().updateScan(scanId, {
            status: 'paused',
            pausedAt: new Date().toISOString(),
            requestsPerSec: 0,
          });
          toast.info(`Scan "${scan.name}" paused`);
        }
      },
      
      resumeScan: (scanId) => {
        const scan = get().scans.find((s) => s.id === scanId);
        if (scan && scan.status === 'paused') {
          get().updateScan(scanId, {
            status: 'running',
            pausedAt: undefined,
            requestsPerSec: Math.round((scan.config.rateLimit || 150) * 0.8),
          });
          toast.success(`Scan "${scan.name}" resumed`);
        }
      },
      
      stopScan: (scanId) => {
        const scan = get().scans.find((s) => s.id === scanId);
        if (scan && (scan.status === 'running' || scan.status === 'paused')) {
          get().updateScan(scanId, {
            status: 'stopped',
            stoppedAt: new Date().toISOString(),
            requestsPerSec: 0,
          });
          toast.warning(`Scan "${scan.name}" stopped`);
        }
      },
      
      restartScan: (scanId) => {
        const scan = get().scans.find((s) => s.id === scanId);
        if (scan) {
          // Check if there's already a running scan
          const hasRunningScan = get().scans.some((s) => s.status === 'running');
          
          get().updateScan(scanId, {
            status: hasRunningScan ? 'queued' : 'running',
            progress: 0,
            templatesProcessed: 0,
            targetsScanned: 0,
            findingsCount: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
            totalFindings: 0,
            elapsedTime: '0s',
            estimatedTimeRemaining: '~calculating',
            startedAt: hasRunningScan ? undefined : new Date().toISOString(),
            completedAt: undefined,
            stoppedAt: undefined,
            pausedAt: undefined,
            requestsPerSec: hasRunningScan ? 0 : Math.round((scan.config.rateLimit || 150) * 0.8),
            cpuPercent: hasRunningScan ? 0 : 45,
            memoryMB: hasRunningScan ? 0 : 1800,
          });
          toast.success(`Scan "${scan.name}" ${hasRunningScan ? 'queued for restart' : 'restarted'}`);
        }
      },
      
      // Template validation
      validateTemplate: async (templateId) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) return false;
        
        // Check if already validated recently (within 24 hours)
        if (template.validatedAt) {
          const validatedDate = new Date(template.validatedAt);
          const hoursSinceValidation = (Date.now() - validatedDate.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceValidation < 24 && template.status === 'valid') {
            console.log(`Template ${template.templateId} already validated recently, skipping...`);
            return true;
          }
        }
        
        // Update status to validating
        get().updateTemplate(templateId, { status: 'validating' });
        
        // Run validation
        const isValid = await simulateTemplateValidation(template);
        
        // Update template with result
        get().updateTemplate(templateId, {
          status: isValid ? 'valid' : 'invalid',
          validatedAt: new Date().toISOString(),
        });
        
        return isValid;
      },
      
      updateTemplate: (templateId, updates) =>
        set((s) => ({
          templates: s.templates.map((t) =>
            t.id === templateId ? { ...t, ...updates } : t
          ),
        })),
    }),
    {
      name: 'nuclei-cc-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        findings: state.findings.map((f) => ({
          id: f.id,
          isFalsePositive: f.isFalsePositive,
          notes: f.notes,
        })),
        templates: state.templates.map((t) => ({
          id: t.id,
          status: t.status,
          validatedAt: t.validatedAt,
        })),
      }),
    }
  )
);

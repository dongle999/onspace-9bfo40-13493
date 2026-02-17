import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  FolderGit2,
  Bell,
  Shield,
  Database,
  HardDrive,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_CONFIG } from '@/constants/config';

type SettingsTab = 'general' | 'nuclei' | 'sync' | 'notifications';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'nuclei', label: 'Nuclei Engine', icon: Server },
    { id: 'sync', label: 'Template Sync', icon: FolderGit2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your Nuclei Command Center
        </p>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Tab Nav */}
        <div className="w-56 space-y-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <tab.icon className="size-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-auto rounded-md border border-border bg-card p-6">
          <div className="space-y-8">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'nuclei' && <NucleiSettings />}
            {activeTab === 'sync' && <SyncSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="pb-3">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </div>
  );
}

function TextInput({ defaultValue, placeholder }: { defaultValue?: string; placeholder?: string }) {
  return (
    <input
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-64 rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
    />
  );
}

function Toggle({ defaultChecked }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <button
      onClick={() => setChecked(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-muted'
      )}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all',
          checked ? 'left-5' : 'left-0.5'
        )}
      />
    </button>
  );
}

function GeneralSettings() {
  return (
    <>
      <SettingsSection
        title="Application Settings"
        description="General configuration for Nuclei Command Center"
      >
        <FieldRow label="Theme">
          <select className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground">
            <option>Dark (Cyber)</option>
            <option>Light</option>
            <option>System</option>
          </select>
        </FieldRow>
        <FieldRow label="Auto-refresh interval">
          <select className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground">
            <option>5 seconds</option>
            <option>10 seconds</option>
            <option>30 seconds</option>
            <option>1 minute</option>
          </select>
        </FieldRow>
        <FieldRow label="Show tooltips">
          <Toggle defaultChecked={true} />
        </FieldRow>
      </SettingsSection>

      <SettingsSection title="Storage" description="Manage local data and cache">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-3">
              <Database className="size-5 text-muted-foreground" />
              <div>
                <div className="font-mono text-sm font-medium text-foreground">Database</div>
                <div className="font-mono text-xs text-muted-foreground">SQLite · WAL mode</div>
              </div>
            </div>
            <div className="font-mono text-sm font-bold text-foreground">245 MB</div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-3">
              <HardDrive className="size-5 text-muted-foreground" />
              <div>
                <div className="font-mono text-sm font-medium text-foreground">Templates</div>
                <div className="font-mono text-xs text-muted-foreground">8,247 files</div>
              </div>
            </div>
            <div className="font-mono text-sm font-bold text-foreground">1.2 GB</div>
          </div>
        </div>
      </SettingsSection>

      <div className="flex justify-end pt-4">
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Save className="size-4" />
          Save Changes
        </button>
      </div>
    </>
  );
}

function NucleiSettings() {
  return (
    <>
      <SettingsSection
        title="Nuclei Binary"
        description="Configure the Nuclei engine executable"
      >
        <FieldRow label="Binary path">
          <TextInput defaultValue="/usr/local/bin/nuclei" />
        </FieldRow>
        <FieldRow label="Version">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-foreground">v3.2.4</span>
            <span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-medium uppercase text-primary">
              Latest
            </span>
          </div>
        </FieldRow>
      </SettingsSection>

      <SettingsSection title="Default Scan Settings" description="Default values for new scans">
        <FieldRow label="Concurrency">
          <TextInput defaultValue={APP_CONFIG.defaultConcurrency.toString()} />
        </FieldRow>
        <FieldRow label="Rate limit (req/s)">
          <TextInput defaultValue={APP_CONFIG.defaultRateLimit.toString()} />
        </FieldRow>
        <FieldRow label="Timeout (seconds)">
          <TextInput defaultValue={APP_CONFIG.defaultTimeout.toString()} />
        </FieldRow>
        <FieldRow label="Retries">
          <TextInput defaultValue={APP_CONFIG.defaultRetries.toString()} />
        </FieldRow>
        <FieldRow label="Include request/response">
          <Toggle defaultChecked={true} />
        </FieldRow>
        <FieldRow label="Verbose mode">
          <Toggle defaultChecked={false} />
        </FieldRow>
      </SettingsSection>

      <div className="flex justify-end pt-4">
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Save className="size-4" />
          Save Changes
        </button>
      </div>
    </>
  );
}

function SyncSettings() {
  return (
    <>
      <SettingsSection
        title="Template Repository"
        description="Official Nuclei templates from ProjectDiscovery"
      >
        <FieldRow label="Repository URL">
          <TextInput defaultValue="https://github.com/projectdiscovery/nuclei-templates" />
        </FieldRow>
        <FieldRow label="Auto-sync">
          <Toggle defaultChecked={true} />
        </FieldRow>
        <FieldRow label="Sync frequency">
          <select className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground">
            <option>Every 6 hours</option>
            <option>Every 12 hours</option>
            <option>Daily</option>
            <option>Weekly</option>
          </select>
        </FieldRow>
      </SettingsSection>

      <SettingsSection title="Last Sync Status">
        <div className="space-y-2 rounded-md border border-border bg-muted/30 p-4 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Sync</span>
            <span className="text-foreground">Jul 14, 2024 18:00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Commit SHA</span>
            <span className="text-foreground">a3b7c2d</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Templates</span>
            <span className="text-foreground">7,892</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="text-primary">Up to date</span>
          </div>
        </div>
      </SettingsSection>

      <div className="flex justify-end pt-4">
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Save className="size-4" />
          Save Changes
        </button>
      </div>
    </>
  );
}

function NotificationSettings() {
  return (
    <>
      <SettingsSection
        title="Scan Notifications"
        description="Get notified about scan events"
      >
        <FieldRow label="Scan started">
          <Toggle defaultChecked={false} />
        </FieldRow>
        <FieldRow label="Scan completed">
          <Toggle defaultChecked={true} />
        </FieldRow>
        <FieldRow label="Scan failed">
          <Toggle defaultChecked={true} />
        </FieldRow>
      </SettingsSection>

      <SettingsSection title="Finding Notifications" description="Get notified about new findings">
        <FieldRow label="Critical findings">
          <Toggle defaultChecked={true} />
        </FieldRow>
        <FieldRow label="High findings">
          <Toggle defaultChecked={true} />
        </FieldRow>
        <FieldRow label="Medium findings">
          <Toggle defaultChecked={false} />
        </FieldRow>
      </SettingsSection>

      <div className="flex justify-end pt-4">
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Save className="size-4" />
          Save Changes
        </button>
      </div>
    </>
  );
}

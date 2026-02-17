import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { NAV_ITEMS } from '@/constants/config';
import {
  LayoutDashboard,
  FileCode2,
  Radar,
  ShieldAlert,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Atom,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  FileCode2,
  Radar,
  ShieldAlert,
  Settings,
};

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const location = useLocation();

  return (
    <aside className={cn('fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar-background transition-all', sidebarCollapsed ? 'w-16' : 'w-60')}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/15">
          <Atom className="size-5 text-primary" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex-1">
            <div className="font-mono text-sm font-bold text-sidebar-foreground">
              Nuclei
            </div>
            <div className="font-mono text-[10px] text-sidebar-foreground/60">
              Command Center
            </div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn('group relative flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-sm font-medium transition-all', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground', sidebarCollapsed && 'justify-center')}
            >
              <Icon className="size-5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
              {isActive && !sidebarCollapsed && (
                <div className="absolute right-2 size-1.5 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-md p-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </button>
      </div>
    </aside>
  );
}

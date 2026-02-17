import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className={cn('flex-1 overflow-hidden transition-all', sidebarCollapsed ? 'ml-16' : 'ml-60')}>
        <Outlet />
      </main>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { useSidebar } from '@/contexts/SidebarContext';

export default function DashboardLayout() {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-surface-950 flex">
      <Sidebar />
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ease-out flex flex-col ${
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        <DashboardHeader />
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto w-full flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

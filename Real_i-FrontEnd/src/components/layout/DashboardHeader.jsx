import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { Menu, Bell, UserCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function DashboardHeader() {
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Admin Dashboard';
    if (path === '/admin/students') return 'Student Management';
    if (path === '/admin/courses') return 'Course Management';
    if (path === '/admin/analytics') return 'Analytics Overview';
    if (path === '/admin/chat') return 'Command Chat';
    if (path === '/admin/data') return 'Data Manager';
    if (path === '/admin/upload') return 'File Uploads';
    if (path === '/admin/guidelines') return 'System Guidelines';

    if (path === '/student') return 'Student Dashboard';
    if (path === '/student/courses') return 'My Courses';
    if (path === '/student/chat') return 'Study Chat';
    if (path === '/student/quiz') return 'Smart Quizzes';
    if (path === '/student/profile') return 'My Profile';

    return 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggle}
          className="p-2 text-surface-400 hover:text-surface-100 transition-colors lg:hidden rounded-lg bg-surface-800/50"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-bold text-surface-100 font-heading tracking-wide">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-surface-400 hover:text-primary-400 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)] animate-pulse"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-surface-800/50">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-surface-200">{user?.name}</p>
            <p className="text-xs text-surface-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-surface-800 border border-primary-500/20 flex items-center justify-center text-primary-500">
            <UserCircle size={24} />
          </div>
        </div>
      </div>
    </header>
  );
}

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { Menu, Bell, UserCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function DashboardHeader() {
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

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
    if (path === '/admin/profile') return 'Admin Profile';
    if (path === '/admin/settings') return 'System Settings';

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
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-bold text-surface-100 font-heading tracking-wide">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-surface-400 hover:text-primary-400 transition-colors relative"
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell size={20} />
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 bg-surface-900 border border-surface-800 rounded-xl shadow-modal z-50 animate-slide-down overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-surface-800/50">
                  <h3 className="text-sm font-bold text-surface-200">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-surface-500 hover:text-surface-300">
                    <X size={14} />
                  </button>
                </div>
                <div className="p-6 text-center">
                  <Bell size={24} className="text-surface-600 mx-auto mb-2" />
                  <p className="text-xs text-surface-500">No new notifications</p>
                </div>
              </div>
            </>
          )}
        </div>
        
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

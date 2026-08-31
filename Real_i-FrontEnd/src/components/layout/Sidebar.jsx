import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  LayoutDashboard, MessageSquare, Database, Upload, BookOpen,
  BrainCircuit, LogOut, ChevronLeft, ChevronRight,
  Users, BarChart3, GraduationCap, UserCircle, FolderOpen,
  Settings, ClipboardList, CalendarDays, Video,
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/meetings', icon: Video, label: 'Live Classes' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/courses', icon: FolderOpen, label: 'Courses' },
  { to: '/admin/assessments', icon: ClipboardList, label: 'Assessments' },
  { to: '/admin/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/chat', icon: MessageSquare, label: 'Command Chat' },
  { to: '/admin/data', icon: Database, label: 'Data Manager' },
  { to: '/admin/upload', icon: Upload, label: 'Upload Files' },
  { to: '/admin/guidelines', icon: BookOpen, label: 'Guidelines' },
  { to: '/admin/profile', icon: UserCircle, label: 'Profile' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const studentLinks = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/student/meetings', icon: Video, label: 'Live Classes' },
  { to: '/student/courses', icon: GraduationCap, label: 'My Courses' },
  { to: '/student/assessments', icon: ClipboardList, label: 'Assessments' },
  { to: '/student/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/student/chat', icon: MessageSquare, label: 'Study Chat' },
  { to: '/student/quiz', icon: BrainCircuit, label: 'Quizzes' },
  { to: '/student/performance', icon: BarChart3, label: 'Performance' },
  { to: '/student/profile', icon: UserCircle, label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const { collapsed, toggle: toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const isElevated = isSuperAdmin || isAdmin || ['superadmin', 'admin'].includes(user?.role);
  const links = isElevated ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {!collapsed && (
        <div 
          className="fixed inset-0 z-30 bg-surface-950/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}
      
      <aside
        className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-out
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-[72px]' : 'translate-x-0 w-[260px]'}
          bg-surface-900/95 backdrop-blur-xl border-r border-surface-600/30 dark:border-surface-800/50 shadow-2xl lg:shadow-none`}
      >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-surface-600/30 dark:border-surface-800/50 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-sm">
          <img src="/logo.webp" alt="REAL_i" loading="lazy" decoding="async" width="36" height="36" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-amber-700 dark:from-primary-400 dark:to-primary-500 leading-tight font-heading tracking-wide">
              REAL_i
            </h1>
            <p className="text-[10px] text-surface-400 font-semibold tracking-wide uppercase font-mono">
              {isSuperAdmin ? 'Super Admin' : isElevated ? 'Admin Panel' : 'Student Portal'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            title={collapsed ? link.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
              ${collapsed ? 'justify-center' : ''}
              ${isActive
                ? 'bg-primary-500/15 text-primary-700 dark:text-primary-300 shadow-sm border border-primary-500/30 font-semibold'
                : 'text-surface-400 hover:bg-surface-800/80 hover:text-surface-50 dark:hover:text-surface-200'
              }`
            }
          >
            <link.icon size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
            {!collapsed && <span className="animate-fade-in">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-surface-600/30 dark:border-surface-800/50 space-y-1">
        {/* Home Link */}
        <NavLink
          to="/"
          title={collapsed ? 'Home' : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            text-surface-400 hover:bg-surface-800/80 hover:text-surface-50 dark:hover:text-surface-200
            ${collapsed ? 'justify-center' : ''}`}
        >
          <LayoutDashboard size={18} />
          {!collapsed && <span>Home Page</span>}
        </NavLink>

        {/* User Profile */}
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center text-surface-950 text-xs font-bold overflow-hidden shadow-sm">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-50 dark:text-surface-200 truncate">{user.name}</p>
              <p className="text-xs text-surface-400 truncate font-mono">{user.email}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            text-danger-text hover:bg-danger-500/10
            ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          title={collapsed ? 'Expand' : 'Collapse'}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-surface-400 hover:text-surface-50 dark:hover:text-surface-200 transition-colors
            ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="text-xs font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
    </>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { Menu, Bell, UserCircle, X, Search, ChevronRight, LogOut, Settings, User } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const BREADCRUMB_MAP = {
  admin: { label: 'Admin', icon: null },
  student: { label: 'Student', icon: null },
  students: { label: 'Student Management' },
  courses: { label: 'Courses' },
  analytics: { label: 'Analytics' },
  chat: { label: 'Chat' },
  data: { label: 'Data Manager' },
  upload: { label: 'Upload' },
  guidelines: { label: 'Guidelines' },
  assessments: { label: 'Assessments' },
  create: { label: 'Create' },
  edit: { label: 'Edit' },
  take: { label: 'Take Exam' },
  submit: { label: 'Submit' },
  results: { label: 'Results' },
  profile: { label: 'Profile' },
  settings: { label: 'Settings' },
  calendar: { label: 'Calendar' },
  quiz: { label: 'Quizzes' },
  performance: { label: 'Performance' },
};

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/students': 'Student Management',
  '/admin/courses': 'Course Management',
  '/admin/analytics': 'Analytics',
  '/admin/chat': 'Command Chat',
  '/admin/data': 'Data Manager',
  '/admin/upload': 'File Uploads',
  '/admin/guidelines': 'System Guidelines',
  '/admin/assessments': 'Assessment Management',
  '/admin/assessments/create': 'Create Assessment',
  '/admin/calendar': 'Academic Calendar',
  '/admin/profile': 'Admin Profile',
  '/admin/settings': 'System Settings',
  '/student': 'Dashboard',
  '/student/courses': 'My Courses',
  '/student/chat': 'Study Chat',
  '/student/quiz': 'Smart Quizzes',
  '/student/assessments': 'My Assessments',
  '/student/calendar': 'My Calendar',
  '/student/profile': 'My Profile',
  '/student/performance': 'Performance Report',
};

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close search on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchRef.current) {
      const input = searchRef.current.querySelector('input');
      if (input) input.focus();
    }
  }, [showSearch]);

  const getPageTitle = () => {
    const path = location.pathname;
    // Handle dynamic routes like /admin/students/:id
    if (path.match(/^\/admin\/students\/.+/)) return 'Student Dossier';
    return PAGE_TITLES[path] || 'Dashboard';
  };

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    const crumbs = [];
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath += `/${part}`;

      // Skip dynamic IDs (UUIDs, etc.)
      if (part.match(/^[a-f0-9-]{8,}$/i)) {
        crumbs.push({ label: 'Details', path: currentPath, isLast: i === parts.length - 1 });
        continue;
      }

      const mapped = BREADCRUMB_MAP[part];
      crumbs.push({
        label: mapped?.label || part.charAt(0).toUpperCase() + part.slice(1),
        path: currentPath,
        isLast: i === parts.length - 1,
      });
    }
    return crumbs;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // For now, navigate to students search (can expand later)
      if (user?.role === 'admin') {
        navigate(`/admin/students?search=${encodeURIComponent(searchQuery.trim())}`);
      }
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const breadcrumbs = getBreadcrumbs();

  // Mock notifications (ready for real backend)
  const notifications = [];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50">
      {/* Main Row */}
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={toggle}
            className="p-2 text-surface-400 hover:text-surface-100 transition-colors lg:hidden rounded-lg bg-surface-800/50 hover:bg-surface-800 shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Title + Breadcrumbs */}
          <div className="min-w-0">
            <h2 className="text-base font-bold text-surface-100 tracking-wide truncate">
              {getPageTitle()}
            </h2>
            <nav className="hidden sm:flex items-center gap-1 text-[11px] text-surface-500 mt-0.5">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={10} className="text-surface-600" />}
                  {crumb.isLast ? (
                    <span className="text-primary-400 font-bold">{crumb.label}</span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="hover:text-primary-400 transition-colors font-medium"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Search Toggle */}
          <div ref={searchRef} className="relative">
            <button
              onClick={() => { setShowSearch(!showSearch); setShowNotifications(false); setShowUserMenu(false); }}
              className={`p-2 rounded-lg transition-all ${showSearch ? 'bg-primary-500/10 text-primary-400' : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/50'}`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {showSearch && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-surface-900 border border-surface-700 rounded-xl shadow-modal z-50 animate-slide-down overflow-hidden">
                <form onSubmit={handleSearch} className="p-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search students, courses..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-950 border border-surface-800 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-surface-600 mt-2 px-1">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-surface-800 text-surface-400 font-mono text-[9px] border border-surface-700">Enter</kbd> to search · <kbd className="px-1.5 py-0.5 rounded bg-surface-800 text-surface-400 font-mono text-[9px] border border-surface-700">Esc</kbd> to close
                  </p>
                </form>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowSearch(false); setShowUserMenu(false); }}
              className={`p-2 rounded-lg transition-all relative ${showNotifications ? 'bg-primary-500/10 text-primary-400' : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/50'}`}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center border-2 border-surface-950 animate-pulse-soft">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-surface-900 border border-surface-700 rounded-xl shadow-modal z-50 animate-slide-down overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-surface-800/50">
                    <h3 className="text-sm font-bold text-surface-200">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-surface-500 hover:text-surface-300 p-1 rounded hover:bg-surface-800 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center mx-auto mb-3 border border-surface-700">
                        <Bell size={20} className="text-surface-600" />
                      </div>
                      <p className="text-sm font-bold text-surface-300 mb-1">All caught up!</p>
                      <p className="text-xs text-surface-500">No new notifications</p>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.map((n, i) => (
                        <div key={i} className={`p-4 border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors cursor-pointer ${!n.read ? 'bg-primary-500/5' : ''}`}>
                          <p className="text-sm text-white font-medium">{n.title}</p>
                          <p className="text-xs text-surface-400 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-surface-600 mt-1">{n.time}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-surface-800/50 mx-1 hidden sm:block"></div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowSearch(false); setShowNotifications(false); }}
              className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-surface-800/50 transition-all group"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-surface-200 group-hover:text-white transition-colors">{user?.name}</p>
                <p className="text-[10px] text-surface-500 capitalize font-medium">{user?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-surface-950 text-sm font-extrabold shadow-glow-sm">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-900 border border-surface-700 rounded-xl shadow-modal z-50 animate-slide-down overflow-hidden">
                  {/* User Info */}
                  <div className="p-4 border-b border-surface-800/50">
                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-surface-500 font-mono truncate mt-0.5">{user?.email}</p>
                  </div>

                  <div className="py-1.5">
                    <Link
                      to={`/${user?.role}/profile`}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800 hover:text-white transition-colors"
                    >
                      <User size={16} className="text-surface-500" /> My Profile
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800 hover:text-white transition-colors"
                      >
                        <Settings size={16} className="text-surface-500" /> Settings
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-surface-800/50 py-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

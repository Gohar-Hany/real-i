import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, updateUserRole } from '@/services/api';
import { useToast } from '@/components/common/Toast';
import {
  Users, Shield, GraduationCap, Search, Eye, Target,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';

const SUPER_ADMIN_EMAIL = 'goharhany@gmail.com';
const PAGE_SIZE = 10;

export default function AdminStudents() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    fetchUsers();
  }, []);

  // Sync URL search param
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) setSearchQuery(urlSearch);
  }, [searchParams]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  // ── Filtered, Sorted, Paginated ──
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = (a.name || '').localeCompare(b.name || '');
      else if (sortBy === 'email') cmp = (a.email || '').localeCompare(b.email || '');
      else if (sortBy === 'role') cmp = (a.role || '').localeCompare(b.role || '');
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [users, searchQuery, roleFilter, sortBy, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset page on filter/search change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, roleFilter]);

  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ArrowUpDown size={12} className="text-surface-600" />;
    return sortDir === 'asc' ? <ArrowUp size={12} className="text-primary-400" /> : <ArrowDown size={12} className="text-primary-400" />;
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md">
          <Users size={14} className="text-primary-400" />
          <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
            User Directory
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Management</span>
        </h1>
        <p className="text-surface-400 text-sm max-w-2xl leading-relaxed">
          Oversee user accounts, review performance metrics, and manage platform access.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Total Users', value: users.length, color: '#3B82F6' },
          { icon: GraduationCap, label: 'Students', value: totalStudents, color: '#10B981' },
          { icon: Shield, label: 'Admins', value: totalAdmins, color: '#8B5CF6' },
        ].map((stat, i) => (
          <div
            key={i}
            className="relative glass-card rounded-2xl p-5 bg-surface-900/60 border border-surface-700/50 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            style={{ boxShadow: `0 4px 30px ${stat.color}08` }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${stat.color} 0%, transparent 70%)` }}
            ></div>
            <div className="flex items-center gap-4 relative z-10">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border"
                style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`, borderColor: `${stat.color}40` }}
              >
                <stat.icon size={22} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mt-0.5">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-900/60 border border-surface-700/50 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'student', 'admin'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
                roleFilter === role
                  ? 'gradient-primary text-surface-950 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                  : 'bg-surface-900/60 border border-surface-700/50 text-surface-400 hover:text-white hover:border-surface-600'
              }`}
            >
              {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-surface-400 uppercase tracking-wider">Loading directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-surface-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-surface-700">
              <Users size={32} className="text-surface-500" />
            </div>
            <p className="text-lg font-bold text-white mb-1">No users found</p>
            <p className="text-sm text-surface-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700/80 bg-surface-900/80">
                    <th
                      className="text-left px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest cursor-pointer hover:text-surface-200 transition-colors select-none"
                      onClick={() => handleSort('name')}
                    >
                      <span className="flex items-center gap-2">User <SortIcon col="name" /></span>
                    </th>
                    <th
                      className="text-left px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest cursor-pointer hover:text-surface-200 transition-colors select-none hidden md:table-cell"
                      onClick={() => handleSort('email')}
                    >
                      <span className="flex items-center gap-2">Email <SortIcon col="email" /></span>
                    </th>
                    <th
                      className="text-center px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest cursor-pointer hover:text-surface-200 transition-colors select-none"
                      onClick={() => handleSort('role')}
                    >
                      <span className="flex items-center gap-2 justify-center">Role <SortIcon col="role" /></span>
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/50">
                  {paginatedUsers.map(u => (
                    <tr key={u.id} className="hover:bg-surface-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-surface-950 text-xs font-extrabold shrink-0 shadow-sm">
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-primary-300 transition-colors">{u.name}</p>
                            <p className="text-[10px] text-surface-500 font-mono md:hidden">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-surface-400 font-mono text-xs bg-surface-950/50 px-2.5 py-1 rounded-lg border border-surface-800">{u.email}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
                            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        }`}>
                          {u.role === 'admin' ? <Shield size={12} /> : <GraduationCap size={12} />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/students/${u.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-surface-400 bg-surface-800/50 hover:text-white hover:bg-surface-700 border border-surface-700 hover:border-surface-600 transition-all active:scale-95 text-xs font-bold"
                          >
                            <Eye size={14} className="text-primary-500" />
                            <span className="hidden lg:inline">View</span>
                          </Link>
                          {isSuperAdmin && u.email !== SUPER_ADMIN_EMAIL && (
                            <button
                              onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'student' : 'admin')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                                u.role === 'admin'
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
                                  : 'bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20'
                              }`}
                            >
                              <Target size={12} />
                              <span className="hidden lg:inline">{u.role === 'admin' ? 'Demote' : 'Promote'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-surface-700/50 bg-surface-900/30">
              <p className="text-xs text-surface-500">
                Showing <strong className="text-surface-300">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredUsers.length)}</strong> of <strong className="text-surface-300">{filteredUsers.length}</strong> users
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === page
                          ? 'gradient-primary text-surface-950 shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                          : 'bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white hover:bg-surface-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

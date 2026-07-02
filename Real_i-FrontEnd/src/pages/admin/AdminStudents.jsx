import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, updateUserRole, getUserResults } from '@/services/api';
import { useToast } from '@/components/common/Toast';
import {
  Users, Shield, GraduationCap, Search, ChevronDown, ChevronUp,
  Trophy, Target, CheckCircle, XCircle, Eye, X, BarChart3,
  TrendingUp, Award, Clock
} from 'lucide-react';

const SUPER_ADMIN_EMAIL = 'goharhany@gmail.com';

export default function AdminStudents() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userResults, setUserResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [expandedQuiz, setExpandedQuiz] = useState(null);

  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const openUserDetails = async (u) => {
    setSelectedUser(u);
    setResultsLoading(true);
    setExpandedQuiz(null);
    try {
      const data = await getUserResults(u.id);
      setUserResults(data.results || []);
    } catch (err) {
      setUserResults([]);
      toast.error('Failed to load results');
    } finally {
      setResultsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedUser(null);
    setUserResults(null);
    setExpandedQuiz(null);
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;

  // ── Stats for selected user ──
  const avgScore = userResults && userResults.length > 0
    ? Math.round(userResults.reduce((acc, r) => acc + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) / userResults.length)
    : 0;
  const totalQuizzes = userResults?.length || 0;
  const bestScore = userResults && userResults.length > 0
    ? Math.max(...userResults.map(r => r.total > 0 ? Math.round((r.score / r.total) * 100) : 0))
    : 0;

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md shadow-sm">
            <Users size={14} className="text-primary-400" />
            <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
              User Directory
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Management</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Oversee user accounts, review student performance metrics, and manage platform access privileges.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        {[
          { icon: Users, label: 'Total Users', value: users.length, color: '#3B82F6' },
          { icon: GraduationCap, label: 'Students', value: totalStudents, color: '#10B981' },
          { icon: Shield, label: 'Administrators', value: totalAdmins, color: '#8B5CF6' },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="relative glass-card rounded-3xl p-6 bg-surface-900/60 border border-surface-700/50 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            style={{ boxShadow: `0 4px 30px ${stat.color}08` }}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${stat.color} 0%, transparent 70%)` }}
            ></div>
            <div className="flex items-center gap-5 relative z-10">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border"
                style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`, borderColor: `${stat.color}40` }}
              >
                <stat.icon size={26} style={{ color: stat.color }} className="drop-shadow-[0_0_10px_currentColor]" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-surface-400 mt-1">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-surface-900/40 p-3 rounded-2xl border border-surface-700/50 shadow-inner">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-950/80 border border-surface-800 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all shadow-inner"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'student', 'admin'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${
                roleFilter === role
                  ? 'gradient-primary text-surface-950 shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white hover:border-surface-600'
              }`}
            >
              {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl overflow-hidden bg-surface-900/60 relative">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        {loading ? (
          <div className="p-16 text-center relative z-10">
            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-surface-400 uppercase tracking-wider">Accessing Directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center relative z-10">
            <div className="w-20 h-20 bg-surface-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-surface-700">
              <Users size={32} className="text-surface-500" />
            </div>
            <p className="text-lg font-bold text-white mb-1">No users found</p>
            <p className="text-sm text-surface-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-700/80 bg-surface-900/80 backdrop-blur-sm">
                  <th className="text-left px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest w-[30%]">User Profile</th>
                  <th className="text-left px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest w-[30%]">Email Address</th>
                  <th className="text-left px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest w-[15%]">Role</th>
                  <th className="text-right px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest w-[25%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-surface-950 text-sm font-extrabold shrink-0 shadow-glow">
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="font-bold text-white group-hover:text-primary-300 transition-colors">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-surface-400 font-mono text-xs px-3 py-1.5 rounded-lg bg-surface-950/50 border border-surface-800">
                        {u.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-inner ${
                        u.role === 'admin'
                          ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
                          : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      }`}>
                        {u.role === 'admin' ? <Shield size={14} /> : <GraduationCap size={14} />}
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openUserDetails(u)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-surface-400 bg-surface-800/50 hover:text-white hover:bg-surface-700 border border-surface-700 hover:border-surface-600 transition-all active:scale-95 text-xs font-bold"
                          title="View Intelligence Dossier"
                        >
                          <Eye size={14} className="text-primary-500" />
                          <span className="hidden xl:inline">Details</span>
                        </button>
                        {isSuperAdmin && u.email !== SUPER_ADMIN_EMAIL && (
                          <button
                            onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'student' : 'admin')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-inner ${
                              u.role === 'admin'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
                                : 'bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20'
                            }`}
                          >
                            <Target size={14} />
                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Student Details Modal (Dossier) ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in" onClick={closeDetails}>
          <div
            className="relative bg-surface-900 rounded-3xl border border-surface-700/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-amber-400 to-primary-500"></div>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-surface-800 relative z-10 bg-surface-900/80 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-surface-950 text-2xl font-extrabold shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  {selectedUser.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-extrabold text-white">{selectedUser.name}</h2>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      selectedUser.role === 'admin' ? 'bg-violet-500/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <p className="text-sm font-mono text-surface-400">{selectedUser.email}</p>
                </div>
              </div>
              <button 
                onClick={closeDetails} 
                className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 transition-all active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 relative z-10 custom-scrollbar">
              {resultsLoading ? (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-bold text-surface-400 uppercase tracking-widest">Retrieving Records...</p>
                </div>
              ) : (
                <>
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                      { icon: Target, label: 'Quizzes Taken', value: totalQuizzes, color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20' },
                      { icon: TrendingUp, label: 'Average Score', value: `${avgScore}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                      { icon: Trophy, label: 'Best Score', value: `${bestScore}%`, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                    ].map((s, i) => (
                      <div key={i} className={`p-5 rounded-2xl border ${s.border} bg-surface-800/30 flex items-center gap-4`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                          <s.icon size={22} className={s.color} />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-white">{s.value}</p>
                          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quiz Results List */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center border border-surface-700">
                        <Clock size={16} className="text-surface-400" />
                      </div>
                      <h3 className="text-base font-bold text-white">Performance History</h3>
                    </div>

                    {userResults.length === 0 ? (
                      <div className="py-12 text-center bg-surface-800/20 rounded-2xl border border-dashed border-surface-700">
                        <BarChart3 size={36} className="text-surface-600 mx-auto mb-3" />
                        <p className="text-sm font-bold text-surface-300">No Assessment Data</p>
                        <p className="text-xs text-surface-500 mt-1">This user hasn't completed any quizzes yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userResults.map((result, idx) => {
                          const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
                          const isExpanded = expandedQuiz === idx;
                          const answersArr = result.answers
                            ? Object.keys(result.answers)
                                .sort((a, b) => parseInt(a) - parseInt(b))
                                .map(k => result.answers[k])
                            : [];

                          const statusColor = pct >= 80 ? 'emerald' : pct >= 60 ? 'amber' : 'rose';

                          return (
                            <div key={idx} className="bg-surface-800/40 border border-surface-700 rounded-2xl overflow-hidden transition-all duration-300">
                              <button
                                onClick={() => setExpandedQuiz(isExpanded ? null : idx)}
                                className="w-full flex items-center justify-between p-5 hover:bg-surface-800/60 transition-colors text-left"
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border bg-${statusColor}-500/10 border-${statusColor}-500/20`}>
                                    <span className={`text-base font-black text-${statusColor}-400`}>{pct}%</span>
                                  </div>
                                  <div>
                                    <p className="text-base font-bold text-white mb-1">
                                      Assessment Module #{result.task_id || (idx + 1)}
                                    </p>
                                    <div className="flex items-center gap-3 text-[11px] font-bold text-surface-400 uppercase tracking-wider">
                                      <span className={`text-${statusColor}-400`}>{result.score}/{result.total} Correct</span>
                                      {result.completed_at && (
                                        <>
                                          <span className="w-1 h-1 rounded-full bg-surface-600"></span>
                                          <span className="flex items-center gap-1.5"><Clock size={12} /> {result.completed_at}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'bg-primary-500/20 text-primary-400 rotate-180' : 'bg-surface-800 text-surface-400'}`}>
                                  <ChevronDown size={18} />
                                </div>
                              </button>

                              {/* Expanded Answers */}
                              {isExpanded && answersArr.length > 0 && (
                                <div className="border-t border-surface-700 p-5 space-y-4 bg-surface-900/50">
                                  {answersArr.map((a, qi) => (
                                    <div
                                      key={qi}
                                      className={`p-4 rounded-xl border ${
                                        a.isCorrect
                                          ? 'border-emerald-500/20 bg-emerald-500/5'
                                          : 'border-rose-500/20 bg-rose-500/5'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 shadow-inner ${
                                          a.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                        }`}>
                                          {a.isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                          <p className="text-sm font-bold text-white mb-2 leading-relaxed">
                                            <span className="text-surface-500 font-mono mr-2">Q{qi + 1}.</span>
                                            {a.question}
                                          </p>
                                          
                                          <div className="grid gap-2 sm:grid-cols-2">
                                            {!a.isCorrect && (
                                              <div className="p-2.5 rounded-lg bg-surface-950/50 border border-surface-800">
                                                <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-1">Selected Answer</p>
                                                <p className="text-xs text-rose-400 font-medium">{a.selectedText || a.selected}</p>
                                              </div>
                                            )}
                                            <div className={`p-2.5 rounded-lg bg-surface-950/50 border border-surface-800 ${a.isCorrect ? 'sm:col-span-2' : ''}`}>
                                              <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-1">Correct Answer</p>
                                              <p className="text-xs text-emerald-400 font-medium">{a.correctText || a.correct}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

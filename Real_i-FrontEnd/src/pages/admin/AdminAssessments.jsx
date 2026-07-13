import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAssessments } from '@/contexts/AssessmentContext';
import { useToast } from '@/components/common/Toast';
import {
  ClipboardList, Plus, Search, Eye, Edit3, Trash2, Copy, Send,
  FileText, BrainCircuit, GraduationCap, CheckSquare,
  BarChart3, Clock, Target, Users, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ToggleLeft, ToggleRight
} from 'lucide-react';

const TYPE_CONFIG = {
  quiz: { label: 'Quiz', icon: BrainCircuit, color: '#8B5CF6', bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
  exam: { label: 'Exam', icon: GraduationCap, color: '#EF4444', bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400' },
  assignment: { label: 'Assignment', icon: FileText, color: '#3B82F6', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  task: { label: 'Task', icon: CheckSquare, color: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
};

const PAGE_SIZE = 8;

export default function AdminAssessments() {
  const { assessments, deleteAssessment, publishAssessment, duplicateAssessment, getAssessmentStats } = useAssessments();
  const toast = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'quiz', label: 'Quizzes' },
    { value: 'exam', label: 'Exams' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'task', label: 'Tasks' },
  ];

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
    setCurrentPage(1);
  };

  const handleDelete = (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteAssessment(id);
    toast.success('Assessment deleted');
  };

  const handleDuplicate = (id) => {
    const copy = duplicateAssessment(id);
    if (copy) toast.success(`Duplicated as "${copy.title}"`);
  };

  const handlePublishToggle = (id) => {
    publishAssessment(id);
    toast.success('Status updated');
  };

  // ── Filtered, sorted, paginated ────────────────────────────
  const filtered = useMemo(() => {
    let result = [...assessments];
    if (activeTab !== 'all') result = result.filter(a => a.type === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortBy === 'type') cmp = a.type.localeCompare(b.type);
      else if (sortBy === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortBy === 'endDate') cmp = new Date(a.endDate || 0) - new Date(b.endDate || 0);
      else if (sortBy === 'updatedAt') cmp = new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [assessments, activeTab, search, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Stats
  const totalPublished = assessments.filter(a => a.status === 'published').length;
  const totalDraft = assessments.filter(a => a.status === 'draft').length;

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ArrowUpDown size={11} className="text-surface-600" />;
    return sortDir === 'asc' ? <ArrowUp size={11} className="text-primary-400" /> : <ArrowDown size={11} className="text-primary-400" />;
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md">
            <ClipboardList size={14} className="text-primary-400" />
            <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
              Assessment Center
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Assessment <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Management</span>
          </h1>
          <p className="text-surface-400 text-sm max-w-2xl leading-relaxed">
            Create, manage, and monitor quizzes, exams, assignments, and tasks across all courses.
          </p>
        </div>
        <Link
          to="/admin/assessments/create"
          className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-surface-950 font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} /> Create Assessment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: ClipboardList, label: 'Total', value: assessments.length, color: '#D4AF37' },
          { icon: Eye, label: 'Published', value: totalPublished, color: '#10B981' },
          { icon: Edit3, label: 'Drafts', value: totalDraft, color: '#F59E0B' },
          { icon: BarChart3, label: 'Types', value: new Set(assessments.map(a => a.type)).size, color: '#8B5CF6' },
        ].map((stat, i) => (
          <div key={i} className="relative glass-card rounded-2xl p-5 bg-surface-900/60 border border-surface-700/50 overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${stat.color} 0%, transparent 70%)` }}></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center border" style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`, borderColor: `${stat.color}40` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mt-0.5">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setActiveTab(tab.value); setCurrentPage(1); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.value
                  ? 'gradient-primary text-surface-950 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                  : 'bg-surface-900/60 border border-surface-700/50 text-surface-400 hover:text-white'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-70">
                {tab.value === 'all' ? assessments.length : assessments.filter(a => a.type === tab.value).length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs ml-auto">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            placeholder="Search assessments..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-900/60 border border-surface-700/50 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <ClipboardList size={40} className="text-surface-600 mx-auto mb-4" />
            <p className="text-lg font-bold text-white mb-1">No assessments found</p>
            <p className="text-sm text-surface-400 mb-6">
              {search ? 'Try adjusting your search.' : 'Create your first assessment to get started.'}
            </p>
            {!search && (
              <Link to="/admin/assessments/create" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-surface-950 font-bold text-sm">
                <Plus size={16} /> Create Assessment
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700/80 bg-surface-900/80">
                    <th className="text-left px-5 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest cursor-pointer hover:text-surface-200 select-none" onClick={() => handleSort('title')}>
                      <span className="flex items-center gap-2">Assessment <SortIcon col="title" /></span>
                    </th>
                    <th className="text-center px-4 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest cursor-pointer hover:text-surface-200 select-none hidden md:table-cell" onClick={() => handleSort('type')}>
                      <span className="flex items-center gap-2 justify-center">Type <SortIcon col="type" /></span>
                    </th>
                    <th className="text-center px-4 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest cursor-pointer hover:text-surface-200 select-none hidden lg:table-cell" onClick={() => handleSort('status')}>
                      <span className="flex items-center gap-2 justify-center">Status <SortIcon col="status" /></span>
                    </th>
                    <th className="text-center px-4 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest cursor-pointer hover:text-surface-200 select-none hidden xl:table-cell" onClick={() => handleSort('endDate')}>
                      <span className="flex items-center gap-2 justify-center">Deadline <SortIcon col="endDate" /></span>
                    </th>
                    <th className="text-center px-4 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest hidden sm:table-cell">Subs</th>
                    <th className="text-right px-5 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/50">
                  {paginated.map(assessment => {
                    const tc = TYPE_CONFIG[assessment.type] || TYPE_CONFIG.task;
                    const TypeIcon = tc.icon;
                    const stats = getAssessmentStats(assessment.id);
                    const isExpired = assessment.endDate && new Date(assessment.endDate) < new Date();

                    return (
                      <tr key={assessment.id} className="hover:bg-surface-800/30 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${tc.bg} ${tc.border}`}>
                              <TypeIcon size={18} className={tc.text} />
                            </div>
                            <div className="min-w-0">
                              <Link to={`/admin/assessments/${assessment.id}`} className="font-bold text-white group-hover:text-primary-300 transition-colors block truncate max-w-[260px]">
                                {assessment.title}
                              </Link>
                              <p className="text-[10px] text-surface-500 font-mono truncate max-w-[260px]">{assessment.courseId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center hidden md:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${tc.bg} ${tc.border} border ${tc.text}`}>
                            {tc.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center hidden lg:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                            assessment.status === 'published'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {assessment.status === 'published' ? <Eye size={10} /> : <Edit3 size={10} />}
                            {assessment.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center hidden xl:table-cell">
                          {assessment.endDate ? (
                            <span className={`text-xs font-mono font-bold ${isExpired ? 'text-surface-500 line-through' : 'text-surface-300'}`}>
                              {new Date(assessment.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          ) : <span className="text-xs text-surface-600">—</span>}
                        </td>
                        <td className="px-4 py-4 text-center hidden sm:table-cell">
                          <span className="text-xs font-bold text-surface-300">{stats.submissions}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/admin/assessments/${assessment.id}`} className="p-2 rounded-lg text-surface-400 bg-surface-800/50 border border-surface-700 hover:text-primary-400 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all active:scale-95" title="View">
                              <Eye size={14} />
                            </Link>
                            <Link to={`/admin/assessments/${assessment.id}/edit`} className="p-2 rounded-lg text-surface-400 bg-surface-800/50 border border-surface-700 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all active:scale-95" title="Edit">
                              <Edit3 size={14} />
                            </Link>
                            <button onClick={() => handlePublishToggle(assessment.id)} className={`p-2 rounded-lg border transition-all active:scale-95 ${assessment.status === 'published' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' : 'text-surface-400 bg-surface-800/50 border-surface-700 hover:text-amber-400 hover:bg-amber-500/10'}`} title={assessment.status === 'published' ? 'Unpublish' : 'Publish'}>
                              {assessment.status === 'published' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            </button>
                            <button onClick={() => handleDuplicate(assessment.id)} className="p-2 rounded-lg text-surface-400 bg-surface-800/50 border border-surface-700 hover:text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all active:scale-95" title="Duplicate">
                              <Copy size={14} />
                            </button>
                            <button onClick={() => handleDelete(assessment.id, assessment.title)} className="p-2 rounded-lg text-surface-400 bg-surface-800/50 border border-surface-700 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all active:scale-95" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-surface-700/50 bg-surface-900/30">
                <p className="text-xs text-surface-500">
                  <strong className="text-surface-300">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}</strong> of <strong className="text-surface-300">{filtered.length}</strong>
                </p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronsLeft size={14} /></button>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft size={14} /></button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) page = i + 1;
                    else if (currentPage <= 3) page = i + 1;
                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                    else page = currentPage - 2 + i;
                    return (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page ? 'gradient-primary text-surface-950' : 'bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white'}`}>{page}</button>
                    );
                  })}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight size={14} /></button>
                  <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronsRight size={14} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

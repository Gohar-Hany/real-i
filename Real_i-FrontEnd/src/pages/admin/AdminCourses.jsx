import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus, Edit3, Trash2, Users, BookOpen, Eye, EyeOff, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getCourses, deleteCourse } from '@/services/api';
import { useToast } from '@/components/common/Toast';

const COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

const SortIcon = ({ col, sortBy, sortDir }) => {
  if (sortBy !== col) return <ArrowUpDown size={11} className="text-surface-600" />;
  return sortDir === 'asc' ? <ArrowUp size={11} className="text-primary-400" /> : <ArrowDown size={11} className="text-primary-400" />;
};

export default function AdminCourses() {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  const [filterBy, setFilterBy] = useState('all'); // all, live, draft
  const toast = useToast();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses();
        const mapped = (Array.isArray(data) ? data : []).map((c, i) => ({
          id: c.project_id || c.id,
          title: c.title || c.project_id,
          category: c.category || 'General',
          level: c.level || 'Beginner',
          lessonsCount: c.lessons_count || 0,
          totalHours: c.total_hours || 0,
          studentsEnrolled: c.students_enrolled || 0,
          rating: c.rating || 0,
          color: c.color || COLORS[i % COLORS.length],
          status: c.is_published ? 'live' : 'draft',
          source: 'api',
        }));
        setCourses(mapped);
      } catch (err) {
        console.error('Failed to load courses', err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const handleDelete = async (courseId) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await deleteCourse(courseId);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      toast.success('Course deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete course');
    }
  };


  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }

    // Filter
    if (filterBy !== 'all') {
      result = result.filter(c => c.status === filterBy);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortBy === 'category') cmp = a.category.localeCompare(b.category);
      else if (sortBy === 'level') cmp = a.level.localeCompare(b.level);
      else if (sortBy === 'enrolled') cmp = a.studentsEnrolled - b.studentsEnrolled;
      else if (sortBy === 'rating') cmp = a.rating - b.rating;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [courses, search, filterBy, sortBy, sortDir]);

  const liveCourses = courses.filter(c => c.status === 'live').length;
  const draftCourses = courses.filter(c => c.status === 'draft').length;
  const apiCourses = courses.filter(c => c.source === 'api').length;

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md">
            <BookOpen size={14} className="text-primary-400" />
            <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
              Curriculum Control
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-50 tracking-tight mb-2">
            Course <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Management</span>
          </h1>
          <p className="text-surface-400 text-sm max-w-2xl leading-relaxed">
            Architect the learning experience. Manage real API projects alongside the course catalog.
          </p>
        </div>
        <button
          onClick={() => toast.info('Course creation requires backend integration.')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-surface-950 font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} /> New Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FolderOpen, label: 'Total Courses', value: courses.length, color: '#3B82F6' },
          { icon: Eye, label: 'Live', value: liveCourses, color: '#10B981' },
          { icon: EyeOff, label: 'Draft', value: draftCourses, color: '#F59E0B' },
          { icon: Users, label: 'API Projects', value: apiCourses, color: '#8B5CF6' },
        ].map((stat, i) => (
          <div
            key={i}
            className="relative glass-card rounded-2xl p-5 bg-surface-900/60 border border-surface-700/50 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            style={{ boxShadow: `0 4px 30px ${stat.color}08` }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${stat.color} 0%, transparent 70%)` }}></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg border" style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`, borderColor: `${stat.color}40` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-surface-50">{stat.value}</p>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-900/60 border border-surface-700/50 text-sm text-surface-50 placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'live', label: 'Live' },
            { value: 'draft', label: 'Draft' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterBy(opt.value)}
              className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                filterBy === opt.value
                  ? 'gradient-primary text-surface-950 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                  : 'bg-surface-900/60 border border-surface-700/50 text-surface-400 hover:text-surface-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-surface-400 uppercase tracking-wider">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-16 text-center">
            <BookOpen size={32} className="text-surface-600 mx-auto mb-3" />
            <p className="text-lg font-bold text-surface-50 mb-1">No courses found</p>
            <p className="text-sm text-surface-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-700/80 bg-surface-900/80">
                  <th className="text-left px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest cursor-pointer hover:text-surface-200 select-none" onClick={() => handleSort('title')}>
                    <span className="flex items-center gap-2">Course <SortIcon col="title" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest cursor-pointer hover:text-surface-200 select-none hidden lg:table-cell" onClick={() => handleSort('category')}>
                    <span className="flex items-center gap-2">Category <SortIcon col="category" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest cursor-pointer hover:text-surface-200 select-none hidden md:table-cell" onClick={() => handleSort('level')}>
                    <span className="flex items-center gap-2 justify-center">Level <SortIcon col="level" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest">Status</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest hidden sm:table-cell">Source</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {filteredCourses.map(course => (
                  <tr key={course.id} className="hover:bg-surface-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105"
                          style={{ background: `${course.color}15`, borderColor: `${course.color}30` }}
                        >
                          <BookOpen size={18} style={{ color: course.color }} />
                        </div>
                        <div>
                          <Link 
                            to={`/courses/${course.project_id || course.id}`}
                            className="font-bold text-surface-50 group-hover:text-primary-400 hover:underline transition-colors block"
                            title="View Public Course Page"
                          >
                            {course.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">{course.lessonsCount} modules</span>
                            <span className="w-1 h-1 rounded-full bg-surface-600"></span>
                            <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">{course.totalHours}h</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">{course.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center hidden md:table-cell">
                      <span className={`text-xs font-black uppercase tracking-wider ${
                        course.level === 'Beginner' ? 'text-emerald-400' :
                        course.level === 'Intermediate' ? 'text-amber-400' : 'text-rose-400'
                      }`}>{course.level}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        course.status === 'live'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {course.status === 'live' ? <Eye size={11} /> : <EyeOff size={11} />}
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center hidden sm:table-cell">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                        course.source === 'api'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-surface-800 text-surface-400 border border-surface-700'
                      }`}>
                        {course.source === 'api' ? 'API' : 'Catalog'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/courses/${course.id}`}
                          className="p-2 rounded-lg text-surface-400 bg-surface-800/50 border border-surface-700 hover:text-primary-400 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all active:scale-95 flex items-center justify-center"
                          title="View / Edit"
                        >
                          <Edit3 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id, course.source)}
                          className="p-2 rounded-lg text-surface-400 bg-surface-800/50 border border-surface-700 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all active:scale-95"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Clock, Search, SlidersHorizontal, ArrowUpDown, Grid3x3, List, Target, CheckCircle, Sparkles, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getProjects, getCompletedQuizzes, getAssignedQuizzes } from '@/services/api';

const COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function StudentCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [coursesData, setCoursesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, progress, tasks
  const [filterBy, setFilterBy] = useState('all'); // all, in-progress, completed, not-started
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  useEffect(() => {
    const fetchCoursesProgress = async () => {
      try {
        const list = await getProjects();
        if (list.length === 0) {
          setCoursesData([]);
          setLoading(false);
          return;
        }

        let completedTaskIds = [];
        try {
          const res = await getCompletedQuizzes(user?.id);
          completedTaskIds = res.completed_tasks ? res.completed_tasks.map(ct => ct.task_id) : [];
        } catch (e) {
          console.error('Failed to fetch completed quizzes', e);
        }

        const data = [];
        for (let i = 0; i < list.length; i++) {
          const project = list[i];
          let totalQuizzes = 0;
          let completedInProject = 0;

          try {
            const quizzes = await getAssignedQuizzes(project.project_id);
            if (quizzes && quizzes.length > 0) {
              totalQuizzes = quizzes.length;
              completedInProject = quizzes.filter(q => completedTaskIds.includes(q.task_id)).length;
            }
          } catch (e) { /* skip */ }

          const progress = totalQuizzes === 0 ? 0 : Math.round((completedInProject / totalQuizzes) * 100);

          data.push({
            id: project.project_id,
            title: project.project_id,
            category: 'Course',
            color: COLORS[i % COLORS.length],
            progress,
            totalQuizzes,
            completedInProject,
            status: progress === 0 ? 'not-started' : progress === 100 ? 'completed' : 'in-progress',
          });
        }

        setCoursesData(data);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchCoursesProgress();
  }, [user]);

  // ── Filtered & Sorted Data ──
  const filteredCourses = useMemo(() => {
    let result = [...coursesData];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }

    // Filter
    if (filterBy !== 'all') {
      result = result.filter(c => c.status === filterBy);
    }

    // Sort
    switch (sortBy) {
      case 'progress':
        result.sort((a, b) => b.progress - a.progress);
        break;
      case 'tasks':
        result.sort((a, b) => b.totalQuizzes - a.totalQuizzes);
        break;
      case 'name':
      default:
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [coursesData, searchQuery, sortBy, filterBy]);

  // ── Stats ──
  const totalCourses = coursesData.length;
  const completedCourses = coursesData.filter(c => c.status === 'completed').length;
  const inProgressCourses = coursesData.filter(c => c.status === 'in-progress').length;
  const avgProgress = totalCourses > 0 ? Math.round(coursesData.reduce((a, c) => a + c.progress, 0) / totalCourses) : 0;

  const filterOptions = [
    { value: 'all', label: 'All Courses', count: totalCourses },
    { value: 'in-progress', label: 'In Progress', count: inProgressCourses },
    { value: 'completed', label: 'Completed', count: completedCourses },
    { value: 'not-started', label: 'Not Started', count: coursesData.filter(c => c.status === 'not-started').length },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md">
            <BookOpen size={14} className="text-primary-400" />
            <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
              My Learning Path
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Courses</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-xl leading-relaxed">
            Track your progress, continue where you left off, and master new skills.
          </p>
        </div>
      </div>

      {/* Stats Strip */}
      {!loading && totalCourses > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: BookOpen, label: 'Total Courses', value: totalCourses, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { icon: Target, label: 'In Progress', value: inProgressCourses, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { icon: CheckCircle, label: 'Completed', value: completedCourses, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { icon: BarChart3, label: 'Avg. Progress', value: `${avgProgress}%`, color: 'text-primary-400', bg: 'bg-primary-400/10' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-surface-900/60 border border-surface-700/50">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-white">{s.value}</p>
                <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search & Filter Bar */}
      {!loading && totalCourses > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-900/60 border border-surface-700/50 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {filterOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterBy(opt.value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  filterBy === opt.value
                    ? 'gradient-primary text-surface-950 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                    : 'bg-surface-900/60 border border-surface-700/50 text-surface-400 hover:text-white hover:border-surface-600'
                }`}
              >
                {opt.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${filterBy === opt.value ? 'bg-surface-950/20' : 'bg-surface-800'}`}>{opt.count}</span>
              </button>
            ))}
          </div>

          {/* Sort & View Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-3 rounded-xl bg-surface-900/60 border border-surface-700/50 text-xs font-bold text-surface-300 focus:outline-none focus:border-primary-500/50 cursor-pointer"
            >
              <option value="name">Sort: Name</option>
              <option value="progress">Sort: Progress</option>
              <option value="tasks">Sort: Tasks</option>
            </select>

            <div className="flex rounded-xl overflow-hidden border border-surface-700/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-surface-700 text-white' : 'bg-surface-900/60 text-surface-500 hover:text-white'}`}
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-surface-700 text-white' : 'bg-surface-900/60 text-surface-500 hover:text-white'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-blue-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
          </div>
          <p className="text-surface-400 font-mono text-sm tracking-widest uppercase animate-pulse">Loading Courses...</p>
        </div>
      ) : coursesData.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 glass-card rounded-3xl border border-surface-700/50 bg-surface-900/40 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="w-24 h-24 rounded-full bg-surface-800/80 border border-surface-700 flex items-center justify-center mb-6 relative z-10">
            <BookOpen size={40} className="text-surface-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 relative z-10">No Active Courses</h3>
          <p className="text-surface-400 max-w-md mx-auto mb-8 relative z-10">
            You haven't been assigned any courses yet. Check back soon or browse available courses.
          </p>
          <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 gradient-primary rounded-xl text-surface-950 text-sm font-bold relative z-10">
            <Sparkles size={16} /> Browse Courses
          </Link>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-16 text-center glass-card rounded-3xl border border-surface-700/50 bg-surface-900/40">
          <Search size={32} className="text-surface-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-surface-300">No courses match your search</p>
          <p className="text-xs text-surface-500 mt-1">Try a different search term or filter</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid View ── */
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group relative flex flex-col glass-card rounded-3xl bg-surface-900/60 border border-surface-700/50 overflow-hidden hover:border-primary-500/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all duration-500 hover:-translate-y-1"
            >
              {/* Thumbnail */}
              <div className="h-40 relative overflow-hidden flex items-center justify-center border-b border-surface-800/50">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-transparent to-transparent z-10"></div>
                <div
                  className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at center, ${course.color} 0%, transparent 70%)` }}
                ></div>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-20 shadow-2xl transition-transform duration-500 group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${course.color}20, ${course.color}05)`, border: `1px solid ${course.color}40` }}
                >
                  <BookOpen size={28} style={{ color: course.color }} className="drop-shadow-[0_0_15px_currentColor]" />
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-20">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border backdrop-blur-sm ${
                    course.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    course.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-surface-800/80 text-surface-400 border-surface-700'
                  }`}>
                    {course.status === 'completed' ? '✓ Completed' : course.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col bg-surface-900/80">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border inline-block mb-3 w-fit"
                  style={{ color: course.color, borderColor: `${course.color}30`, backgroundColor: `${course.color}10` }}
                >
                  {course.category}
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors leading-tight mb-4 line-clamp-2">
                  {course.title}
                </h3>

                {/* Progress */}
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-surface-400">Progress</span>
                    <span className="font-bold font-mono" style={{ color: course.color }}>{course.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-800 rounded-full overflow-hidden border border-surface-700/50 mb-5">
                    <div
                      className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                      style={{ width: `${course.progress}%`, background: `linear-gradient(90deg, ${course.color}dd, ${course.color})` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-surface-800">
                    <div className="flex items-center gap-1.5 text-xs text-surface-400 font-medium">
                      <Clock size={14} className="text-surface-500" />
                      {course.totalQuizzes > 0 ? (
                        <span><strong className="text-white">{course.completedInProject}</strong> / {course.totalQuizzes} Tasks</span>
                      ) : (
                        <span>Pending</span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/student/chat`)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-950 px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95"
                      style={{ background: course.color }}
                    >
                      Continue <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── List View ── */
        <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-700/80 bg-surface-900/80">
                  <th className="text-left px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest">Course</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest hidden sm:table-cell">Status</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest">Progress</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest hidden md:table-cell">Tasks</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {filteredCourses.map(course => (
                  <tr key={course.id} className="hover:bg-surface-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{ background: `linear-gradient(135deg, ${course.color}20, ${course.color}05)`, borderColor: `${course.color}40` }}
                        >
                          <BookOpen size={18} style={{ color: course.color }} />
                        </div>
                        <span className="font-bold text-white group-hover:text-primary-300 transition-colors">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        course.status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                        course.status === 'in-progress' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                        'bg-surface-800 border border-surface-700 text-surface-400'
                      }`}>
                        {course.status === 'completed' && <CheckCircle size={12} />}
                        {course.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 justify-center">
                        <div className="w-20 h-1.5 bg-surface-800 rounded-full overflow-hidden border border-surface-700">
                          <div className="h-full rounded-full" style={{ width: `${course.progress}%`, background: course.color }}></div>
                        </div>
                        <span className="text-xs font-bold w-8" style={{ color: course.color }}>{course.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center hidden md:table-cell">
                      <span className="text-sm font-bold text-white">{course.completedInProject}<span className="text-surface-500 font-normal">/{course.totalQuizzes}</span></span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/student/chat`)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-950 px-4 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all"
                        style={{ background: course.color }}
                      >
                        Continue <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

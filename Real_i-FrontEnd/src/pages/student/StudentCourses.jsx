import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Clock, Search, Grid3x3, List, Target, CheckCircle, Sparkles, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCourses, getUser } from '@/services/api';

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
        let userEnrolledCourses = user?.enrolled_courses || [];
        let userCompletedLessons = user?.completed_lessons || [];
        try {
          const userData = await getUser(user.id);
          if (userData) {
            userEnrolledCourses = userData.enrolled_courses || [];
            userCompletedLessons = userData.completed_lessons || [];
          }
        } catch (e) {
          console.error('Failed to fetch user progress', e);
        }

        const list = await getCourses();
        if (!list || list.length === 0) {
          setCoursesData([]);
          setLoading(false);
          return;
        }

        // Filter strictly to courses the student is enrolled in
        const enrolledList = (Array.isArray(list) ? list : []).filter(c => 
          userEnrolledCourses.includes(c.id) || 
          userEnrolledCourses.includes(c._id) || 
          userEnrolledCourses.includes(c.project_id) ||
          (c.enrolled_students && c.enrolled_students.includes(user?.id))
        );

        const data = [];
        for (let i = 0; i < enrolledList.length; i++) {
          const course = enrolledList[i];
          const projectId = course.project_id || course.id;
          
          let totalLessons = 0;
          let completedInProject = 0;

          if (course.modules && Array.isArray(course.modules)) {
            course.modules.forEach(mod => {
              if (mod.lessons && Array.isArray(mod.lessons)) {
                totalLessons += mod.lessons.length;
                completedInProject += mod.lessons.filter(l => userCompletedLessons.includes(l.id)).length;
              }
            });
          }

          const progress = totalLessons === 0 ? 0 : Math.round((completedInProject / totalLessons) * 100);

          data.push({
            id: projectId,
            title: course.title || projectId,
            category: course.category || 'Course',
            color: course.color || COLORS[i % COLORS.length],
            progress,
            totalLessons,
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
        result.sort((a, b) => b.totalLessons - a.totalLessons);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-600/40 dark:border-surface-700 mb-4 backdrop-blur-md">
            <BookOpen size={14} className="text-primary-600 dark:text-primary-400" />
            <span className="text-[11px] font-mono font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
              My Learning Path
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-50 dark:text-surface-100 tracking-tight mb-2 font-heading">
            Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-primary-600 to-amber-700 dark:from-primary-300 dark:via-primary-400 dark:to-primary-500">Courses</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-xl leading-relaxed font-sans">
            Track your progress, continue where you left off, and master new skills.
          </p>
        </div>
      </div>

      {/* Stats Strip */}
      {!loading && totalCourses > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: BookOpen, label: 'Total Courses', value: totalCourses, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10' },
            { icon: Target, label: 'In Progress', value: inProgressCourses, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10' },
            { icon: CheckCircle, label: 'Completed', value: completedCourses, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
            { icon: BarChart3, label: 'Avg. Progress', value: `${avgProgress}%`, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-500/10' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-surface-900 border border-surface-600/40 dark:border-surface-700/50 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-surface-50 dark:text-surface-100 font-heading">{s.value}</p>
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider font-mono">{s.label}</p>
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
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-950 border border-surface-600/40 dark:border-surface-700/50 text-sm text-surface-50 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all font-sans"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {filterOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterBy(opt.value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  filterBy === opt.value
                    ? 'bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-surface-950 shadow-sm'
                    : 'bg-surface-900 border border-surface-600/40 dark:border-surface-700/50 text-surface-400 hover:text-surface-50 hover:border-surface-600'
                }`}
              >
                {opt.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${filterBy === opt.value ? 'bg-surface-950/20 text-surface-950' : 'bg-surface-800 text-surface-300'}`}>{opt.count}</span>
              </button>
            ))}
          </div>

          {/* Sort & View Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-3 rounded-xl bg-surface-900 border border-surface-600/40 dark:border-surface-700/50 text-xs font-bold text-surface-50 dark:text-surface-300 focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="name">Sort: Name</option>
              <option value="progress">Sort: Progress</option>
              <option value="tasks">Sort: Tasks</option>
            </select>

            <div className="flex rounded-xl overflow-hidden border border-surface-600/40 dark:border-surface-700/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-surface-800 text-surface-50 dark:text-primary-400 font-bold' : 'bg-surface-900 text-surface-400 hover:text-surface-50'}`}
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-surface-800 text-surface-50 dark:text-primary-400 font-bold' : 'bg-surface-900 text-surface-400 hover:text-surface-50'}`}
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
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-3xl border border-surface-600/40 dark:border-surface-700/50 bg-surface-900 shadow-sm relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="w-24 h-24 rounded-full bg-surface-800 border border-surface-600/40 dark:border-surface-700 flex items-center justify-center mb-6 relative z-10 shadow-sm">
            <BookOpen size={40} className="text-surface-400" />
          </div>
          <h3 className="text-2xl font-bold text-surface-50 dark:text-surface-100 mb-3 relative z-10 font-heading">No Active Courses</h3>
          <p className="text-surface-400 max-w-md mx-auto mb-8 relative z-10 font-sans">
            You haven't been assigned any courses yet. Check back soon or browse available courses.
          </p>
          <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 rounded-xl text-surface-950 text-sm font-bold relative z-10 shadow-md">
            <Sparkles size={16} /> Browse Courses
          </Link>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-surface-600/40 dark:border-surface-700/50 bg-surface-900 shadow-sm">
          <Search size={32} className="text-surface-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-surface-50 dark:text-surface-300 font-heading">No courses match your search</p>
          <p className="text-xs text-surface-400 mt-1 font-sans">Try a different search term or filter</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid View ── */
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group relative flex flex-col rounded-3xl bg-surface-900 border border-surface-600/40 dark:border-surface-700/50 shadow-sm overflow-hidden hover:border-primary-500/50 hover:shadow-md transition-all duration-500 hover:-translate-y-1"
            >
              {/* Thumbnail */}
              <div className="h-40 relative overflow-hidden flex items-center justify-center border-b border-surface-600/30 dark:border-surface-800/50 bg-surface-800">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10"></div>
                <div
                  className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at center, ${course.color} 0%, transparent 70%)` }}
                ></div>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-20 shadow-md transition-transform duration-500 group-hover:scale-110 bg-surface-900"
                  style={{ border: `1px solid ${course.color}40` }}
                >
                  <BookOpen size={28} style={{ color: course.color }} className="drop-shadow-sm" />
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-20">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border backdrop-blur-sm font-mono ${
                    course.status === 'completed' ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-500/30' :
                    course.status === 'in-progress' ? 'bg-amber-500/20 text-amber-800 dark:text-amber-400 border-amber-500/30' :
                    'bg-surface-800 text-surface-400 border-surface-600/40 dark:border-surface-700'
                  }`}>
                    {course.status === 'completed' ? '✓ Completed' : course.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border inline-block mb-3 w-fit font-mono"
                  style={{ color: course.color, borderColor: `${course.color}30`, backgroundColor: `${course.color}10` }}
                >
                  {course.category}
                </span>
                <h3 className="text-lg font-bold text-surface-50 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors leading-tight mb-4 line-clamp-2 font-heading">
                  {course.title}
                </h3>

                {/* Progress */}
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-surface-400">Progress</span>
                    <span className="font-bold font-mono" style={{ color: course.color }}>{course.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-950 rounded-full overflow-hidden border border-surface-600/30 dark:border-surface-700/50 mb-5">
                    <div
                      className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                      style={{ width: `${course.progress}%`, background: `linear-gradient(90deg, ${course.color}dd, ${course.color})` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-surface-600/30 dark:border-surface-800">
                    <div className="flex items-center gap-1.5 text-xs text-surface-400 font-medium font-sans">
                      <Clock size={14} className="text-surface-400" />
                      {course.totalLessons > 0 ? (
                        <span><strong className="text-surface-50 dark:text-surface-100">{course.completedInProject}</strong> / {course.totalLessons} Lessons</span>
                      ) : (
                        <span>Pending</span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/student/courses/${course.id}/learn`)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-950 px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer font-sans"
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
        <div className="rounded-3xl border border-surface-600/40 dark:border-surface-700/50 bg-surface-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-600/30 dark:border-surface-700/80 bg-surface-800/40">
                  <th className="text-left px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest font-mono">Course</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest font-mono hidden sm:table-cell">Status</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest font-mono">Progress</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest font-mono hidden md:table-cell">Tasks</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest font-mono">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-600/30 dark:divide-surface-700/50">
                {filteredCourses.map(course => (
                  <tr key={course.id} className="hover:bg-surface-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm"
                          style={{ background: `linear-gradient(135deg, ${course.color}20, ${course.color}05)`, borderColor: `${course.color}40` }}
                        >
                          <BookOpen size={18} style={{ color: course.color }} />
                        </div>
                        <span className="font-bold text-surface-50 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors font-heading">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono ${
                        course.status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400' :
                        course.status === 'in-progress' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400' :
                        'bg-surface-800 border border-surface-600/40 dark:border-surface-700 text-surface-400'
                      }`}>
                        {course.status === 'completed' && <CheckCircle size={12} />}
                        {course.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 justify-center">
                        <div className="w-20 h-1.5 bg-surface-950 rounded-full overflow-hidden border border-surface-600/30 dark:border-surface-700">
                          <div className="h-full rounded-full" style={{ width: `${course.progress}%`, background: course.color }}></div>
                        </div>
                        <span className="text-xs font-bold w-8 font-mono" style={{ color: course.color }}>{course.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center hidden md:table-cell font-mono">
                      <span className="text-sm font-bold text-surface-50 dark:text-surface-100">{course.completedInProject}<span className="text-surface-400 font-normal">/{course.totalLessons}</span></span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/student/courses/${course.id}/learn`)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-950 px-4 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
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

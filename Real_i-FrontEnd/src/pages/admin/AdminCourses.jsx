import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus, Edit3, Trash2, Users, BookOpen, Eye, EyeOff, Search } from 'lucide-react';
import { COURSES } from '@/data/mockData';
import { useToast } from '@/components/common/Toast';

export default function AdminCourses() {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState(COURSES);
  const toast = useToast();

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleNewCourse = () => {
    toast.info('New course creation is coming soon! Backend integration required.');
  };

  const handleEdit = (courseId) => {
    toast.info('Edit course feature is coming soon!');
  };

  const handleDelete = (courseId) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    toast.success('Course deleted successfully (mock)!');
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md shadow-sm">
            <BookOpen size={14} className="text-primary-400" />
            <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
              Curriculum Control
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            Course <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Management</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Architect the learning experience. Create new modules, edit existing curriculum, and monitor enrollment metrics.
          </p>
        </div>
        <button 
          onClick={handleNewCourse}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl gradient-primary text-surface-950 font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} />
          Deploy New Course
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {[
          { label: 'Total Modules', value: COURSES.length, icon: FolderOpen, color: '#3B82F6' },
          { label: 'Total Enrolled', value: '5.3K', icon: Users, color: '#10B981' },
          { label: 'Live Courses', value: COURSES.length - 1, icon: Eye, color: '#8B5CF6' },
          { label: 'In Development', value: 1, icon: EyeOff, color: '#F59E0B' },
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

      {/* Search Bar */}
      <div className="bg-surface-900/40 p-3 rounded-2xl border border-surface-700/50 shadow-inner">
        <div className="relative w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search curriculum database..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-950/80 border border-surface-800 text-sm text-white placeholder-surface-500 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Courses Table */}
      <div className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl overflow-hidden bg-surface-900/60 relative">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700/80 bg-surface-900/80 backdrop-blur-sm">
                <th className="text-left px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest">Course Module</th>
                <th className="text-left px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest">Category</th>
                <th className="text-left px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest">Level</th>
                <th className="text-left px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest">Enrolled</th>
                <th className="text-left px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest">Rating</th>
                <th className="text-left px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest">Status</th>
                <th className="text-right px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {filtered.map((course) => {
                const isDraft = course.id === 5 || course.status === 'Draft'; // Mocking draft state
                
                return (
                  <tr key={course.id} className="hover:bg-surface-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-inner transition-transform group-hover:scale-105" 
                          style={{ background: `${course.color}15`, borderColor: `${course.color}30` }}
                        >
                          <BookOpen size={20} style={{ color: course.color }} className="drop-shadow-[0_0_8px_currentColor]" />
                        </div>
                        <div>
                          <Link to={`/courses/${course.id}`} className="font-bold text-white text-base hover:text-primary-300 transition-colors">
                            {course.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">{course.lessonsCount} Modules</span>
                            <span className="w-1 h-1 rounded-full bg-surface-600"></span>
                            <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">{course.totalHours}h Est.</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-inner">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-black uppercase tracking-wider ${
                        course.level === 'Beginner' ? 'text-emerald-400' :
                        course.level === 'Intermediate' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {course.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-surface-200 font-medium">
                      {course.studentsEnrolled.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 bg-surface-950/50 px-2.5 py-1 rounded-lg border border-surface-800 inline-flex">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="text-surface-200 font-bold">{course.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isDraft ? (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner inline-flex items-center gap-1.5">
                          <EyeOff size={12} />
                          Development
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner inline-flex items-center gap-1.5">
                          <Eye size={12} />
                          Deployed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(course.id)} 
                          className="p-2 rounded-lg text-surface-400 bg-surface-800/50 border border-surface-700 hover:text-primary-400 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all active:scale-95" 
                          title="Modify Module"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)} 
                          className="p-2 rounded-lg text-surface-400 bg-surface-800/50 border border-surface-700 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all active:scale-95" 
                          title="Delete Module"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

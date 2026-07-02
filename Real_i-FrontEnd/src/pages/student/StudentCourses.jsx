import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getProjects, getCompletedQuizzes, getAssignedQuizzes } from '@/services/api';

// Fallback colors for projects without specific ones
const COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function StudentCourses() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [coursesData, setCoursesData] = useState([]);

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
            title: project.project_id, // since project_id is often the name in this MVP
            category: 'Course',
            totalHours: 10, // Mock value as API doesn't provide this yet
            color: COLORS[i % COLORS.length],
            progress,
            totalQuizzes,
            completedInProject
          });
        }
        
        setCoursesData(data);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCoursesProgress();
    }
  }, [user]);

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
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
          <div className="w-24 h-24 rounded-full bg-surface-800/80 border border-surface-700 flex items-center justify-center mb-6 relative z-10 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            <BookOpen size={40} className="text-surface-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 relative z-10">No Active Courses</h3>
          <p className="text-surface-400 max-w-md mx-auto mb-8 relative z-10">
            You haven't been assigned any courses yet. When you enroll in a new learning path, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {coursesData.map((course) => (
            <div 
              key={course.id} 
              className="group relative flex flex-col glass-card rounded-3xl bg-surface-900/60 border border-surface-700/50 overflow-hidden hover:border-primary-500/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all duration-500 hover:-translate-y-1"
            >
              {/* Thumbnail Area */}
              <div className="h-48 relative overflow-hidden flex items-center justify-center border-b border-surface-800/50">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-transparent to-transparent z-10"></div>
                
                {/* Dynamic colored glow */}
                <div 
                  className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-40"
                  style={{ background: `radial-gradient(circle at center, ${course.color} 0%, transparent 70%)` }}
                ></div>
                
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center relative z-20 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                  style={{ background: `linear-gradient(135deg, ${course.color}20, ${course.color}05)`, border: `1px solid ${course.color}40` }}
                >
                  <BookOpen size={36} style={{ color: course.color }} className="drop-shadow-[0_0_15px_currentColor]" />
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 flex-1 flex flex-col relative z-20 bg-surface-900/80 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span 
                      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border inline-block mb-3 transition-colors"
                      style={{ 
                        color: course.color, 
                        borderColor: `${course.color}30`, 
                        backgroundColor: `${course.color}10` 
                      }}
                    >
                      {course.category}
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors leading-tight line-clamp-2">
                      {course.title}
                    </h3>
                  </div>
                </div>
                
                {/* Progress Section */}
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-surface-400 font-medium">Course Progress</span>
                    <span className="font-bold font-mono tracking-wider" style={{ color: course.color }}>{course.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-800 rounded-full overflow-hidden border border-surface-700/50 mb-6">
                    <div 
                      className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out" 
                      style={{ width: `${course.progress}%`, background: `linear-gradient(90deg, ${course.color}dd, ${course.color})` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>

                  {/* Meta & Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-surface-800">
                    <div className="flex items-center gap-1.5 text-xs text-surface-400 font-medium">
                      <Clock size={14} className="text-surface-500" />
                      {course.totalQuizzes > 0 ? (
                        <span><strong className="text-white">{course.completedInProject}</strong> / {course.totalQuizzes} Tasks</span>
                      ) : (
                        <span>Pending Tasks</span>
                      )}
                    </div>
                    
                    <Link 
                      to={`/courses/${course.id}`} 
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-900 px-4 py-2 rounded-xl transition-all shadow-sm group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-105"
                      style={{ background: course.color }}
                    >
                      Continue <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-surface-100">My Courses</h1>
        <p className="text-surface-400 mt-1">Track your enrolled courses and continue learning</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-500" size={32} />
        </div>
      ) : coursesData.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <BookOpen className="mx-auto mb-4 text-surface-600" size={48} />
          <h3 className="text-xl font-bold text-surface-200 mb-2">No Courses Found</h3>
          <p className="text-surface-500">You haven't been enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesData.map((course) => (
            <div key={course.id} className="glass-card rounded-2xl overflow-hidden hover:border-primary-500/15 transition-all duration-300 hover-lift group">
              {/* Thumbnail */}
              <div className="h-36 relative" style={{ background: `linear-gradient(135deg, ${course.color}25, ${course.color}08)` }}>
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen size={32} className="text-primary-400" />
                </div>
              </div>
              {/* Content */}
              <div className="p-5">
                <span className="text-[10px] font-semibold text-primary-400 uppercase tracking-wider">{course.category}</span>
                <h3 className="text-base font-bold text-surface-100 mt-1 mb-3">{course.title}</h3>
                
                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-surface-400">Progress</span>
                    <span className="text-primary-400 font-semibold">{course.progress}%</span>
                  </div>
                  <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full transition-all duration-700" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-surface-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {course.totalQuizzes > 0 ? `${course.completedInProject}/${course.totalQuizzes} Tasks` : 'Pending Tasks'}
                  </span>
                  <Link to={`/courses/${course.id}`} className="flex items-center gap-1 text-primary-400 font-semibold hover:text-primary-300 transition-colors">
                    Continue <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

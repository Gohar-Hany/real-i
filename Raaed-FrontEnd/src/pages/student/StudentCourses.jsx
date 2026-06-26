import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Clock, BarChart3 } from 'lucide-react';
import { COURSES } from '@/data/mockData';

export default function StudentCourses() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-surface-100">My Courses</h1>
        <p className="text-surface-400 mt-1">Track your enrolled courses and continue learning</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURSES.slice(0, 4).map((course, i) => {
          const progress = [65, 30, 85, 10][i] || 0;
          return (
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
                    <span className="text-primary-400 font-semibold">{progress}%</span>
                  </div>
                  <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-surface-500">
                  <span className="flex items-center gap-1"><Clock size={12} /> {course.totalHours}h total</span>
                  <Link to={`/courses/${course.id}`} className="flex items-center gap-1 text-primary-400 font-semibold hover:text-primary-300 transition-colors">
                    Continue <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

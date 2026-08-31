import { Link } from 'react-router-dom';
import { Clock, Users, Star, BookOpen, Play, ArrowRight } from 'lucide-react';

const BADGE_COLORS = {
  Popular: 'bg-primary-500/15 text-primary-700 dark:text-primary-300 border-primary-500/30',
  'Top Rated': 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
  New: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30',
  Bestseller: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
  Hot: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
  Advanced: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
};

const LEVEL_COLORS = {
  Beginner: 'text-emerald-700 dark:text-emerald-400',
  Intermediate: 'text-amber-700 dark:text-amber-400',
  Advanced: 'text-rose-700 dark:text-rose-400',
};

export default function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.project_id || course.id}`}
      className="course-card group block bg-surface-900 border border-surface-600/40 dark:border-surface-800/60 rounded-2xl overflow-hidden hover:border-primary-500/40 transition-all duration-500 hover-lift shadow-sm hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-surface-800">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${course.color}22, ${course.color}08)` }}>
            <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-surface-900/80 border border-primary-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <BookOpen size={32} className="text-primary-500 dark:text-primary-400" />
              </div>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500 shadow-lg">
            <Play size={22} className="text-surface-950 ml-0.5" />
          </div>
        </div>
        {/* Badge */}
        {course.badge && (
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider border backdrop-blur-md ${BADGE_COLORS[course.badge] || BADGE_COLORS.Popular}`}>
            {course.badge}
          </div>
        )}
        {/* Level */}
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full">
          <span className={`text-[10px] font-mono font-semibold ${LEVEL_COLORS[course.level] || 'text-slate-200'}`}>
            {course.level}
          </span>
        </div>

        {/* Cyber accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category */}
        <span className="text-[10px] font-mono font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
          {course.category}
        </span>

        {/* Title */}
        <h3 className="text-lg font-bold text-surface-50 dark:text-surface-100 mt-1.5 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors duration-300 line-clamp-2 font-heading">
          {course.title}
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-surface-400 dark:text-surface-300 line-clamp-2 mb-4 leading-relaxed">
          {course.subtitle || ''}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-surface-400 dark:text-surface-500 mb-4 font-mono">
          <span className="flex items-center gap-1">
            <BookOpen size={12} />
            {course.lessonsCount || course.lessons_count || 0} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {course.totalHours || course.total_hours || 0}h
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {Number(course.studentsEnrolled || course.students_enrolled || 0).toLocaleString()}
          </span>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-600/30 dark:border-surface-800/50">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-primary-500 dark:text-primary-400 fill-primary-500 dark:fill-primary-400" />
            <span className="text-sm font-bold text-surface-50 dark:text-surface-200">{course.rating || 0}</span>
            <span className="text-xs text-surface-400 dark:text-surface-500 font-mono">({course.reviewsCount || 0})</span>
          </div>
          {/* Price / CTA */}
          <div className="flex items-center gap-1 text-sm font-mono font-semibold text-primary-600 dark:text-primary-400 group-hover:text-primary-500 dark:group-hover:text-primary-300 transition-colors uppercase tracking-wider">
            {course.price === 0 ? 'Free' : `$${course.price}`}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

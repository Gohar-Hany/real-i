import { Link } from 'react-router-dom';
import { Clock, Users, Star, BookOpen, Play, ArrowRight } from 'lucide-react';

const BADGE_COLORS = {
  Popular: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
  'Top Rated': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  New: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Bestseller: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Hot: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  Advanced: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

const LEVEL_COLORS = {
  Beginner: 'text-emerald-400',
  Intermediate: 'text-amber-400',
  Advanced: 'text-rose-400',
};

export default function CourseCard({ course, index = 0 }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="course-card group block glass-card overflow-hidden hover:border-primary-500/20 transition-all duration-500 hover-lift"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-surface-900">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${course.color}22, ${course.color}08)` }}>
            <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-surface-950/50 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <BookOpen size={32} className="text-primary-400" />
              </div>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/20 to-surface-950/40 opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-surface-950/0 group-hover:bg-surface-950/30 transition-all duration-500 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500 shadow-glow">
            <Play size={22} className="text-surface-950 ml-0.5" />
          </div>
        </div>
        {/* Badge */}
        {course.badge && (
          <div className={`absolute top-3 left-3 px-3 py-1 text-[10px] font-bold font-mono uppercase tracking-wider border ${BADGE_COLORS[course.badge] || BADGE_COLORS.Popular}`}>
            {course.badge}
          </div>
        )}
        {/* Level */}
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-surface-950/70">
          <span className={`text-[10px] font-mono font-semibold ${LEVEL_COLORS[course.level] || 'text-surface-300'}`}>
            {course.level}
          </span>
        </div>

        {/* Cyber accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category */}
        <span className="text-[10px] font-mono font-semibold text-primary-400 uppercase tracking-widest">
          {course.category}
        </span>

        {/* Title */}
        <h3 className="text-lg font-bold text-surface-100 mt-1.5 mb-2 group-hover:text-primary-300 transition-colors duration-300 line-clamp-2">
          {course.title}
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-surface-400 line-clamp-2 mb-4">
          {course.subtitle}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-surface-500 mb-4 font-mono">
          <span className="flex items-center gap-1">
            <BookOpen size={12} />
            {course.lessonsCount} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {course.totalHours}h
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {course.studentsEnrolled.toLocaleString()}
          </span>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-800/50">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-primary-400 fill-primary-400" />
            <span className="text-sm font-bold text-surface-200">{course.rating}</span>
            <span className="text-xs text-surface-500 font-mono">({course.reviewsCount})</span>
          </div>
          {/* Price / CTA */}
          <div className="flex items-center gap-1 text-sm font-mono font-semibold text-primary-400 group-hover:text-primary-300 transition-colors uppercase tracking-wider">
            {course.price === 0 ? 'Free' : `$${course.price}`}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

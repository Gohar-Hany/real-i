import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus, Edit3, Trash2, Users, BookOpen, Eye, EyeOff, Search } from 'lucide-react';
import { COURSES } from '@/data/mockData';
export default function AdminCourses() {
  const [search, setSearch] = useState('');

  const filtered = COURSES.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-100">Course Management</h1>
          <p className="text-surface-400 mt-1">Create, edit, and manage your courses</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-surface-950 text-sm font-semibold shadow-glow hover:shadow-glow-lg transition-all active:scale-95">
          <Plus size={18} />
          New Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: COURSES.length, icon: FolderOpen, color: 'text-primary-400' },
          { label: 'Total Students', value: '5.3K', icon: Users, color: 'text-emerald-400' },
          { label: 'Published', value: COURSES.length - 1, icon: Eye, color: 'text-blue-400' },
          { label: 'Draft', value: 1, icon: EyeOff, color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-surface-800/50 flex items-center justify-center">
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-surface-100">{stat.value}</p>
              <p className="text-xs text-surface-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700/50 text-sm text-surface-100 placeholder-surface-500 outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
        />
      </div>

      {/* Courses Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-800/50 bg-surface-800/30">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wide">Course</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wide">Level</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wide">Students</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wide">Rating</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course) => (
                <tr key={course.id} className="border-b border-surface-800/30 last:border-0 hover:bg-surface-800/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${course.color}20` }}>
                        <BookOpen size={18} style={{ color: course.color }} />
                      </div>
                      <div>
                        <Link to={`/courses/${course.id}`} className="font-semibold text-surface-100 hover:text-primary-400 transition-colors">
                          {course.title}
                        </Link>
                        <p className="text-xs text-surface-500">{course.lessonsCount} lessons · {course.totalHours}h</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/15">
                      {course.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold ${
                      course.level === 'Beginner' ? 'text-emerald-400' :
                      course.level === 'Intermediate' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {course.level}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-surface-300">{course.studentsEnrolled.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-surface-300">
                      ⭐ {course.rating}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      Published
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="p-2 rounded-lg text-surface-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all" title="Edit">
                        <Edit3 size={15} />
                      </button>
                      <button className="p-2 rounded-lg text-surface-400 hover:text-danger-400 hover:bg-danger-500/10 transition-all" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

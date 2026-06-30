import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  ArrowLeft, Clock, Users, Star, BookOpen, Play, Lock,
  CheckCircle, ChevronDown, ChevronUp, GraduationCap,
  Brain, BarChart3, Award, FileText,
} from 'lucide-react';
import { COURSES } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const [expandedModule, setExpandedModule] = useState(0);

  const course = COURSES.find((c) => c.id === courseId);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', delay: 0.2,
      });
      gsap.from('.detail-card', {
        opacity: 0, y: 40, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.4,
      });
    });
    return () => ctx.revert();
  }, [courseId]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-200 mb-2">Course not found</h2>
          <Link to="/courses" className="text-primary-400 hover:underline text-sm">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <>
      <Helmet>
        <title>REAL.i | {course.title}</title>
        <meta name="description" content={course.description.slice(0, 160)} />
      </Helmet>
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-primary-400 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Courses
        </Link>

        <div ref={headerRef} className="grid lg:grid-cols-3 gap-10">
          {/* Left — Course Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Card */}
            <div className="detail-card relative rounded-3xl overflow-hidden">
              <div
                className="h-64 sm:h-80 relative"
                style={{ background: `linear-gradient(135deg, ${course.color}30, ${course.color}08)` }}
              >
                <div className="absolute inset-0 bg-grid-pattern opacity-30" />
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow-lg hover:scale-110 transition-transform duration-300 active:scale-95">
                    <Play size={28} className="text-surface-950 ml-1" />
                  </button>
                </div>
                {/* Badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-xs font-bold text-primary-300 uppercase tracking-wider">
                  {course.badge}
                </div>
              </div>
            </div>

            {/* Course Info */}
            <div className="detail-card">
              <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
                {course.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-100 mt-2 mb-3">
                {course.title}
              </h1>
              <p className="text-lg text-surface-400 leading-relaxed mb-6">
                {course.description}
              </p>

              {/* Meta Row */}
              <div className="flex flex-wrap gap-4 text-sm text-surface-400">
                <span className="flex items-center gap-1.5">
                  <GraduationCap size={16} className="text-primary-400" />
                  {course.instructor}
                </span>
                <span className="flex items-center gap-1.5">
                  <BarChart3 size={16} className="text-primary-400" />
                  {course.level}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={16} className="text-primary-400" />
                  {course.duration} · {course.totalHours}h total
                </span>
                <span className="flex items-center gap-1.5">
                  <Star size={16} className="text-primary-400 fill-primary-400" />
                  {course.rating} ({course.reviewsCount} reviews)
                </span>
              </div>
            </div>

            {/* Curriculum */}
            <div className="detail-card glass-card rounded-2xl p-7">
              <h2 className="text-xl font-bold text-surface-100 mb-6 flex items-center gap-2">
                <FileText size={20} className="text-primary-400" />
                Course Curriculum
                <span className="text-sm font-normal text-surface-500 ml-2">
                  {course.modules.length} modules · {totalLessons} lessons
                </span>
              </h2>

              <div className="space-y-3">
                {course.modules.map((mod, i) => (
                  <div key={mod.id} className="rounded-xl border border-surface-800/50 overflow-hidden">
                    {/* Module Header */}
                    <button
                      onClick={() => setExpandedModule(expandedModule === i ? -1 : i)}
                      className="w-full flex items-center justify-between p-4 hover:bg-surface-800/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-surface-950 text-sm font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-surface-200">{mod.title}</p>
                          <p className="text-xs text-surface-500">{mod.lessons.length} lessons</p>
                        </div>
                      </div>
                      {expandedModule === i ? (
                        <ChevronUp size={18} className="text-surface-400" />
                      ) : (
                        <ChevronDown size={18} className="text-surface-400" />
                      )}
                    </button>

                    {/* Lessons */}
                    {expandedModule === i && (
                      <div className="border-t border-surface-800/50">
                        {mod.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-surface-800/20 transition-colors border-b border-surface-800/30 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.isPreview ? (
                                <Play size={14} className="text-primary-400" />
                              ) : (
                                <Lock size={14} className="text-surface-600" />
                              )}
                              <span className={`text-sm ${lesson.isPreview ? 'text-surface-200' : 'text-surface-400'}`}>
                                {lesson.title}
                              </span>
                              {lesson.isPreview && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-primary-500/15 text-primary-400 border border-primary-500/20">
                                  Preview
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-surface-500 shrink-0 ml-4">
                              {lesson.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-6">
            {/* Enroll Card */}
            <div className="detail-card glass-card rounded-2xl p-7 sticky top-28">
              {/* Price */}
              <div className="text-center mb-6">
                <p className="text-4xl font-extrabold text-surface-100">
                  {course.price === 0 ? (
                    <span className="text-gradient">Free</span>
                  ) : (
                    `$${course.price}`
                  )}
                </p>
                <p className="text-sm text-surface-500 mt-1">Full lifetime access</p>
              </div>

              {/* CTA */}
              <button
                onClick={() => {
                  if (!user) navigate('/login?register=true');
                  else navigate(`/student/courses`);
                }}
                className="w-full py-4 rounded-xl gradient-primary text-surface-950 font-bold text-base shadow-glow hover:shadow-glow-lg transition-all duration-300 active:scale-95 mb-4"
              >
                {user ? 'Start Learning' : 'Enroll Now — Free'}
              </button>

              {!user && (
                <p className="text-center text-xs text-surface-500 mb-6">
                  Create a free account to access this course
                </p>
              )}

              {/* Course Includes */}
              <div className="space-y-3 pt-5 border-t border-surface-800/50">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                  This course includes
                </p>
                {[
                  { icon: Play, text: `${totalLessons} video lessons` },
                  { icon: Clock, text: `${course.totalHours} hours of content` },
                  { icon: Brain, text: 'AI-powered Q&A assistant' },
                  { icon: Award, text: 'Certificate of completion' },
                  { icon: Users, text: 'Community access' },
                  { icon: CheckCircle, text: 'Lifetime access' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon size={16} className="text-primary-400 shrink-0" />
                    <span className="text-sm text-surface-300">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-surface-800/50">
                <div className="text-center p-3 rounded-xl bg-surface-800/30">
                  <p className="text-lg font-bold text-surface-200">{course.studentsEnrolled.toLocaleString()}</p>
                  <p className="text-[10px] text-surface-500 uppercase">Students</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-surface-800/30">
                  <p className="text-lg font-bold text-surface-200">{course.rating}</p>
                  <p className="text-[10px] text-surface-500 uppercase">Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

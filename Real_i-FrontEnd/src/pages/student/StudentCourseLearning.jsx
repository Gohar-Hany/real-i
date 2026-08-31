import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCourse, getUser, toggleLessonComplete } from '@/services/api';
import { Play, CheckCircle, ChevronLeft, ChevronRight, Menu, X, BookOpen, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { Helmet } from 'react-helmet-async';

// ── Memoized SVGs ───────────────────────────────────────────
function SettingsIcon({ size = 18, className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function MaximizeIcon({ size = 18, className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
    </svg>
  );
}

// ── Memoized Header Component ───────────────────────────────
const CoursePlayerHeader = memo(function CoursePlayerHeader({
  courseTitle,
  lessonTitle,
  progressPercent,
  sidebarOpen,
  onToggleSidebar
}) {
  return (
    <header className="h-16 shrink-0 bg-surface-900 border-b border-surface-800 flex items-center justify-between px-4 z-20">
      <div className="flex items-center gap-4">
        <Link to="/student/courses" className="p-2 text-surface-400 hover:text-surface-50 bg-surface-800 rounded-lg transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="hidden sm:block">
          <h1 className="text-sm font-bold text-surface-50 truncate max-w-md">{courseTitle}</h1>
          <p className="text-xs text-primary-400">{lessonTitle || 'Select a lesson'}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Progress Bar */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-32 h-2 bg-surface-800 rounded-full overflow-hidden">
            <div 
              className="h-full gradient-primary transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold text-surface-300">{progressPercent}%</span>
        </div>

        <button 
          onClick={onToggleSidebar} 
          className="lg:hidden p-2 text-surface-50 bg-surface-800 rounded-lg active:scale-95 transition-transform"
          aria-label="Toggle Syllabus"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
});

// ── Memoized Video Player Card ──────────────────────────────
const VideoPlayerCard = memo(function VideoPlayerCard({ lesson }) {
  if (!lesson) return null;

  return (
    <div className="w-full aspect-video bg-black rounded-2xl border border-surface-800 overflow-hidden relative group shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
      
      {/* Visual video background container */}
      <div className="absolute inset-0 bg-surface-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] absolute"></div>
        <button 
          className="w-20 h-20 bg-primary-500 rounded-full text-surface-950 flex items-center justify-center z-10 shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-110 active:scale-95 transition-transform"
          aria-label="Play Lesson Video"
        >
          <Play size={32} className="ml-1" />
        </button>
      </div>

      {/* Player Controls Placeholder */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0">
        <div className="flex items-center gap-4 text-surface-50">
          <Play size={20} className="hover:text-primary-400 cursor-pointer" />
          <span className="text-xs font-mono">02:14 / {lesson.duration || '10:00'}</span>
        </div>
        <div className="w-full max-w-md mx-4 h-1 bg-surface-600 rounded-full cursor-pointer relative">
          <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
        </div>
        <div className="flex items-center gap-3 text-surface-50">
          <SettingsIcon size={18} className="hover:text-primary-400 cursor-pointer" />
          <MaximizeIcon size={18} className="hover:text-primary-400 cursor-pointer" />
        </div>
      </div>
    </div>
  );
});

// ── Memoized Action Card ────────────────────────────────────
const LessonActionCard = memo(function LessonActionCard({
  lesson,
  moduleTitle,
  moduleIndex,
  isCompleted,
  onToggleComplete
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-surface-900/60 p-6 rounded-2xl border border-surface-800 backdrop-blur-sm">
      <div>
        <h2 className="text-2xl font-bold text-surface-50 mb-2">{lesson.title}</h2>
        <p className="text-sm text-surface-400 flex items-center gap-2">
          <BookOpen size={14} /> Module {moduleIndex + 1}: {moduleTitle}
        </p>
      </div>
      
      <button
        onClick={() => onToggleComplete(lesson.id)}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 shrink-0 cursor-pointer active:scale-95 ${
          isCompleted 
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
            : 'gradient-primary text-surface-950 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
        }`}
      >
        <CheckCircle size={18} className={isCompleted ? 'text-emerald-400' : 'text-surface-950'} />
        {isCompleted ? 'Completed' : 'Mark as Complete'}
      </button>
    </div>
  );
});

// ── Memoized Sidebar Item ───────────────────────────────────
const LessonSidebarItem = memo(function LessonSidebarItem({
  lesson,
  isActive,
  isDone,
  mIdx,
  lIdx,
  onSelectLesson
}) {
  return (
    <button
      onClick={() => onSelectLesson(mIdx, lIdx)}
      className={`w-full flex items-start gap-3 p-4 text-left transition-colors duration-150 ${
        isActive 
          ? 'bg-primary-500/10 border-l-2 border-primary-500' 
          : 'hover:bg-surface-800/50 border-l-2 border-transparent'
      }`}
    >
      <div className="pt-0.5 shrink-0">
        {isDone ? (
          <CheckCircle size={16} className="text-emerald-400 animate-fade-in" />
        ) : (
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isActive ? 'border-primary-500' : 'border-surface-600'}`}>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isActive ? 'text-surface-50 font-bold' : 'text-surface-300'} leading-tight truncate`}>
          {lesson.title}
        </p>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-surface-500 font-medium uppercase tracking-wider">
          <span className="flex items-center gap-1"><Play size={10} /> {lesson.duration || '10:00'}</span>
        </div>
      </div>
    </button>
  );
});

// ── Memoized Module Section ─────────────────────────────────
const ModuleSidebarSection = memo(function ModuleSidebarSection({
  module,
  mIdx,
  activeModuleIndex,
  activeLessonIndex,
  completedLessonsSet,
  onSelectLesson
}) {
  return (
    <div className="border-b border-surface-800/50">
      <div className="p-4 bg-surface-900/50">
        <h4 className="text-sm font-bold text-surface-200 truncate">
          Module {mIdx + 1}: {module.title}
        </h4>
      </div>
      <div>
        {module.lessons.map((lesson, lIdx) => {
          const isActive = activeModuleIndex === mIdx && activeLessonIndex === lIdx;
          const isDone = completedLessonsSet.has(lesson.id);
          
          return (
            <LessonSidebarItem
              key={lesson.id}
              lesson={lesson}
              isActive={isActive}
              isDone={isDone}
              mIdx={mIdx}
              lIdx={lIdx}
              onSelectLesson={onSelectLesson}
            />
          );
        })}
      </div>
    </div>
  );
});

// ── Memoized Syllabus Sidebar ───────────────────────────────
const CourseSidebar = memo(function CourseSidebar({
  modules,
  activeModuleIndex,
  activeLessonIndex,
  completedLessonsSet,
  completedInThisCourse,
  totalLessons,
  sidebarOpen,
  onSelectLesson
}) {
  return (
    <aside className={`absolute lg:static inset-y-0 right-0 w-80 bg-surface-900 border-l border-surface-800 z-10 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} flex flex-col`}>
      <div className="p-4 border-b border-surface-800 flex items-center justify-between">
        <h3 className="font-bold text-surface-50">Course Content</h3>
        <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-md border border-primary-500/20 font-mono">
          {completedInThisCourse}/{totalLessons}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {modules.map((mod, mIdx) => (
          <ModuleSidebarSection
            key={mod.id || mIdx}
            module={mod}
            mIdx={mIdx}
            activeModuleIndex={activeModuleIndex}
            activeLessonIndex={activeLessonIndex}
            completedLessonsSet={completedLessonsSet}
            onSelectLesson={onSelectLesson}
          />
        ))}
      </div>
    </aside>
  );
});

// ── Main Page Component ─────────────────────────────────────
export default function StudentCourseLearning() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for learning progress
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  
  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notEnrolled, setNotEnrolled] = useState(false);

  // In-flight and timeout safety refs
  const pendingTogglesRef = useRef(new Set());
  const autoAdvanceTimeoutRef = useRef(null);

  // Cleanup auto-advance timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await getCourse(courseId);
        if (!isMounted) return;
        setCourse(data);
        
        // Fetch actual user progress from backend
        if (user) {
          const userData = await getUser(user.id);
          if (!isMounted) return;
          setCompletedLessons(userData.completed_lessons || []);
          const enrolledList = userData.enrolled_courses || [];
          const isEnrolled = user.role === 'admin' || data.is_enrolled || enrolledList.includes(courseId) || enrolledList.includes(data.id) || enrolledList.includes(data.project_id);
          if (!isEnrolled) {
            setNotEnrolled(true);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load course", err);
        toast.error(err?.message || 'Failed to load course content');
        navigate('/student/courses');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCourse();

    return () => {
      isMounted = false;
    };
  }, [courseId, navigate, toast, user]);

  // Fast O(1) set for completed lessons
  const completedLessonsSet = useMemo(() => new Set(completedLessons), [completedLessons]);

  // Calculate Progress accurately for THIS course only
  const allCourseLessonIds = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules.flatMap(m => (m.lessons || []).map(l => l.id));
  }, [course]);

  const totalLessons = allCourseLessonIds.length;
  const completedInThisCourse = useMemo(() => {
    return allCourseLessonIds.filter(id => completedLessonsSet.has(id)).length;
  }, [allCourseLessonIds, completedLessonsSet]);

  const progressPercent = totalLessons > 0 ? Math.round((completedInThisCourse / totalLessons) * 100) : 0;

  const currentModule = course?.modules?.[activeModuleIndex];
  const currentLesson = currentModule?.lessons?.[activeLessonIndex];

  const hasNextLesson = useMemo(() => {
    if (!course?.modules) return false;
    return activeModuleIndex < course.modules.length - 1 || (currentModule?.lessons?.length && activeLessonIndex < currentModule.lessons.length - 1);
  }, [course, activeModuleIndex, activeLessonIndex, currentModule]);

  const hasPrevLesson = activeModuleIndex > 0 || activeLessonIndex > 0;

  // Memoized navigation callbacks
  const handleSelectLesson = useCallback((mIdx, lIdx) => {
    setActiveModuleIndex(mIdx);
    setActiveLessonIndex(lIdx);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (!course?.modules) return;
    const currMod = course.modules[activeModuleIndex];
    if (currMod && activeLessonIndex < currMod.lessons.length - 1) {
      setActiveLessonIndex(prev => prev + 1);
    } else if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex(prev => prev + 1);
      setActiveLessonIndex(0);
    }
  }, [course, activeModuleIndex, activeLessonIndex]);

  const handlePrev = useCallback(() => {
    if (!course?.modules) return;
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(prev => prev - 1);
    } else if (activeModuleIndex > 0) {
      setActiveModuleIndex(prev => prev - 1);
      const prevMod = course.modules[activeModuleIndex - 1];
      setActiveLessonIndex(prevMod?.lessons ? prevMod.lessons.length - 1 : 0);
    }
  }, [course, activeModuleIndex, activeLessonIndex]);

  // ── OPTIMISTIC COMPLETION TOGGLE ──
  const toggleComplete = useCallback(async (lessonId) => {
    if (!lessonId || !user?.id) return;
    
    // Prevent duplicated in-flight clicks for the exact same lesson
    if (pendingTogglesRef.current.has(lessonId)) return;
    pendingTogglesRef.current.add(lessonId);

    // 1. Snapshot previous state for instant rollback if API fails
    const previousCompleted = [...completedLessons];
    const isCurrentlyDone = previousCompleted.includes(lessonId);
    
    const optimisticNext = isCurrentlyDone
      ? previousCompleted.filter(id => id !== lessonId)
      : [...previousCompleted, lessonId];

    // 2. INSTANT OPTIMISTIC UI MUTATION (0ms Lag)
    setCompletedLessons(optimisticNext);

    try {
      const res = await toggleLessonComplete(user.id, lessonId);
      
      // Sync with definitive backend state
      if (res?.completed_lessons && Array.isArray(res.completed_lessons)) {
        setCompletedLessons(res.completed_lessons);
      }
      
      // Auto-advance if lesson was marked as complete
      if (!isCurrentlyDone && hasNextLesson) {
        if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
        toast.success('Lesson completed! Advancing to next...', { duration: 1800 });
        autoAdvanceTimeoutRef.current = setTimeout(() => {
          handleNext();
        }, 900);
      }
    } catch (err) {
      // 3. ROLLBACK ON NETWORK / SERVER ERROR
      setCompletedLessons(previousCompleted);
      toast.error(err?.message || 'Failed to save progress. Please try again.');
    } finally {
      pendingTogglesRef.current.delete(lessonId);
    }
  }, [user?.id, completedLessons, hasNextLesson, handleNext, toast]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full border-t-2 border-primary-500 animate-spin"></div>
        <p className="text-surface-400 font-mono text-sm tracking-widest uppercase animate-pulse">Loading Course Player...</p>
      </div>
    );
  }

  if (notEnrolled) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-surface-50 mb-2">Enrollment Required</h2>
        <p className="text-surface-400 text-sm max-w-md mb-6">
          You are not enrolled in this course. Please enroll in this course to access the lessons and materials.
        </p>
        <div className="flex gap-4">
          <Link to={`/courses/${courseId}`} className="px-6 py-3 rounded-xl gradient-primary text-surface-950 font-bold text-sm">
            View Course Details
          </Link>
          <Link to="/student/courses" className="px-6 py-3 rounded-xl bg-surface-800 border border-surface-700 text-surface-300 font-bold text-sm">
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const isCompleted = currentLesson ? completedLessonsSet.has(currentLesson.id) : false;

  return (
    <div className="flex flex-col h-screen bg-surface-950 overflow-hidden">
      <Helmet>
        <title>REAL_i Player | {course.title}</title>
      </Helmet>

      {/* ── Top Navigation Bar ── */}
      <CoursePlayerHeader
        courseTitle={course.title}
        lessonTitle={currentLesson?.title}
        progressPercent={progressPercent}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left/Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-surface-950 custom-scrollbar relative z-0">
          {currentLesson ? (
            <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
              
              {/* Video Player Card */}
              <VideoPlayerCard lesson={currentLesson} />

              {/* Lesson Details & Actions */}
              <LessonActionCard
                lesson={currentLesson}
                moduleTitle={currentModule?.title || ''}
                moduleIndex={activeModuleIndex}
                isCompleted={isCompleted}
                onToggleComplete={toggleComplete}
              />

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-surface-800">
                <button
                  onClick={handlePrev}
                  disabled={!hasPrevLesson}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-800 text-surface-300 font-medium hover:bg-surface-700 hover:text-surface-50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft size={16} /> Previous Lesson
                </button>
                <button
                  onClick={handleNext}
                  disabled={!hasNextLesson}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-800 text-surface-300 font-medium hover:bg-surface-700 hover:text-surface-50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                   Next Lesson <ChevronRight size={16} />
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-surface-500 font-bold mb-4">No content has been added to this course yet.</p>
              <Link to="/student/courses" className="px-6 py-2.5 bg-surface-800 rounded-xl text-surface-50 hover:bg-surface-700 transition-colors">
                Back to Dashboard
              </Link>
            </div>
          )}
        </main>

        {/* ── Right Sidebar (Syllabus) ── */}
        <CourseSidebar
          modules={course.modules || []}
          activeModuleIndex={activeModuleIndex}
          activeLessonIndex={activeLessonIndex}
          completedLessonsSet={completedLessonsSet}
          completedInThisCourse={completedInThisCourse}
          totalLessons={totalLessons}
          sidebarOpen={sidebarOpen}
          onSelectLesson={handleSelectLesson}
        />

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/50 z-0 lg:hidden"
            onClick={closeSidebar}
          ></div>
        )}
      </div>
    </div>
  );
}

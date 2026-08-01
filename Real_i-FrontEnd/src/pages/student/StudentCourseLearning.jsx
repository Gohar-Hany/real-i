import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCourse, getUser, toggleLessonComplete } from '@/services/api';
import { Play, CheckCircle, ChevronLeft, ChevronRight, Menu, X, BookOpen, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { Helmet } from 'react-helmet-async';

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

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await getCourse(courseId);
        
        // Use real backend data only
        setCourse(data);
        
        // Fetch actual user progress from backend
        if (user) {
          const userData = await getUser(user.id);
          setCompletedLessons(userData.completed_lessons || []);
        }
        
      } catch (err) {
        console.error("Failed to load course", err);
        toast.error('Failed to load course content');
        navigate('/student/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, navigate, toast, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full border-t-2 border-primary-500 animate-spin"></div>
        <p className="text-surface-400 font-mono text-sm tracking-widest uppercase animate-pulse">Loading Course Player...</p>
      </div>
    );
  }

  if (!course) return null;

  const currentModule = course.modules[activeModuleIndex];
  const currentLesson = currentModule?.lessons[activeLessonIndex];

  const hasNextLesson = activeModuleIndex < course.modules.length - 1 || activeLessonIndex < currentModule.lessons.length - 1;
  const hasPrevLesson = activeModuleIndex > 0 || activeLessonIndex > 0;

  const handleNext = () => {
    if (activeLessonIndex < currentModule.lessons.length - 1) {
      setActiveLessonIndex(prev => prev + 1);
    } else if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex(prev => prev + 1);
      setActiveLessonIndex(0);
    }
  };

  const handlePrev = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(prev => prev - 1);
    } else if (activeModuleIndex > 0) {
      setActiveModuleIndex(prev => prev - 1);
      setActiveLessonIndex(course.modules[activeModuleIndex - 1].lessons.length - 1);
    }
  };

  const toggleComplete = async (lessonId) => {
    try {
      const res = await toggleLessonComplete(user.id, lessonId);
      setCompletedLessons(res.completed_lessons);
      
      // Auto-advance if marking as complete (meaning it was just added to the array)
      if (res.completed_lessons.includes(lessonId) && hasNextLesson) {
        setTimeout(handleNext, 1000);
        toast.success('Lesson completed! Moving to next...', { duration: 2000 });
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to save progress');
    }
  };

  const isCompleted = currentLesson && completedLessons.includes(currentLesson.id);

  // Calculate Progress
  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const progressPercent = Math.round((completedLessons.length / totalLessons) * 100) || 0;

  return (
    <div className="flex flex-col h-screen bg-surface-950 overflow-hidden">
      <Helmet>
        <title>REAL_i Player | {course.title}</title>
      </Helmet>

      {/* ── Top Navigation Bar ── */}
      <header className="h-16 shrink-0 bg-surface-900 border-b border-surface-800 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
          <Link to="/student/courses" className="p-2 text-surface-400 hover:text-white bg-surface-800 rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white truncate max-w-md">{course.title}</h1>
            <p className="text-xs text-primary-400">{currentLesson?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress Bar */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-32 h-2 bg-surface-800 rounded-full overflow-hidden">
              <div 
                className="h-full gradient-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-surface-300">{progressPercent}%</span>
          </div>

          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-white bg-surface-800 rounded-lg">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left/Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-surface-950 custom-scrollbar relative z-0">
          {currentLesson ? (
            <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
              
              {/* Video Player Placeholder */}
              <div className="w-full aspect-video bg-black rounded-2xl border border-surface-800 overflow-hidden relative group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                
                {/* Fake video background */}
                <div className="absolute inset-0 bg-surface-900 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                  <div className="w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] absolute"></div>
                  <button className="w-20 h-20 bg-primary-500 rounded-full text-surface-950 flex items-center justify-center z-10 shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-110 transition-transform">
                    <Play size={32} className="ml-1" />
                  </button>
                </div>

                {/* Player Controls Placeholder */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0">
                  <div className="flex items-center gap-4 text-white">
                    <Play size={20} className="hover:text-primary-400 cursor-pointer" />
                    <span className="text-xs font-mono">02:14 / {currentLesson.duration}</span>
                  </div>
                  <div className="w-full max-w-md mx-4 h-1 bg-surface-600 rounded-full cursor-pointer relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <Settings size={18} className="hover:text-primary-400 cursor-pointer" />
                    <Maximize size={18} className="hover:text-primary-400 cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Lesson Details & Actions */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-surface-900/60 p-6 rounded-2xl border border-surface-800">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{currentLesson.title}</h2>
                  <p className="text-sm text-surface-400 flex items-center gap-2">
                    <BookOpen size={14} /> Module {activeModuleIndex + 1}: {currentModule.title}
                  </p>
                </div>
                
                <button
                  onClick={() => toggleComplete(currentLesson.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shrink-0 ${
                    isCompleted 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                      : 'gradient-primary text-surface-950 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                  }`}
                >
                  <CheckCircle size={18} className={isCompleted ? 'text-emerald-400' : 'text-surface-950'} />
                  {isCompleted ? 'Completed' : 'Mark as Complete'}
                </button>
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-surface-800">
                <button
                  onClick={handlePrev}
                  disabled={!hasPrevLesson}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-800 text-surface-300 font-medium hover:bg-surface-700 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft size={16} /> Previous Lesson
                </button>
                <button
                  onClick={handleNext}
                  disabled={!hasNextLesson}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-800 text-surface-300 font-medium hover:bg-surface-700 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                   Next Lesson <ChevronRight size={16} />
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-surface-500 font-bold mb-4">No content has been added to this course yet.</p>
              <Link to="/student/courses" className="px-6 py-2.5 bg-surface-800 rounded-xl text-white hover:bg-surface-700 transition-colors">
                Back to Dashboard
              </Link>
            </div>
          )}
        </main>

        {/* ── Right Sidebar (Syllabus) ── */}
        <aside className={`absolute lg:static inset-y-0 right-0 w-80 bg-surface-900 border-l border-surface-800 z-10 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} flex flex-col`}>
          <div className="p-4 border-b border-surface-800 flex items-center justify-between">
            <h3 className="font-bold text-white">Course Content</h3>
            <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-2 py-1 rounded-md">
              {completedLessons.length}/{totalLessons}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {course.modules.map((mod, mIdx) => (
              <div key={mod.id} className="border-b border-surface-800/50">
                <div className="p-4 bg-surface-900/50">
                  <h4 className="text-sm font-bold text-surface-200">
                    Module {mIdx + 1}: {mod.title}
                  </h4>
                </div>
                <div>
                  {mod.lessons.map((lesson, lIdx) => {
                    const isActive = activeModuleIndex === mIdx && activeLessonIndex === lIdx;
                    const isDone = completedLessons.includes(lesson.id);
                    
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setActiveModuleIndex(mIdx);
                          setActiveLessonIndex(lIdx);
                          if(window.innerWidth < 1024) setSidebarOpen(false); // close on mobile
                        }}
                        className={`w-full flex items-start gap-3 p-4 text-left transition-colors ${
                          isActive 
                            ? 'bg-primary-500/10 border-l-2 border-primary-500' 
                            : 'hover:bg-surface-800/50 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          {isDone ? (
                            <CheckCircle size={16} className="text-emerald-500" />
                          ) : (
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-primary-500' : 'border-surface-600'}`}>
                              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${isActive ? 'text-white font-bold' : 'text-surface-300'} leading-tight`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-surface-500 font-medium uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Play size={10} /> {lesson.duration}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/50 z-0 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
}

function Settings({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  );
}

function Maximize({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
  );
}

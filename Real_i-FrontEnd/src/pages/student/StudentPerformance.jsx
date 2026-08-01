import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCompletedQuizzes, getCourses, getAssignedQuizzes, getMySubmissions } from '@/services/api';
import {
  Trophy, BrainCircuit, BookOpen,
  CheckCircle, XCircle, Clock, ChevronRight,
  BarChart3, FileText, Sparkles, GraduationCap,
  ChevronDown, AlertCircle
} from 'lucide-react';

export default function StudentPerformance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch completed quizzes
        try {
          const res = await getCompletedQuizzes(user?.id);
          const completed = res?.completed_tasks || res?.results || [];
          setCompletedQuizzes(Array.isArray(completed) ? completed : []);
        } catch {
          setCompletedQuizzes([]);
        }

        // Fetch assigned quizzes from courses
        try {
          const courses = await getCourses();
          let allQuizzes = [];
          for (const c of courses) {
            try {
              const quizzes = await getAssignedQuizzes(c.project_id || c.id);
              if (quizzes?.length > 0) allQuizzes.push(...quizzes);
            } catch { /* skip */ }
          }
          setAssignedQuizzes(allQuizzes);
        } catch {
          setAssignedQuizzes([]);
        }

        // Fetch assignment submissions
        try {
          const subs = await getMySubmissions();
          setSubmissions(Array.isArray(subs) ? subs : []);
        } catch {
          setSubmissions([]);
        }

        // Fetch courses for progress tab
        try {
          const courseList = await getCourses();
          const progress = (Array.isArray(courseList) ? courseList : []).map(c => ({
            id: c.project_id || c.id,
            title: c.title || c.project_id,
            progress: 0,
            lessonsCompleted: 0,
            totalLessons: c.lessons_count || 0,
            grade: '-',
            lastAccessed: 'Recently',
          }));
          setCourseProgress(progress);
        } catch {
          setCourseProgress([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);



  // ── Calculated Stats ──
  const totalQuizzes = completedQuizzes.length;
  const avgQuizScore = totalQuizzes > 0
    ? Math.round(completedQuizzes.reduce((acc, r) => acc + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) / totalQuizzes)
    : 0;
  const bestQuizScore = totalQuizzes > 0
    ? Math.max(...completedQuizzes.map(r => r.total > 0 ? Math.round((r.score / r.total) * 100) : 0))
    : 0;

  const gradedSubmissions = submissions.filter(s => s.percentage != null || s.score != null);
  const avgAssignmentGrade = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((acc, s) => acc + (s.percentage || (s.score && s.total_marks ? (s.score / s.total_marks) * 100 : 0)), 0) / gradedSubmissions.length)
    : 0;
  const submittedCount = submissions.length;
  const pendingCount = submissions.filter(s => s.status === 'submitted').length;

  const overallAvg = avgQuizScore && avgAssignmentGrade
    ? Math.round((avgQuizScore + avgAssignmentGrade) / 2)
    : avgQuizScore || avgAssignmentGrade || 0;


  const getLetterGrade = (pct) => {
    if (pct >= 93) return 'A';
    if (pct >= 90) return 'A-';
    if (pct >= 87) return 'B+';
    if (pct >= 83) return 'B';
    if (pct >= 80) return 'B-';
    if (pct >= 77) return 'C+';
    if (pct >= 73) return 'C';
    if (pct >= 70) return 'C-';
    if (pct >= 60) return 'D';
    return 'F';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'quizzes', label: 'Quizzes', icon: BrainCircuit },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'courses', label: 'Course Progress', icon: BookOpen },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-surface-400 uppercase tracking-widest">Loading Your Report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10">
      {/* ── Page Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-900 border border-surface-700/50 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]"></div>

        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-surface-950 text-3xl font-extrabold shadow-[0_0_30px_rgba(212,175,55,0.3)] shrink-0">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-3 backdrop-blur-md">
                  <Sparkles size={12} className="text-primary-400" />
                  <span className="text-[10px] font-mono font-bold text-primary-400 uppercase tracking-widest">Academic Report</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                  My Performance Report
                </h1>
                <p className="text-surface-400 text-sm">
                  Track your academic progress across all courses and assessments.
                </p>
              </div>
            </div>

            {/* GPA Circle */}
            <div className="flex items-center gap-6 shrink-0">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-1">Current GPA</p>
                <p className="text-4xl font-black text-white">{getLetterGrade(overallAvg)}</p>
              </div>
              <div className="w-24 h-24 relative">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-surface-800" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${overallAvg}, 100`} className="text-primary-500" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-white">{overallAvg}%</span>
                  <span className="text-[8px] uppercase tracking-widest text-surface-400 font-bold">Average</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BrainCircuit, label: 'Quizzes Passed', value: totalQuizzes, sub: `Best: ${bestQuizScore}%`, color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'group-hover:border-primary-500/30' },
          { icon: FileText, label: 'Submissions', value: `${submittedCount}`, sub: `${pendingCount} Pending`, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'group-hover:border-emerald-500/30' },
          { icon: Trophy, label: 'Quiz Average', value: `${avgQuizScore}%`, sub: getLetterGrade(avgQuizScore), color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'group-hover:border-amber-500/30' },
          { icon: BookOpen, label: 'Courses Enrolled', value: courseProgress.length, sub: 'Active Learning', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'group-hover:border-rose-500/30' },
        ].map((s, i) => (
          <div key={i} className={`glass-card rounded-2xl p-5 flex flex-col justify-center gap-3 transition-all duration-300 hover:-translate-y-1 group ${s.border}`}>
            <div className="flex items-center justify-between">
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                <s.icon size={20} className={s.color} />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">{s.value}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-surface-300 uppercase tracking-wider">{s.label}</p>
              <p className="text-[10px] text-surface-500 font-medium mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-surface-900/60 border border-surface-700/50 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'gradient-primary text-surface-950 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                : 'text-surface-400 hover:text-white hover:bg-surface-800/50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="animate-fade-in">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Grade Distribution */}
            <div className="lg:col-span-2 glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
              <div className="p-6 border-b border-surface-800 bg-surface-900/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                  <BarChart3 size={20} className="text-primary-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Grade Summary</h3>
                  <p className="text-[11px] text-surface-400">Performance across all assessments</p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                {[
                  { label: 'Quiz Performance', value: avgQuizScore, count: `${totalQuizzes} completed`, color: 'primary' },
                  { label: 'Assignment Grades', value: avgAssignmentGrade, count: `${gradedSubmissions.length} graded`, color: 'emerald' },
                  { label: 'Overall Average', value: overallAvg, count: `Grade: ${getLetterGrade(overallAvg)}`, color: 'amber' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-bold text-white">{item.label}</span>
                        <span className="text-[10px] text-surface-500 ml-2">({item.count})</span>
                      </div>
                      <span className={`text-sm font-black text-${item.color === 'primary' ? 'primary' : item.color}-400`}>{item.value}%</span>
                    </div>
                    <div className="w-full h-3 bg-surface-800 rounded-full overflow-hidden border border-surface-700">
                      <div
                        className={`h-full rounded-full relative ${item.color === 'primary' ? 'bg-gradient-to-r from-primary-600 to-primary-400' : item.color === 'emerald' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-amber-600 to-amber-400'}`}
                        style={{ width: `${item.value}%`, transition: 'width 1s ease-out' }}
                      >
                        <div className="absolute top-0 right-0 w-6 h-full bg-white/20 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
              <div className="p-6 border-b border-surface-800 bg-surface-900/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <Clock size={20} className="text-rose-400" />
                </div>
                <h3 className="text-base font-bold text-white">Upcoming</h3>
              </div>
              <div className="p-4 space-y-3">
                {submissions.filter(s => s.status === 'submitted').length === 0 && (
                  <p className="text-surface-500 text-xs italic px-1">No pending submissions.</p>
                )}
                {submissions.filter(s => s.status === 'submitted').map(s => (
                  <div key={s.id || s._id} className="p-4 rounded-2xl bg-surface-800/40 border border-surface-700">
                    <p className="text-sm font-bold text-white mb-1">{s.assessment_title || 'Assessment'}</p>
                    <p className="text-[11px] text-surface-500 mb-2">Awaiting grade</p>
                    <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold">
                      <Clock size={12} />
                      Submitted: {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                ))}
                {assignedQuizzes.length > 0 && (
                  <div className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <BrainCircuit size={14} className="text-primary-400" />
                      <p className="text-sm font-bold text-primary-400">{assignedQuizzes.length} Quiz(es) Assigned</p>
                    </div>
                    <Link to="/student/quiz" className="text-[11px] text-primary-300 hover:underline flex items-center gap-1 mt-1">
                      Go to Quizzes <ChevronRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Course Progress Overview */}
            <div className="lg:col-span-3 glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
              <div className="p-6 border-b border-surface-800 bg-surface-900/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <GraduationCap size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Enrolled Courses</h3>
                    <p className="text-[11px] text-surface-400">Your active learning tracks</p>
                  </div>
                </div>
                <Link to="/student/courses" className="text-xs text-blue-400 font-bold hover:text-blue-300 flex items-center gap-1 uppercase tracking-wider">
                  View All <ChevronRight size={14} />
                </Link>
              </div>
              <div className="p-6 grid sm:grid-cols-3 gap-4">
                {courseProgress.length === 0 && <p className="col-span-3 text-surface-500 text-xs italic">No courses enrolled yet.</p>}
                {courseProgress.slice(0, 3).map(c => (
                  <div key={c.id} className="p-5 rounded-2xl bg-surface-800/40 border border-surface-700 hover:bg-surface-800/60 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{c.title}</span>
                      <span className="text-lg font-black text-blue-400">{c.grade}</span>
                    </div>
                    <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden border border-surface-700 mb-3">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" style={{ width: `${c.progress}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-surface-500 font-bold uppercase tracking-wider">
                      <span>{c.lessonsCompleted}/{c.totalLessons} Lessons</span>
                      <span>{c.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* QUIZZES TAB */}
        {activeTab === 'quizzes' && (
          <div className="space-y-4">
            {completedQuizzes.length === 0 ? (
              <div className="py-16 text-center glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60">
                <AlertCircle size={40} className="text-surface-600 mx-auto mb-4" />
                <p className="text-lg font-bold text-white mb-1">No Quizzes Completed Yet</p>
                <p className="text-sm text-surface-400 mb-6">Start taking quizzes to see your performance here.</p>
                <Link to="/student/quiz" className="inline-flex items-center gap-2 px-6 py-3 gradient-primary rounded-xl text-surface-950 text-sm font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                  <BrainCircuit size={18} /> Take a Quiz
                </Link>
              </div>
            ) : (
              completedQuizzes.map((result, idx) => {
                const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
                const isExpanded = expandedQuiz === idx;
                const answersArr = result.answers
                  ? Object.keys(result.answers).sort((a, b) => parseInt(a) - parseInt(b)).map(k => result.answers[k])
                  : [];
                const passed = pct >= 60;

                return (
                  <div key={idx} className="glass-card rounded-2xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
                    <button
                      onClick={() => setExpandedQuiz(isExpanded ? null : idx)}
                      className="w-full flex items-center justify-between p-5 hover:bg-surface-800/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${passed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                          <span className={`text-lg font-black ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>{pct}%</span>
                        </div>
                        <div>
                          <p className="text-base font-bold text-white mb-1">Quiz #{result.task_id || (idx + 1)}</p>
                          <div className="flex items-center gap-3 text-[11px] font-bold text-surface-400">
                            <span className={passed ? 'text-emerald-400' : 'text-rose-400'}>{result.score}/{result.total} Correct</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                              {passed ? 'PASSED' : 'FAILED'}
                            </span>
                            {result.completed_at && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-surface-600"></span>
                                <span className="flex items-center gap-1"><Clock size={11} /> {result.completed_at}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-primary-500/20 text-primary-400 rotate-180' : 'bg-surface-800 text-surface-400'}`}>
                        <ChevronDown size={18} />
                      </div>
                    </button>

                    {isExpanded && answersArr.length > 0 && (
                      <div className="border-t border-surface-700 p-5 space-y-3 bg-surface-950/30">
                        {answersArr.map((a, qi) => (
                          <div key={qi} className={`p-4 rounded-xl border ${a.isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${a.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                {a.isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white mb-2">
                                  <span className="text-surface-500 font-mono mr-2">Q{qi + 1}.</span>
                                  {a.question}
                                </p>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {!a.isCorrect && (
                                    <div className="p-2.5 rounded-lg bg-surface-950/50 border border-surface-800">
                                      <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-1">Your Answer</p>
                                      <p className="text-xs text-rose-400 font-medium">{a.selectedText || a.selected}</p>
                                    </div>
                                  )}
                                  <div className={`p-2.5 rounded-lg bg-surface-950/50 border border-surface-800 ${a.isCorrect ? 'sm:col-span-2' : ''}`}>
                                    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-1">Correct Answer</p>
                                    <p className="text-xs text-emerald-400 font-medium">{a.correctText || a.correct}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
          <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700/80 bg-surface-900/80">
                    <th className="text-left px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest">Assignment</th>
                    <th className="text-left px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest hidden md:table-cell">Course</th>
                    <th className="text-left px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest hidden sm:table-cell">Due Date</th>
                    <th className="text-center px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest">Status</th>
                    <th className="text-right px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/50">
                  {submissions.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-surface-500 text-sm">No submissions yet.</td></tr>
                  )}
                  {submissions.map(s => (
                    <tr key={s.id || s._id} className="hover:bg-surface-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{s.assessment_title || 'Assessment'}</p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-surface-400 text-xs">{s.course_title || '—'}</span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-surface-400 text-xs font-mono">{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '—'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          s.status === 'graded' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                          s.status === 'submitted' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                          'bg-surface-800 border border-surface-700 text-surface-400'
                        }`}>
                          {s.status === 'graded' && <CheckCircle size={12} />}
                          {s.status === 'submitted' && <Clock size={12} />}
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {s.score != null ? (
                          <span className="text-lg font-black text-white">{s.score}<span className="text-surface-500 text-xs font-medium">/{s.total_marks || 100}</span></span>
                        ) : s.percentage != null ? (
                          <span className="text-lg font-black text-white">{s.percentage}%</span>
                        ) : (
                          <span className="text-surface-500 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COURSES TAB */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            {courseProgress.length === 0 && <p className="text-surface-500 text-sm italic">No courses enrolled yet.</p>}
            {courseProgress.map(c => (
              <div key={c.id} className="glass-card rounded-2xl border border-surface-700/50 bg-surface-900/60 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{c.title}</h3>
                    <p className="text-[11px] text-surface-500">Last accessed: {c.lastAccessed}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-black text-blue-400">{c.grade}</p>
                      <p className="text-[9px] text-surface-500 uppercase tracking-widest font-bold">Grade</p>
                    </div>
                    <div className="w-16 h-16 relative">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-800" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${c.progress}, 100`} className="text-blue-400" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-black text-white">{c.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden border border-surface-700">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full relative" style={{ width: `${c.progress}%` }}>
                    <div className="absolute top-0 right-0 w-4 h-full bg-white/20 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-[11px] text-surface-500 font-medium">
                  <span>{c.lessonsCompleted} of {c.totalLessons} lessons completed</span>
                  <span>{c.totalLessons - c.lessonsCompleted} lessons remaining</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

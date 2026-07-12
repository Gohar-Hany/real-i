import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCompletedQuizzes, getProjects, getAssignedQuizzes } from '@/services/api';
import { useToast } from '@/components/common/Toast';
import { COURSES } from '@/data/mockData';
import {
  Target, TrendingUp, Trophy, Award, BrainCircuit, BookOpen,
  CheckCircle, XCircle, Clock, Calendar, ChevronRight, Flame,
  BarChart3, FileText, Star, ArrowUpRight, Sparkles, GraduationCap,
  ChevronDown, AlertCircle
} from 'lucide-react';

// Mock data for sections the backend doesn't support yet
const MOCK_ASSIGNMENTS = [
  { id: 1, title: 'Build a Linear Regression Model', course: 'AI Fundamentals', grade: 95, maxGrade: 100, status: 'graded', dueDate: '2026-07-01', submittedOn: '2026-06-30' },
  { id: 2, title: 'CNN Image Classifier Project', course: 'Deep Learning Mastery', grade: 88, maxGrade: 100, status: 'graded', dueDate: '2026-07-05', submittedOn: '2026-07-04' },
  { id: 3, title: 'Sentiment Analysis Pipeline', course: 'NLP Course', grade: null, maxGrade: 100, status: 'submitted', dueDate: '2026-07-15', submittedOn: '2026-07-11' },
  { id: 4, title: 'RAG System Implementation', course: 'RAG Systems', grade: null, maxGrade: 100, status: 'pending', dueDate: '2026-07-20', submittedOn: null },
  { id: 5, title: 'Data Visualization Dashboard', course: 'Data Science Bootcamp', grade: 72, maxGrade: 100, status: 'graded', dueDate: '2026-06-25', submittedOn: '2026-06-24' },
];

const MOCK_COURSE_PROGRESS = [
  { id: 'ai-fundamentals', title: 'AI Fundamentals', progress: 78, lessonsCompleted: 25, totalLessons: 32, grade: 'A', lastAccessed: '2 hours ago' },
  { id: 'deep-learning', title: 'Deep Learning Mastery', progress: 45, lessonsCompleted: 25, totalLessons: 56, grade: 'B+', lastAccessed: '1 day ago' },
  { id: 'data-science', title: 'Data Science Bootcamp', progress: 92, lessonsCompleted: 44, totalLessons: 48, grade: 'A+', lastAccessed: '5 hours ago' },
];

export default function StudentPerformance() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch completed quizzes
      try {
        const res = await getCompletedQuizzes(user?.id);
        const completed = res?.completed_tasks || res?.results || [];
        setCompletedQuizzes(Array.isArray(completed) ? completed : []);
      } catch (e) {
        setCompletedQuizzes([]);
      }

      // Fetch assigned quizzes
      try {
        const projects = await getProjects();
        let allQuizzes = [];
        for (const p of projects) {
          try {
            const quizzes = await getAssignedQuizzes(p.project_id);
            if (quizzes?.length > 0) allQuizzes.push(...quizzes);
          } catch (e) { /* skip */ }
        }
        setAssignedQuizzes(allQuizzes);
      } catch (e) {
        setAssignedQuizzes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Calculated Stats ──
  const totalQuizzes = completedQuizzes.length;
  const avgQuizScore = totalQuizzes > 0
    ? Math.round(completedQuizzes.reduce((acc, r) => acc + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) / totalQuizzes)
    : 0;
  const bestQuizScore = totalQuizzes > 0
    ? Math.max(...completedQuizzes.map(r => r.total > 0 ? Math.round((r.score / r.total) * 100) : 0))
    : 0;

  const gradedAssignments = MOCK_ASSIGNMENTS.filter(a => a.grade !== null);
  const avgAssignmentGrade = gradedAssignments.length > 0
    ? Math.round(gradedAssignments.reduce((acc, a) => acc + a.grade, 0) / gradedAssignments.length)
    : 0;
  const submittedCount = MOCK_ASSIGNMENTS.filter(a => a.status !== 'pending').length;
  const pendingCount = MOCK_ASSIGNMENTS.filter(a => a.status === 'pending').length;

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
          { icon: FileText, label: 'Assignments', value: `${submittedCount}/${MOCK_ASSIGNMENTS.length}`, sub: `${pendingCount} Pending`, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'group-hover:border-emerald-500/30' },
          { icon: Trophy, label: 'Quiz Average', value: `${avgQuizScore}%`, sub: getLetterGrade(avgQuizScore), color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'group-hover:border-amber-500/30' },
          { icon: Flame, label: 'Study Streak', value: '7 Days', sub: 'Personal Best!', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'group-hover:border-rose-500/30' },
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
                  { label: 'Assignment Grades', value: avgAssignmentGrade, count: `${gradedAssignments.length} graded`, color: 'emerald' },
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
                {MOCK_ASSIGNMENTS.filter(a => a.status === 'pending').map(a => (
                  <div key={a.id} className="p-4 rounded-2xl bg-surface-800/40 border border-surface-700">
                    <p className="text-sm font-bold text-white mb-1">{a.title}</p>
                    <p className="text-[11px] text-surface-500 mb-2">{a.course}</p>
                    <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-bold">
                      <Calendar size={12} />
                      Due: {a.dueDate}
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
                {MOCK_COURSE_PROGRESS.map(c => (
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
                  {MOCK_ASSIGNMENTS.map(a => (
                    <tr key={a.id} className="hover:bg-surface-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{a.title}</p>
                        <p className="text-[11px] text-surface-500 md:hidden mt-0.5">{a.course}</p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-surface-400 text-xs">{a.course}</span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-surface-400 text-xs font-mono">{a.dueDate}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          a.status === 'graded' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                          a.status === 'submitted' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                          'bg-surface-800 border border-surface-700 text-surface-400'
                        }`}>
                          {a.status === 'graded' && <CheckCircle size={12} />}
                          {a.status === 'submitted' && <Clock size={12} />}
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {a.grade !== null ? (
                          <span className="text-lg font-black text-white">{a.grade}<span className="text-surface-500 text-xs font-medium">/{a.maxGrade}</span></span>
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
            {MOCK_COURSE_PROGRESS.map(c => (
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

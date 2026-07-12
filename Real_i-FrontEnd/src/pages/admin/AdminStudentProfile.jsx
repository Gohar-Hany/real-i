import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, getUserResults, updateUserRole } from '@/services/api';
import { useToast } from '@/components/common/Toast';
import {
  ChevronLeft, Shield, GraduationCap, Mail, Calendar, Clock,
  Target, TrendingUp, Trophy, Award, BrainCircuit, BarChart3,
  CheckCircle, XCircle, ChevronDown, UserCircle, AlertTriangle,
  FileText, BookOpen, ArrowUpRight, ArrowDownRight, Star,
  Ban, ShieldCheck, Download, MoreHorizontal, Flame, Eye
} from 'lucide-react';

const SUPER_ADMIN_EMAIL = 'goharhany@gmail.com';

// Mock data — ready to be replaced with real API
const MOCK_STUDENT_ASSIGNMENTS = [
  { id: 1, title: 'Build a Linear Regression Model', course: 'AI Fundamentals', grade: 95, maxGrade: 100, status: 'graded', submittedOn: '2026-06-30' },
  { id: 2, title: 'CNN Image Classifier', course: 'Deep Learning', grade: 88, maxGrade: 100, status: 'graded', submittedOn: '2026-07-04' },
  { id: 3, title: 'Sentiment Analysis Pipeline', course: 'NLP Course', grade: null, maxGrade: 100, status: 'submitted', submittedOn: '2026-07-11' },
  { id: 4, title: 'RAG System Implementation', course: 'RAG Systems', grade: null, maxGrade: 100, status: 'pending', submittedOn: null },
  { id: 5, title: 'Data Visualization Dashboard', course: 'Data Science', grade: 72, maxGrade: 100, status: 'graded', submittedOn: '2026-06-24' },
];

const MOCK_ENROLLED_COURSES = [
  { name: 'AI Fundamentals', progress: 78, grade: 'A', enrolledOn: '2026-05-01' },
  { name: 'Deep Learning Mastery', progress: 45, grade: 'B+', enrolledOn: '2026-05-15' },
  { name: 'Data Science Bootcamp', progress: 92, grade: 'A+', enrolledOn: '2026-04-20' },
];

const MOCK_ACTIVITY_LOG = [
  { action: 'Completed Quiz', detail: 'AI Fundamentals — Neural Networks', time: '2 hours ago', type: 'success' },
  { action: 'Submitted Assignment', detail: 'Sentiment Analysis Pipeline', time: '1 day ago', type: 'info' },
  { action: 'Started Course', detail: 'RAG Systems & Vector Databases', time: '3 days ago', type: 'info' },
  { action: 'Failed Quiz', detail: 'Deep Learning — Backpropagation', time: '5 days ago', type: 'danger' },
  { action: 'Achieved 95%', detail: 'Data Science — Pandas Assignment', time: '1 week ago', type: 'success' },
];

export default function AdminStudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [student, setStudent] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [showActions, setShowActions] = useState(false);

  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const users = await getUsers();
      const found = users.find(u => u.id === id);
      setStudent(found || null);

      if (found) {
        try {
          const data = await getUserResults(found.id);
          const results = data?.results || [];
          setQuizResults(Array.isArray(results) ? results : []);
        } catch (e) {
          setQuizResults([]);
        }
      }
    } catch (err) {
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole) => {
    try {
      await updateUserRole(student.id, newRole);
      setStudent(prev => ({ ...prev, role: newRole }));
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-surface-400 uppercase tracking-widest">Loading Dossier...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-16 text-center">
        <div className="w-20 h-20 bg-surface-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-surface-700">
          <UserCircle size={32} className="text-surface-500" />
        </div>
        <p className="text-lg font-bold text-white mb-1">Student Not Found</p>
        <p className="text-sm text-surface-400 mb-6">This user may have been removed.</p>
        <button onClick={() => navigate('/admin/students')} className="px-6 py-3 gradient-primary rounded-xl text-surface-950 text-sm font-bold">
          Return to Directory
        </button>
      </div>
    );
  }

  // ── Calculated Stats ──
  const totalQuizzes = quizResults.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(quizResults.reduce((acc, r) => acc + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) / totalQuizzes)
    : 0;
  const bestScore = totalQuizzes > 0
    ? Math.max(...quizResults.map(r => r.total > 0 ? Math.round((r.score / r.total) * 100) : 0))
    : 0;
  const worstScore = totalQuizzes > 0
    ? Math.min(...quizResults.map(r => r.total > 0 ? Math.round((r.score / r.total) * 100) : 0))
    : 0;
  const passRate = totalQuizzes > 0
    ? Math.round(quizResults.filter(r => r.total > 0 && (r.score / r.total) * 100 >= 60).length / totalQuizzes * 100)
    : 0;

  const gradedAssignments = MOCK_STUDENT_ASSIGNMENTS.filter(a => a.grade !== null);
  const avgAssignmentGrade = gradedAssignments.length > 0
    ? Math.round(gradedAssignments.reduce((acc, a) => acc + a.grade, 0) / gradedAssignments.length)
    : 0;

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'quizzes', label: `Quizzes (${totalQuizzes})` },
    { id: 'assignments', label: `Assignments (${MOCK_STUDENT_ASSIGNMENTS.length})` },
    { id: 'courses', label: 'Courses' },
    { id: 'activity', label: 'Activity Log' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10">
      {/* ── Back Button ── */}
      <button
        onClick={() => navigate('/admin/students')}
        className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors text-sm font-bold group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Student Directory
      </button>

      {/* ── Student Profile Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-900 border border-surface-700/50 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-primary-500 to-emerald-500"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-500/5 rounded-full blur-[120px]"></div>

        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            {/* Student Info */}
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-surface-950 text-3xl font-extrabold shadow-[0_0_30px_rgba(212,175,55,0.3)] shrink-0">
                {student.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{student.name}</h1>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    student.role === 'admin' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {student.role === 'admin' ? <Shield size={12} /> : <GraduationCap size={12} />}
                    {student.role}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-surface-400">
                  <span className="flex items-center gap-1.5 font-mono text-xs bg-surface-800 px-3 py-1 rounded-lg border border-surface-700">
                    <Mail size={12} className="text-primary-400" /> {student.email}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <Calendar size={12} /> Joined: Jan 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {isSuperAdmin && student.email !== SUPER_ADMIN_EMAIL && (
                <>
                  {student.role === 'student' ? (
                    <button
                      onClick={() => handleRoleChange('admin')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 text-xs font-bold transition-all active:scale-95"
                    >
                      <ShieldCheck size={16} /> Promote to Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRoleChange('student')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 text-xs font-bold transition-all active:scale-95"
                    >
                      <GraduationCap size={16} /> Demote to Student
                    </button>
                  )}
                </>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center hover:bg-surface-700 transition-colors"
                >
                  <MoreHorizontal size={18} className="text-surface-400" />
                </button>
                {showActions && (
                  <div className="absolute right-0 top-12 w-52 bg-surface-900 border border-surface-700 rounded-xl shadow-2xl z-50 py-2 animate-fade-in">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800 hover:text-white transition-colors">
                      <Download size={14} /> Export Report
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800 hover:text-white transition-colors">
                      <Mail size={14} /> Send Message
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800 hover:text-white transition-colors">
                      <Eye size={14} /> View as Student
                    </button>
                    <div className="border-t border-surface-700 my-1"></div>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors">
                      <Ban size={14} /> Suspend Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: BrainCircuit, label: 'Quizzes', value: totalQuizzes, color: '#D4AF37' },
          { icon: TrendingUp, label: 'Avg Score', value: `${avgScore}%`, color: '#10B981' },
          { icon: Trophy, label: 'Best Score', value: `${bestScore}%`, color: '#F59E0B' },
          { icon: Target, label: 'Pass Rate', value: `${passRate}%`, color: '#3B82F6' },
          { icon: FileText, label: 'Assignments', value: `${gradedAssignments.length}/${MOCK_STUDENT_ASSIGNMENTS.length}`, color: '#8B5CF6' },
        ].map((s, i) => (
          <div
            key={i}
            className="relative glass-card rounded-2xl p-5 bg-surface-900/60 border border-surface-700/50 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            style={{ boxShadow: `0 4px 30px ${s.color}08` }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${s.color} 0%, transparent 70%)` }}
            ></div>
            <div className="relative z-10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-lg border"
                style={{ background: `linear-gradient(135deg, ${s.color}20, ${s.color}05)`, borderColor: `${s.color}40` }}
              >
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-extrabold text-white tracking-tight">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section Navigation ── */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-900/60 border border-surface-700/50 overflow-x-auto">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSection === s.id
                ? 'bg-surface-800 text-white border border-surface-600 shadow-lg'
                : 'text-surface-400 hover:text-white hover:bg-surface-800/30'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Section Content ── */}
      <div className="animate-fade-in">
        {/* OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Performance Breakdown */}
            <div className="lg:col-span-2 glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
              <div className="p-6 border-b border-surface-800 bg-surface-900/80">
                <h3 className="text-base font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                    <BarChart3 size={16} className="text-primary-400" />
                  </div>
                  Performance Breakdown
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {[
                  { label: 'Quiz Average', value: avgScore, benchmark: 75, color: 'primary' },
                  { label: 'Assignment Average', value: avgAssignmentGrade, benchmark: 80, color: 'emerald' },
                  { label: 'Pass Rate', value: passRate, benchmark: 70, color: 'blue' },
                ].map((item, i) => {
                  const aboveBenchmark = item.value >= item.benchmark;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">{item.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-surface-500">Benchmark: {item.benchmark}%</span>
                          <div className={`flex items-center gap-1 text-xs font-bold ${aboveBenchmark ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {aboveBenchmark ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {Math.abs(item.value - item.benchmark)}%
                          </div>
                          <span className={`text-sm font-black text-${item.color === 'primary' ? 'primary' : item.color}-400`}>{item.value}%</span>
                        </div>
                      </div>
                      <div className="relative w-full h-3 bg-surface-800 rounded-full overflow-hidden border border-surface-700">
                        <div
                          className={`h-full rounded-full ${item.color === 'primary' ? 'bg-gradient-to-r from-primary-600 to-primary-400' : item.color === 'emerald' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}
                          style={{ width: `${item.value}%`, transition: 'width 1s ease-out' }}
                        ></div>
                        {/* Benchmark line */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-surface-300/50"
                          style={{ left: `${item.benchmark}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}

                {/* Lowest / Highest */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-700/50">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-1">Highest Quiz Score</p>
                    <p className="text-2xl font-black text-emerald-400">{bestScore}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/15">
                    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-1">Lowest Quiz Score</p>
                    <p className="text-2xl font-black text-rose-400">{worstScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Log Sidebar */}
            <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
              <div className="p-6 border-b border-surface-800 bg-surface-900/80">
                <h3 className="text-base font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                    <Clock size={16} className="text-violet-400" />
                  </div>
                  Recent Activity
                </h3>
              </div>
              <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {MOCK_ACTIVITY_LOG.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-800/30 border border-surface-700/50">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.type === 'success' ? 'bg-emerald-500' : a.type === 'danger' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{a.action}</p>
                      <p className="text-[11px] text-surface-500 truncate">{a.detail}</p>
                      <p className="text-[10px] text-surface-600 mt-1">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enrolled Courses */}
            <div className="lg:col-span-3 glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
              <div className="p-6 border-b border-surface-800 bg-surface-900/80">
                <h3 className="text-base font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <BookOpen size={16} className="text-blue-400" />
                  </div>
                  Enrolled Courses
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-700/50 bg-surface-900/50">
                      <th className="text-left px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest">Course</th>
                      <th className="text-center px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest">Progress</th>
                      <th className="text-center px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest">Grade</th>
                      <th className="text-right px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700/50">
                    {MOCK_ENROLLED_COURSES.map((c, i) => (
                      <tr key={i} className="hover:bg-surface-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 justify-center">
                            <div className="w-24 h-1.5 bg-surface-800 rounded-full overflow-hidden border border-surface-700">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.progress}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-blue-400 w-8">{c.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-black text-primary-400">{c.grade}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-surface-500 font-mono">{c.enrolledOn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* QUIZZES */}
        {activeSection === 'quizzes' && (
          <div className="space-y-3">
            {quizResults.length === 0 ? (
              <div className="py-16 text-center glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60">
                <BrainCircuit size={40} className="text-surface-600 mx-auto mb-4" />
                <p className="text-lg font-bold text-white mb-1">No Quiz Data</p>
                <p className="text-sm text-surface-400">This student hasn't completed any quizzes yet.</p>
              </div>
            ) : (
              quizResults.map((result, idx) => {
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
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                              {passed ? 'PASSED' : 'FAILED'}
                            </span>
                            {result.completed_at && (
                              <span className="flex items-center gap-1"><Clock size={11} /> {result.completed_at}</span>
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
                                  <span className="text-surface-500 font-mono mr-2">Q{qi + 1}.</span>{a.question}
                                </p>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {!a.isCorrect && (
                                    <div className="p-2.5 rounded-lg bg-surface-950/50 border border-surface-800">
                                      <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-1">Student's Answer</p>
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

        {/* ASSIGNMENTS */}
        {activeSection === 'assignments' && (
          <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700/80 bg-surface-900/80">
                    <th className="text-left px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest">Assignment</th>
                    <th className="text-left px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest hidden md:table-cell">Course</th>
                    <th className="text-center px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest">Status</th>
                    <th className="text-right px-6 py-5 text-xs font-bold text-surface-400 uppercase tracking-widest">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/50">
                  {MOCK_STUDENT_ASSIGNMENTS.map(a => (
                    <tr key={a.id} className="hover:bg-surface-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{a.title}</p>
                        {a.submittedOn && <p className="text-[10px] text-surface-500 mt-0.5">Submitted: {a.submittedOn}</p>}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-surface-400 text-xs">{a.course}</td>
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
                          <span className="text-lg font-black text-white">{a.grade}<span className="text-surface-500 text-xs">/{a.maxGrade}</span></span>
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

        {/* COURSES */}
        {activeSection === 'courses' && (
          <div className="space-y-4">
            {MOCK_ENROLLED_COURSES.map((c, i) => (
              <div key={i} className="glass-card rounded-2xl border border-surface-700/50 bg-surface-900/60 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{c.name}</h3>
                    <p className="text-[11px] text-surface-500">Enrolled: {c.enrolledOn}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-black text-primary-400">{c.grade}</p>
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
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" style={{ width: `${c.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACTIVITY LOG */}
        {activeSection === 'activity' && (
          <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
            <div className="p-6 space-y-4">
              {MOCK_ACTIVITY_LOG.map((a, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-surface-800/30 border border-surface-700/50 hover:bg-surface-800/50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    a.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    a.type === 'danger' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                    'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                    {a.type === 'success' ? <CheckCircle size={18} /> : a.type === 'danger' ? <AlertTriangle size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{a.action}</p>
                    <p className="text-xs text-surface-400 mt-0.5">{a.detail}</p>
                  </div>
                  <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider shrink-0 bg-surface-950 px-2 py-1 rounded-md border border-surface-800">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

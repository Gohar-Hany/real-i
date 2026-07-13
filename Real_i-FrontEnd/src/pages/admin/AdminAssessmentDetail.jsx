import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAssessments } from '@/contexts/AssessmentContext';
import { useToast } from '@/components/common/Toast';
import {
  ArrowLeft, Edit3, Eye, EyeOff, Trash2, Copy, BarChart3,
  Users, Clock, Target, Trophy, TrendingDown, CheckCircle,
  AlertCircle, Hourglass, FileText, BrainCircuit, GraduationCap, CheckSquare
} from 'lucide-react';

const TYPE_CONFIG = {
  quiz: { label: 'Quiz', icon: BrainCircuit, color: '#8B5CF6', text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  exam: { label: 'Exam', icon: GraduationCap, color: '#EF4444', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  assignment: { label: 'Assignment', icon: FileText, color: '#3B82F6', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  task: { label: 'Task', icon: CheckSquare, color: '#10B981', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

export default function AdminAssessmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getAssessmentById, getSubmissionsForAssessment, publishAssessment, deleteAssessment, duplicateAssessment } = useAssessments();

  const assessment = getAssessmentById(id);
  const submissions = useMemo(() => getSubmissionsForAssessment(id), [id, getSubmissionsForAssessment]);

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <AlertCircle size={48} className="text-surface-600 mb-4" />
        <p className="text-xl font-bold text-white mb-2">Assessment Not Found</p>
        <Link to="/admin/assessments" className="text-sm text-primary-400 hover:text-primary-300 font-bold">← Back to Assessments</Link>
      </div>
    );
  }

  const tc = TYPE_CONFIG[assessment.type] || TYPE_CONFIG.task;
  const TypeIcon = tc.icon;

  // Stats
  const completedSubs = submissions.filter(s => s.status !== 'in_progress');
  const inProgressSubs = submissions.filter(s => s.status === 'in_progress');
  const scores = completedSubs.filter(s => s.score != null).map(s => s.score);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const highest = scores.length > 0 ? Math.max(...scores) : 0;
  const lowest = scores.length > 0 ? Math.min(...scores) : 0;
  const totalMarks = assessment.totalMarks || assessment.questions?.reduce((s, q) => s + (q.marks || 0), 0) || 0;

  const handleDelete = () => {
    if (!window.confirm(`Delete "${assessment.title}"? This cannot be undone.`)) return;
    deleteAssessment(id);
    toast.success('Assessment deleted');
    navigate('/admin/assessments');
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate('/admin/assessments')} className="p-2 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white transition-all mt-1">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${tc.bg} ${tc.border} ${tc.text}`}>
                <TypeIcon size={12} /> {tc.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                assessment.status === 'published' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                {assessment.status === 'published' ? <Eye size={10} /> : <EyeOff size={10} />} {assessment.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{assessment.title}</h1>
            <p className="text-sm text-surface-400 mt-1 max-w-xl">{assessment.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to={`/admin/assessments/${id}/edit`} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-300 text-xs font-bold hover:text-white transition-all">
            <Edit3 size={14} /> Edit
          </Link>
          <button onClick={() => { publishAssessment(id); toast.success('Status updated'); }} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${assessment.status === 'published' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20' : 'gradient-primary text-surface-950'}`}>
            {assessment.status === 'published' ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
          </button>
          <button onClick={() => { duplicateAssessment(id); toast.success('Duplicated'); }} className="p-2 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-violet-400 transition-all"><Copy size={14} /></button>
          <button onClick={handleDelete} className="p-2 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-rose-400 transition-all"><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Users, label: 'Submissions', value: completedSubs.length, color: '#3B82F6' },
          { icon: BarChart3, label: 'Avg Score', value: totalMarks > 0 ? `${Math.round((avgScore / totalMarks) * 100)}%` : '—', color: '#D4AF37' },
          { icon: Trophy, label: 'Highest', value: totalMarks > 0 ? `${highest}/${totalMarks}` : '—', color: '#10B981' },
          { icon: TrendingDown, label: 'Lowest', value: totalMarks > 0 ? `${lowest}/${totalMarks}` : '—', color: '#EF4444' },
          { icon: Hourglass, label: 'In Progress', value: inProgressSubs.length, color: '#F59E0B' },
        ].map((stat, i) => (
          <div key={i} className="relative glass-card rounded-2xl p-4 bg-surface-900/60 border border-surface-700/50 overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${stat.color} 0%, transparent 70%)` }}></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`, borderColor: `${stat.color}40` }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-white">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assessment Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Details Card */}
        <div className="glass-card rounded-2xl border border-surface-700/50 bg-surface-900/60 p-6">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Details</h3>
          <div className="space-y-3 text-sm">
            {[
              { l: 'Course', v: assessment.courseId },
              { l: 'Time Limit', v: assessment.timeLimit ? `${assessment.timeLimit} min` : 'None' },
              { l: 'Attempts', v: assessment.attempts === -1 ? 'Unlimited' : assessment.attempts },
              { l: 'Passing Grade', v: `${assessment.passingGrade}%` },
              { l: 'Total Marks', v: totalMarks },
              { l: 'Questions', v: assessment.questions?.length || 'N/A' },
              { l: 'Start', v: assessment.startDate ? new Date(assessment.startDate).toLocaleString() : 'Not set' },
              { l: 'End', v: assessment.endDate ? new Date(assessment.endDate).toLocaleString() : 'Not set' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-surface-800/50 last:border-0">
                <span className="text-surface-500 font-medium">{row.l}</span>
                <span className="text-surface-200 font-bold">{row.v}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-surface-800/50">
            {assessment.randomizeQuestions && <span className="text-[10px] bg-violet-500/10 text-violet-400 px-2 py-1 rounded font-bold border border-violet-500/20">Randomized</span>}
            {assessment.autoGrade && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold border border-emerald-500/20">Auto-grade</span>}
            {assessment.showAnswersAfterSubmission && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-bold border border-blue-500/20">Show Answers</span>}
            {assessment.allowLateSubmission && <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-1 rounded font-bold border border-rose-500/20">Late OK</span>}
          </div>
        </div>

        {/* Submissions Table */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
          <div className="p-5 border-b border-surface-700/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Submissions</h3>
            <span className="text-xs text-surface-500">{submissions.length} total</span>
          </div>

          {submissions.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={32} className="text-surface-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-white mb-1">No submissions yet</p>
              <p className="text-xs text-surface-500">Submissions will appear here when students respond.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-900/80 border-b border-surface-700/50">
                    <th className="text-left px-5 py-3 text-xs font-bold text-surface-400 uppercase tracking-widest">Student</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-widest">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-widest">Score</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-widest hidden sm:table-cell">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/50">
                  {submissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-surface-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-xs font-bold text-surface-950 shrink-0">
                            {sub.studentName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{sub.studentName || 'Unknown'}</p>
                            <p className="text-[10px] text-surface-500 font-mono">{sub.studentEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                          sub.status === 'graded' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          sub.status === 'submitted' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                          'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {sub.status === 'graded' ? <CheckCircle size={10} /> : sub.status === 'in_progress' ? <Hourglass size={10} /> : <Clock size={10} />}
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {sub.score != null ? (
                          <span className={`text-xs font-bold ${sub.score / totalMarks >= assessment.passingGrade / 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {sub.score}/{totalMarks}
                          </span>
                        ) : <span className="text-xs text-surface-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="text-xs text-surface-400 font-mono">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

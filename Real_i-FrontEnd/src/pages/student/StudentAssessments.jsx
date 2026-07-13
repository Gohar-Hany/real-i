import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessments } from '@/contexts/AssessmentContext';
import {
  ClipboardList, BrainCircuit, GraduationCap, FileText, CheckSquare,
  Clock, Target, CheckCircle, AlertTriangle, Calendar, ArrowRight,
  Search, Trophy, Lock
} from 'lucide-react';

const TYPE_CONFIG = {
  quiz: { label: 'Quiz', icon: BrainCircuit, color: '#8B5CF6', bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
  exam: { label: 'Exam', icon: GraduationCap, color: '#EF4444', bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400' },
  assignment: { label: 'Assignment', icon: FileText, color: '#3B82F6', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  task: { label: 'Task', icon: CheckSquare, color: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
};

function getTimeRemaining(endDate) {
  if (!endDate) return null;
  const diff = new Date(endDate) - new Date();
  if (diff <= 0) return { expired: true, text: 'Expired' };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  if (days > 3) return { expired: false, urgent: false, text: `${days}d ${hours}h remaining` };
  if (days > 0) return { expired: false, urgent: true, text: `${days}d ${hours}h remaining` };
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  return { expired: false, urgent: true, text: `${hours}h ${mins}m remaining` };
}

export default function StudentAssessments() {
  const { user } = useAuth();
  const { assessments, getStudentSubmission } = useAssessments();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const published = useMemo(() => assessments.filter(a => a.status === 'published'), [assessments]);

  const enriched = useMemo(() => published.map(a => {
    const submission = getStudentSubmission(a.id, user?.id);
    const timeInfo = getTimeRemaining(a.endDate);
    const isStarted = a.startDate ? new Date(a.startDate) <= new Date() : true;
    return { ...a, submission, timeInfo, isStarted };
  }), [published, user?.id, getStudentSubmission]);

  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'quiz', label: 'Quizzes' },
    { value: 'exam', label: 'Exams' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'task', label: 'Tasks' },
    { value: 'completed', label: 'Completed' },
  ];

  const filtered = useMemo(() => {
    let result = enriched;
    if (activeTab === 'completed') result = result.filter(a => a.submission);
    else if (activeTab !== 'all') result = result.filter(a => a.type === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(q));
    }
    return result;
  }, [enriched, activeTab, search]);

  const completedCount = enriched.filter(a => a.submission).length;

  const getActionLink = (a) => {
    if (a.submission) return `/student/assessments/${a.id}/results`;
    if (a.timeInfo?.expired) return null;
    if (!a.isStarted) return null;
    if (a.type === 'quiz' || a.type === 'exam') return `/student/assessments/${a.id}/take`;
    return `/student/assessments/${a.id}/submit`;
  };

  const getActionLabel = (a) => {
    if (a.submission) return 'View Results';
    if (a.timeInfo?.expired) return 'Expired';
    if (!a.isStarted) return 'Not Available';
    if (a.type === 'quiz' || a.type === 'exam') return 'Start';
    return 'Submit';
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md">
          <ClipboardList size={14} className="text-primary-400" />
          <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">Assessments</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Assessments</span>
        </h1>
        <p className="text-surface-400 text-sm max-w-2xl">
          View assignments, quizzes, exams, and tasks. Track deadlines and submit your work.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: ClipboardList, label: 'Available', value: enriched.filter(a => !a.submission && !a.timeInfo?.expired).length, color: '#3B82F6' },
          { icon: CheckCircle, label: 'Completed', value: completedCount, color: '#10B981' },
          { icon: AlertTriangle, label: 'Due Soon', value: enriched.filter(a => a.timeInfo?.urgent && !a.submission).length, color: '#F59E0B' },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 bg-surface-900/60 border border-surface-700/50 group hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`, borderColor: `${stat.color}40` }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map(tab => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.value ? 'gradient-primary text-surface-950' : 'bg-surface-900/60 border border-surface-700/50 text-surface-400 hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs ml-auto">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-900/60 border border-surface-700/50 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50 transition-all" />
        </div>
      </div>

      {/* Assessment Cards */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-3xl border border-surface-700/50 p-16 text-center">
          <ClipboardList size={40} className="text-surface-600 mx-auto mb-4" />
          <p className="text-lg font-bold text-white mb-1">No assessments found</p>
          <p className="text-sm text-surface-400">{search ? 'Try a different search.' : 'Check back later for new assessments.'}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => {
            const tc = TYPE_CONFIG[a.type] || TYPE_CONFIG.task;
            const TypeIcon = tc.icon;
            const actionLink = getActionLink(a);
            const actionLabel = getActionLabel(a);
            const totalMarks = a.totalMarks || a.questions?.reduce((s, q) => s + (q.marks || 0), 0) || 0;

            return (
              <div key={a.id} className="glass-card rounded-2xl border border-surface-700/50 bg-surface-900/60 overflow-hidden group hover:-translate-y-1 transition-all duration-300 flex flex-col">
                {/* Card Header */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${tc.bg} ${tc.border} ${tc.text}`}>
                      <TypeIcon size={10} /> {tc.label}
                    </span>
                    {a.submission && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <CheckCircle size={10} /> Done
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2 group-hover:text-primary-300 transition-colors line-clamp-2">{a.title}</h3>
                  <p className="text-xs text-surface-500 line-clamp-2 mb-3">{a.description}</p>

                  <div className="flex flex-wrap gap-2 text-[10px]">
                    {totalMarks > 0 && (
                      <span className="flex items-center gap-1 text-surface-400"><Target size={10} /> {totalMarks} pts</span>
                    )}
                    {a.timeLimit && (
                      <span className="flex items-center gap-1 text-surface-400"><Clock size={10} /> {a.timeLimit}m</span>
                    )}
                    {a.questions?.length > 0 && (
                      <span className="flex items-center gap-1 text-surface-400"><BrainCircuit size={10} /> {a.questions.length}Q</span>
                    )}
                  </div>

                  {/* Score if completed */}
                  {a.submission?.score != null && (
                    <div className="mt-3 pt-3 border-t border-surface-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-surface-500">Score</span>
                        <span className={`text-sm font-extrabold ${a.submission.score / totalMarks >= a.passingGrade / 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {a.submission.score}/{totalMarks}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-900 rounded-full mt-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${a.submission.score / totalMarks >= a.passingGrade / 100 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${totalMarks > 0 ? Math.round((a.submission.score / totalMarks) * 100) : 0}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-4 pt-0 flex items-center justify-between">
                  {/* Deadline */}
                  <div>
                    {a.timeInfo && (
                      <span className={`text-[10px] font-bold ${
                        a.timeInfo.expired ? 'text-surface-500' :
                        a.timeInfo.urgent ? 'text-amber-400' : 'text-surface-400'
                      }`}>
                        <Calendar size={10} className="inline mr-1" />
                        {a.timeInfo.text}
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  {actionLink ? (
                    <Link to={actionLink} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      a.submission ? 'bg-surface-800 border border-surface-700 text-surface-300 hover:text-white'
                        : 'gradient-primary text-surface-950 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                    }`}>
                      {a.submission ? <Trophy size={12} /> : <ArrowRight size={12} />}
                      {actionLabel}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-surface-800/50 border border-surface-700 text-surface-500 cursor-not-allowed">
                      <Lock size={12} /> {actionLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessments } from '@/contexts/AssessmentContext';
import {
  ArrowLeft, Trophy, CheckCircle, XCircle, Target, Clock,
  BarChart3, Lightbulb, AlertTriangle, FileText, Shield
} from 'lucide-react';

export default function StudentAssessmentResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getAssessmentById, getStudentSubmission } = useAssessments();

  const assessment = getAssessmentById(id);
  const submission = getStudentSubmission(id, user?.id);

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <AlertTriangle size={48} className="text-surface-600 mb-4" />
        <p className="text-xl font-bold text-white mb-2">Assessment Not Found</p>
        <button onClick={() => navigate('/student/assessments')} className="text-sm text-primary-400 font-bold">← Back</button>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <FileText size={48} className="text-surface-600 mb-4" />
        <p className="text-xl font-bold text-white mb-2">No Submission Found</p>
        <p className="text-sm text-surface-400 mb-4">You haven't submitted this assessment yet.</p>
        <Link to="/student/assessments" className="text-sm text-primary-400 font-bold">← Back to Assessments</Link>
      </div>
    );
  }

  const isQuizOrExam = assessment.type === 'quiz' || assessment.type === 'exam';
  const totalMarks = assessment.totalMarks || assessment.questions?.reduce((s, q) => s + (q.marks || 0), 0) || 0;
  const percentage = totalMarks > 0 && submission.score != null ? Math.round((submission.score / totalMarks) * 100) : null;
  const passed = percentage != null && percentage >= assessment.passingGrade;

  // Circular progress
  const circumference = 2 * Math.PI * 60;
  const offset = percentage != null ? circumference - (percentage / 100) * circumference : circumference;

  // Grade letter
  const getGrade = (pct) => {
    if (pct >= 90) return { letter: 'A+', color: 'text-emerald-400' };
    if (pct >= 80) return { letter: 'A', color: 'text-emerald-400' };
    if (pct >= 70) return { letter: 'B', color: 'text-blue-400' };
    if (pct >= 60) return { letter: 'C', color: 'text-amber-400' };
    if (pct >= 50) return { letter: 'D', color: 'text-orange-400' };
    return { letter: 'F', color: 'text-rose-400' };
  };

  const grade = percentage != null ? getGrade(percentage) : null;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/student/assessments')} className="p-2 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white">{assessment.title}</h1>
          <p className="text-xs text-surface-500 mt-0.5">Results & Feedback</p>
        </div>
      </div>

      {/* Score Card */}
      {isQuizOrExam && percentage != null ? (
        <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 p-8 sm:p-10 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Circular Score */}
            <div className="relative shrink-0">
              <svg width="150" height="150" className="-rotate-90">
                <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(42,42,42,0.8)" strokeWidth="8" />
                <circle cx="75" cy="75" r="60" fill="none"
                  stroke={passed ? '#10B981' : '#EF4444'} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-extrabold ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>{percentage}%</span>
                {grade && <span className={`text-sm font-bold ${grade.color} mt-0.5`}>{grade.letter}</span>}
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                {passed ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
                    <Trophy size={16} /> Passed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold">
                    <XCircle size={16} /> Did Not Pass
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: Target, label: 'Score', value: `${submission.score}/${totalMarks}` },
                  { icon: Shield, label: 'Pass Mark', value: `${assessment.passingGrade}%` },
                  { icon: Clock, label: 'Submitted', value: submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—' },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-surface-800/50 border border-surface-700">
                    <div className="flex items-center gap-2 mb-1">
                      <s.icon size={12} className="text-primary-500" />
                      <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">{s.label}</span>
                    </div>
                    <p className="text-sm font-extrabold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Assignment/Task Result */
        <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 p-8 mb-8 text-center">
          <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Submitted Successfully</h2>
          <p className="text-sm text-surface-400 mb-4">
            Your {assessment.type} was submitted on {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : '—'}.
          </p>
          {submission.files?.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700 text-xs text-surface-300">
              <FileText size={12} className="text-primary-400" /> {submission.files.length} file(s) submitted
            </div>
          )}
          {submission.score != null && (
            <div className="mt-4 pt-4 border-t border-surface-800">
              <p className="text-sm text-surface-400">Grade: <strong className={`text-lg ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>{submission.score}/{totalMarks}</strong></p>
            </div>
          )}
        </div>
      )}

      {/* Question Review (quiz/exam only, if admin enabled) */}
      {isQuizOrExam && assessment.showAnswersAfterSubmission && assessment.questions?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 size={16} className="text-primary-400" /> Question Review
          </h3>

          {assessment.questions.map((q, qIdx) => {
            const studentAnswer = submission.answers?.[qIdx];
            const isCorrect = studentAnswer === q.correctAnswer;
            const answered = studentAnswer !== undefined;

            return (
              <div key={q.id} className={`rounded-2xl border p-5 transition-all ${
                !answered ? 'border-surface-700/50 bg-surface-900/40' :
                isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' :
                'border-rose-500/20 bg-rose-500/5'
              }`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    !answered ? 'bg-surface-800 text-surface-500' :
                    isCorrect ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {!answered ? <span className="text-xs font-bold">{qIdx + 1}</span> :
                     isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white mb-1">{q.text}</p>
                    <span className="text-[10px] text-surface-500">{q.marks} marks</span>
                  </div>
                </div>

                <div className="space-y-2 pl-11">
                  {q.options.map((opt, oIdx) => {
                    const isStudentPick = studentAnswer === oIdx;
                    const isCorrectOpt = q.correctAnswer === oIdx;
                    return (
                      <div key={oIdx} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                        isCorrectOpt ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' :
                        isStudentPick && !isCorrectOpt ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' :
                        'border-surface-700/50 text-surface-400'
                      }`}>
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isCorrectOpt ? 'bg-emerald-500 text-surface-950' :
                          isStudentPick ? 'bg-rose-500 text-white' :
                          'bg-surface-800 text-surface-500'
                        }`}>
                          {isCorrectOpt ? <CheckCircle size={12} /> : isStudentPick ? <XCircle size={12} /> : String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="font-medium">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-3 ml-11 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Lightbulb size={12} className="text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Explanation</span>
                    </div>
                    <p className="text-xs text-surface-300 leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8 text-center">
        <Link to="/student/assessments" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-800 border border-surface-700 text-surface-300 font-bold text-sm hover:bg-surface-700 transition-all">
          <ArrowLeft size={16} /> Back to Assessments
        </Link>
      </div>
    </div>
  );
}

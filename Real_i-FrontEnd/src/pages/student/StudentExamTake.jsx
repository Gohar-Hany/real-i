import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessments } from '@/contexts/AssessmentContext';
import { useToast } from '@/components/common/Toast';
import {
  Clock, Target, CheckCircle, ArrowLeft, ArrowRight, Send,
  AlertTriangle, Timer, BrainCircuit, Shield
} from 'lucide-react';

export default function StudentExamTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { getAssessmentById, submitAssessment, saveProgress: ctxSaveProgress, getInProgressSubmission } = useAssessments();

  const assessment = getAssessmentById(id);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);

  // Shuffle questions if needed
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!assessment) return;
    let qs = [...(assessment.questions || [])];
    if (assessment.randomizeQuestions) {
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qs[i], qs[j]] = [qs[j], qs[i]];
      }
    }
    setQuestions(qs);

    // Restore in-progress
    const inProgress = getInProgressSubmission(id, user?.id);
    if (inProgress && inProgress.answers) {
      setAnswers(inProgress.answers);
    }

    // Set timer
    if (assessment.timeLimit) {
      setTimeLeft(assessment.timeLimit * 60);
    }
  }, [assessment?.id]);

  // Timer
  useEffect(() => {
    if (!started || !assessment?.timeLimit || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started]);

  // Auto-submit on time out
  useEffect(() => {
    if (started && timeLeft === 0 && assessment?.timeLimit && !submitted) {
      handleSubmit(true);
    }
  }, [timeLeft]);

  // Auto-save every 30s
  useEffect(() => {
    if (!started || !assessment?.saveProgress) return;
    autoSaveRef.current = setInterval(() => {
      ctxSaveProgress(id, {
        studentId: user?.id,
        studentName: user?.name,
        studentEmail: user?.email,
        answers,
      });
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [started, answers]);

  const handleAnswer = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = useCallback((forced = false) => {
    if (submitted) return;
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);

    submitAssessment(id, {
      studentId: user?.id,
      studentName: user?.name,
      studentEmail: user?.email,
      answers,
      startedAt: new Date().toISOString(),
    });

    toast.success(forced ? 'Time\'s up! Exam auto-submitted.' : 'Exam submitted successfully!');
    navigate(`/student/assessments/${id}/results`);
  }, [answers, submitted]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!assessment || !questions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <AlertTriangle size={48} className="text-surface-600 mb-4" />
        <p className="text-xl font-bold text-white mb-2">Assessment Not Found</p>
        <button onClick={() => navigate('/student/assessments')} className="text-sm text-primary-400 font-bold">← Back</button>
      </div>
    );
  }

  // Pre-start screen
  if (!started) {
    const totalMarks = questions.reduce((s, q) => s + (q.marks || 0), 0);
    return (
      <div className="max-w-2xl mx-auto py-10 animate-fade-in-up">
        <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 p-8 sm:p-10 text-center">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <BrainCircuit size={36} className="text-surface-950" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">{assessment.title}</h1>
          <p className="text-sm text-surface-400 mb-8 max-w-md mx-auto">{assessment.description}</p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { icon: BrainCircuit, text: `${questions.length} Questions` },
              { icon: Target, text: `${totalMarks} Marks` },
              { icon: Clock, text: assessment.timeLimit ? `${assessment.timeLimit} min` : 'No limit' },
              { icon: Shield, text: `${assessment.passingGrade}% to pass` },
            ].map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-800 border border-surface-700 text-xs font-bold text-surface-300">
                <tag.icon size={14} className="text-primary-500" /> {tag.text}
              </span>
            ))}
          </div>

          {assessment.timeLimit && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
              <p className="text-xs text-amber-400 font-bold flex items-center gap-2 justify-center">
                <AlertTriangle size={14} /> This exam is timed. The timer starts when you click "Begin".
              </p>
            </div>
          )}

          <button onClick={() => setStarted(true)}
            className="px-8 py-4 rounded-xl gradient-primary text-surface-950 font-bold text-base shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all active:scale-95">
            Begin Exam
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs font-mono text-primary-400 font-bold uppercase tracking-widest mb-1">{assessment.title}</p>
              <h2 className="text-xl font-bold text-white">
                Question <span className="text-primary-400">{currentQ + 1}</span> <span className="text-surface-500 text-lg">/ {questions.length}</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {assessment.timeLimit && (
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-mono ${
                  timeLeft <= 60 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse' :
                  timeLeft <= 180 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                  'bg-surface-900 border-surface-700 text-surface-300'
                }`}>
                  <Timer size={14} />
                  <span className="text-sm font-bold">{formatTime(timeLeft)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-900 border border-surface-700">
                <Target size={14} className="text-emerald-400" />
                <span className="text-xs font-bold text-white">{answeredCount}/{questions.length}</span>
              </div>
            </div>
          </div>
          <div className="h-2 bg-surface-900 rounded-full overflow-hidden border border-surface-800">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #D4AF37, #e8c84a)' }} />
          </div>
        </div>

        {/* Question Nav Grid */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                i === currentQ ? 'gradient-primary text-surface-950 shadow-[0_0_8px_rgba(212,175,55,0.3)]' :
                answers[i] !== undefined ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' :
                'bg-surface-800 border border-surface-700 text-surface-400 hover:text-white'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question Card */}
        <div key={currentQ} className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 p-6 sm:p-8 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">Q{currentQ + 1} · {question.marks} marks</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 leading-relaxed">{question.text}</h3>

          <div className="space-y-3">
            {question.options.map((opt, oIdx) => {
              const isSelected = answers[currentQ] === oIdx;
              return (
                <button key={oIdx} onClick={() => handleAnswer(currentQ, oIdx)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                    isSelected
                      ? 'border-primary-500/50 bg-primary-500/10 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                      : 'border-surface-700 bg-surface-800/50 hover:bg-surface-700 hover:border-surface-600'
                  }`}>
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border transition-colors ${
                    isSelected ? 'bg-primary-500 text-surface-950 border-primary-500' : 'bg-surface-900 border-surface-600 text-surface-400'
                  }`}>
                    {isSelected ? <CheckCircle size={16} /> : String.fromCharCode(65 + oIdx)}
                  </span>
                  <span className={`text-sm font-medium ${isSelected ? 'text-primary-300' : 'text-surface-200'}`}>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-surface-300 font-bold text-sm hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ArrowLeft size={16} /> Previous
          </button>

          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ(q => q + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-surface-950 font-bold text-sm active:scale-95 transition-all">
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-surface-950 font-bold text-sm active:scale-95 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <Send size={16} /> Submit Exam
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowConfirm(false)}>
          <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900 p-8 max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-5">
              <Send size={28} className="text-primary-400" />
            </div>
            <h3 className="text-xl font-extrabold text-white text-center mb-2">Submit Exam?</h3>
            <p className="text-sm text-surface-400 text-center mb-2">
              You've answered <strong className="text-white">{answeredCount}</strong> of <strong className="text-white">{questions.length}</strong> questions.
            </p>
            {answeredCount < questions.length && (
              <p className="text-xs text-amber-400 text-center mb-4 flex items-center justify-center gap-1">
                <AlertTriangle size={12} /> {questions.length - answeredCount} unanswered questions
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-xl bg-surface-800 border border-surface-700 text-surface-300 font-bold text-sm hover:bg-surface-700 transition-all">
                Go Back
              </button>
              <button onClick={() => handleSubmit(false)} className="flex-1 py-3 rounded-xl gradient-primary text-surface-950 font-bold text-sm active:scale-95 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

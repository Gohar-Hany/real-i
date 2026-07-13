import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAssessments, generateQId } from '@/contexts/AssessmentContext';
import { getProjects } from '@/services/api';
import { useToast } from '@/components/common/Toast';
import {
  ClipboardList, ArrowLeft, ArrowRight, Check, Save, Eye,
  BrainCircuit, GraduationCap, FileText, CheckSquare,
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Lightbulb,
  Clock, Target, Shield, Shuffle, BookOpen, Calendar, Hash
} from 'lucide-react';

const TYPES = [
  { value: 'quiz', label: 'Quiz', icon: BrainCircuit, color: '#8B5CF6', desc: 'Quick knowledge checks with MCQ' },
  { value: 'exam', label: 'Exam', icon: GraduationCap, color: '#EF4444', desc: 'Formal timed examinations' },
  { value: 'assignment', label: 'Assignment', icon: FileText, color: '#3B82F6', desc: 'Projects with file submissions' },
  { value: 'task', label: 'Task', icon: CheckSquare, color: '#10B981', desc: 'Short exercises and activities' },
];

const SUB_TYPES = {
  quiz: [
    { value: 'mcq_exam', label: 'MCQ Quiz' },
    { value: 'practice', label: 'Practice Test' },
  ],
  exam: [
    { value: 'midterm', label: 'Midterm Exam' },
    { value: 'final', label: 'Final Exam' },
    { value: 'mcq_exam', label: 'MCQ Exam' },
  ],
};

const EMPTY_QUESTION = () => ({
  id: generateQId(),
  text: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  marks: 10,
  shuffleOptions: false,
  explanation: '',
});

const INITIAL_FORM = {
  type: 'quiz',
  assessmentSubType: 'mcq_exam',
  title: '',
  description: '',
  courseId: '',
  startDate: '',
  endDate: '',
  timeLimit: 30,
  attempts: 1,
  passingGrade: 60,
  totalMarks: 100,
  randomizeQuestions: false,
  showAnswersAfterSubmission: true,
  autoGrade: true,
  saveProgress: true,
  status: 'draft',
  submissionType: 'both',
  allowLateSubmission: false,
  attachments: [],
  questions: [EMPTY_QUESTION()],
};

export default function AdminAssessmentCreate() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const { createAssessment, updateAssessment, getAssessmentById } = useAssessments();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [projects, setProjects] = useState([]);
  const [expandedQ, setExpandedQ] = useState(0);

  const isQuizOrExam = form.type === 'quiz' || form.type === 'exam';
  const steps = isQuizOrExam
    ? ['Basic Info', 'Configuration', 'Questions', 'Review & Publish']
    : ['Basic Info', 'Configuration', 'Review & Publish'];

  // Load projects for course dropdown
  useEffect(() => {
    getProjects().then(p => setProjects(p || [])).catch(() => {});
  }, []);

  // Load existing assessment for edit
  useEffect(() => {
    if (isEdit) {
      const existing = getAssessmentById(id);
      if (existing) {
        setForm({ ...existing, questions: existing.questions?.length > 0 ? existing.questions : [EMPTY_QUESTION()] });
      } else {
        toast.error('Assessment not found');
        navigate('/admin/assessments');
      }
    }
  }, [id]);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  // ── Question helpers ───────────────────────────────────────
  const addQuestion = () => {
    setForm(prev => ({ ...prev, questions: [...prev.questions, EMPTY_QUESTION()] }));
    setExpandedQ(form.questions.length);
  };

  const removeQuestion = (idx) => {
    if (form.questions.length <= 1) return toast.warning('At least one question required');
    setForm(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== idx) }));
    if (expandedQ >= idx && expandedQ > 0) setExpandedQ(expandedQ - 1);
  };

  const updateQuestion = (idx, key, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === idx ? { ...q, [key]: value } : q),
    }));
  };

  const updateOption = (qIdx, oIdx, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, j) => j === oIdx ? value : o) } : q
      ),
    }));
  };

  const addOption = (qIdx) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIdx ? { ...q, options: [...q.options, ''] } : q
      ),
    }));
  };

  const removeOption = (qIdx, oIdx) => {
    const q = form.questions[qIdx];
    if (q.options.length <= 2) return toast.warning('Minimum 2 options');
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((question, i) => {
        if (i !== qIdx) return question;
        const newOptions = question.options.filter((_, j) => j !== oIdx);
        let newCorrect = question.correctAnswer;
        if (oIdx === question.correctAnswer) newCorrect = 0;
        else if (oIdx < question.correctAnswer) newCorrect = question.correctAnswer - 1;
        return { ...question, options: newOptions, correctAnswer: newCorrect };
      }),
    }));
  };

  const moveQuestion = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= form.questions.length) return;
    setForm(prev => {
      const qs = [...prev.questions];
      [qs[idx], qs[newIdx]] = [qs[newIdx], qs[idx]];
      return { ...prev, questions: qs };
    });
    setExpandedQ(newIdx);
  };

  // ── Validation ─────────────────────────────────────────────
  const validateStep = () => {
    if (step === 0) {
      if (!form.title.trim()) { toast.warning('Title is required'); return false; }
      if (!form.courseId) { toast.warning('Please select a course'); return false; }
    }
    if (step === 2 && isQuizOrExam) {
      for (let i = 0; i < form.questions.length; i++) {
        const q = form.questions[i];
        if (!q.text.trim()) { toast.warning(`Question ${i + 1} text is empty`); setExpandedQ(i); return false; }
        const emptyOpts = q.options.filter(o => !o.trim());
        if (emptyOpts.length > 0) { toast.warning(`Question ${i + 1} has empty options`); setExpandedQ(i); return false; }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(s => Math.min(s + 1, steps.length - 1));
  };

  const handleSave = (publish = false) => {
    if (!form.title.trim()) { toast.warning('Title is required'); return; }
    const data = {
      ...form,
      status: publish ? 'published' : form.status,
      totalMarks: isQuizOrExam ? form.questions.reduce((s, q) => s + (q.marks || 0), 0) : form.totalMarks,
    };
    if (isEdit) {
      updateAssessment(id, data);
      toast.success('Assessment updated');
    } else {
      createAssessment(data);
      toast.success(publish ? 'Assessment published!' : 'Assessment saved as draft');
    }
    navigate('/admin/assessments');
  };

  // ── Field Component ────────────────────────────────────────
  const Field = ({ label, children, hint, className = '' }) => (
    <div className={className}>
      <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-surface-500 mt-1.5">{hint}</p>}
    </div>
  );

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-surface-900/80 border border-surface-700 text-sm text-white placeholder-surface-500 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all';

  const Toggle = ({ checked, onChange, label }) => (
    <button type="button" onClick={() => onChange(!checked)} className={`flex items-center justify-between w-full p-3.5 rounded-xl border transition-all ${checked ? 'bg-primary-500/10 border-primary-500/30' : 'bg-surface-900/60 border-surface-700/50'}`}>
      <span className={`text-sm font-bold ${checked ? 'text-primary-400' : 'text-surface-400'}`}>{label}</span>
      <div className={`w-10 h-6 rounded-full transition-all relative ${checked ? 'bg-primary-500' : 'bg-surface-700'}`}>
        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${checked ? 'left-5' : 'left-1'}`} />
      </div>
    </button>
  );

  // ═══════════════════════════════════════════════════════════
  // STEP RENDERERS
  // ═══════════════════════════════════════════════════════════

  const renderStep0 = () => (
    <div className="space-y-6">
      {/* Type Selector */}
      <Field label="Assessment Type">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TYPES.map(t => (
            <button key={t.value} type="button" onClick={() => { update('type', t.value); if (!SUB_TYPES[t.value]) update('assessmentSubType', null); else update('assessmentSubType', SUB_TYPES[t.value][0].value); }}
              className={`relative p-4 rounded-xl border transition-all text-left group ${form.type === t.value ? 'border-primary-500/50 bg-primary-500/10 shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'border-surface-700/50 bg-surface-900/60 hover:border-surface-600'}`}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 border" style={{ background: `${t.color}15`, borderColor: `${t.color}30` }}>
                <t.icon size={20} style={{ color: t.color }} />
              </div>
              <p className={`text-sm font-bold ${form.type === t.value ? 'text-white' : 'text-surface-300'}`}>{t.label}</p>
              <p className="text-[10px] text-surface-500 mt-0.5">{t.desc}</p>
              {form.type === t.value && <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full gradient-primary flex items-center justify-center"><Check size={12} className="text-surface-950" /></div>}
            </button>
          ))}
        </div>
      </Field>

      {/* Sub-type */}
      {SUB_TYPES[form.type] && (
        <Field label="Sub-type">
          <div className="flex flex-wrap gap-2">
            {SUB_TYPES[form.type].map(st => (
              <button key={st.value} type="button" onClick={() => update('assessmentSubType', st.value)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${form.assessmentSubType === st.value ? 'gradient-primary text-surface-950 border-transparent' : 'bg-surface-900/60 border-surface-700/50 text-surface-400 hover:text-white'}`}>
                {st.label}
              </button>
            ))}
          </div>
        </Field>
      )}

      {/* Title */}
      <Field label="Title">
        <input type="text" value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g., Midterm Exam — Machine Learning" className={inputCls} />
      </Field>

      {/* Description */}
      <Field label="Description">
        <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe what this assessment covers..." rows={3} className={`${inputCls} resize-none`} />
      </Field>

      {/* Course */}
      <Field label="Course / Project">
        <select value={form.courseId} onChange={e => update('courseId', e.target.value)} className={`${inputCls} cursor-pointer`}>
          <option value="">Select a course...</option>
          {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_id}</option>)}
          <option value="general">General (All Courses)</option>
        </select>
      </Field>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      {isQuizOrExam ? (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Time Limit (minutes)" hint="0 = no time limit">
              <div className="flex gap-2">
                {[15, 30, 60, 90, 120].map(t => (
                  <button key={t} type="button" onClick={() => update('timeLimit', t)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${form.timeLimit === t ? 'bg-primary-500/10 text-primary-400 border-primary-500/50' : 'bg-surface-900/60 border-surface-700/50 text-surface-400 hover:text-white'}`}>
                    {t}m
                  </button>
                ))}
              </div>
              <input type="number" min={0} value={form.timeLimit} onChange={e => update('timeLimit', parseInt(e.target.value) || 0)} className={`${inputCls} mt-2`} placeholder="Custom minutes..." />
            </Field>
            <Field label="Allowed Attempts" hint="-1 = unlimited">
              <div className="flex gap-2">
                {[1, 2, 3, -1].map(n => (
                  <button key={n} type="button" onClick={() => update('attempts', n)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${form.attempts === n ? 'bg-primary-500/10 text-primary-400 border-primary-500/50' : 'bg-surface-900/60 border-surface-700/50 text-surface-400 hover:text-white'}`}>
                    {n === -1 ? '∞' : n}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Passing Grade (%)">
              <input type="number" min={0} max={100} value={form.passingGrade} onChange={e => update('passingGrade', parseInt(e.target.value) || 0)} className={inputCls} />
            </Field>
            <Field label="Total Marks" hint="Auto-calculated from questions">
              <input type="number" value={form.questions.reduce((s, q) => s + (q.marks || 0), 0)} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Start Date & Time">
              <input type="datetime-local" value={form.startDate} onChange={e => update('startDate', e.target.value)} className={inputCls} />
            </Field>
            <Field label="End Date & Time">
              <input type="datetime-local" value={form.endDate} onChange={e => update('endDate', e.target.value)} className={inputCls} />
            </Field>
          </div>

          <div className="space-y-3">
            <Toggle checked={form.randomizeQuestions} onChange={v => update('randomizeQuestions', v)} label="Randomize question order" />
            <Toggle checked={form.showAnswersAfterSubmission} onChange={v => update('showAnswersAfterSubmission', v)} label="Show correct answers after submission" />
            <Toggle checked={form.autoGrade} onChange={v => update('autoGrade', v)} label="Auto-grade MCQ questions" />
            <Toggle checked={form.saveProgress} onChange={v => update('saveProgress', v)} label="Allow saving progress during exam" />
          </div>
        </>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Due Date & Time">
              <input type="datetime-local" value={form.endDate} onChange={e => update('endDate', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Total Points">
              <input type="number" min={0} value={form.totalMarks} onChange={e => update('totalMarks', parseInt(e.target.value) || 0)} className={inputCls} />
            </Field>
          </div>

          <Field label="Submission Type">
            <div className="flex gap-2">
              {[{ v: 'file', l: 'File Upload' }, { v: 'text', l: 'Text Answer' }, { v: 'both', l: 'Both' }].map(st => (
                <button key={st.v} type="button" onClick={() => update('submissionType', st.v)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${form.submissionType === st.v ? 'gradient-primary text-surface-950 border-transparent' : 'bg-surface-900/60 border-surface-700/50 text-surface-400 hover:text-white'}`}>
                  {st.l}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Passing Grade (%)">
            <input type="number" min={0} max={100} value={form.passingGrade} onChange={e => update('passingGrade', parseInt(e.target.value) || 0)} className={inputCls} />
          </Field>

          <Toggle checked={form.allowLateSubmission} onChange={v => update('allowLateSubmission', v)} label="Allow late submissions" />
        </>
      )}
    </div>
  );

  const renderQuestions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-400">
          <strong className="text-white">{form.questions.length}</strong> questions · <strong className="text-primary-400">{form.questions.reduce((s, q) => s + (q.marks || 0), 0)}</strong> total marks
        </p>
        <button type="button" onClick={addQuestion} className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-primary text-surface-950 text-xs font-bold active:scale-95 transition-all">
          <Plus size={14} /> Add Question
        </button>
      </div>

      {form.questions.map((q, qIdx) => {
        const isOpen = expandedQ === qIdx;
        return (
          <div key={q.id} className={`rounded-2xl border transition-all overflow-hidden ${isOpen ? 'border-primary-500/30 bg-surface-900/60' : 'border-surface-700/50 bg-surface-900/40'}`}>
            {/* Question Header */}
            <div className="flex items-center gap-3 p-4 cursor-pointer select-none" onClick={() => setExpandedQ(isOpen ? -1 : qIdx)}>
              <div className="flex flex-col gap-1">
                <button type="button" onClick={e => { e.stopPropagation(); moveQuestion(qIdx, -1); }} disabled={qIdx === 0} className="text-surface-500 hover:text-surface-300 disabled:opacity-20 transition-colors"><ChevronUp size={12} /></button>
                <button type="button" onClick={e => { e.stopPropagation(); moveQuestion(qIdx, 1); }} disabled={qIdx === form.questions.length - 1} className="text-surface-500 hover:text-surface-300 disabled:opacity-20 transition-colors"><ChevronDown size={12} /></button>
              </div>
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-xs font-extrabold text-surface-950 shrink-0">{qIdx + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{q.text || 'Untitled Question'}</p>
                <p className="text-[10px] text-surface-500">{q.options.length} options · {q.marks} marks</p>
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); removeQuestion(qIdx); }} className="p-1.5 rounded-lg text-surface-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"><Trash2 size={14} /></button>
              {isOpen ? <ChevronUp size={16} className="text-primary-400 shrink-0" /> : <ChevronDown size={16} className="text-surface-500 shrink-0" />}
            </div>

            {/* Question Body */}
            {isOpen && (
              <div className="px-4 pb-5 space-y-4 border-t border-surface-700/50 pt-4 animate-fade-in">
                <Field label="Question Text">
                  <textarea value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)} placeholder="Enter your question..." rows={2} className={`${inputCls} resize-none`} />
                </Field>

                <Field label="Answer Options">
                  <div className="space-y-2.5">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <button type="button" onClick={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${q.correctAnswer === oIdx ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-surface-600 text-surface-500 hover:border-surface-400'}`}>
                          {q.correctAnswer === oIdx ? <Check size={14} /> : <span className="text-[10px] font-bold">{String.fromCharCode(65 + oIdx)}</span>}
                        </button>
                        <input type="text" value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          className={`flex-1 px-3 py-2.5 rounded-xl text-sm outline-none transition-all border ${q.correctAnswer === oIdx ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300' : 'bg-surface-900/80 border-surface-700 text-white'} placeholder-surface-500 focus:border-primary-500/50`} />
                        {q.options.length > 2 && (
                          <button type="button" onClick={() => removeOption(qIdx, oIdx)} className="p-1.5 text-surface-500 hover:text-rose-400 transition-colors"><Trash2 size={12} /></button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addOption(qIdx)} className="flex items-center gap-1.5 text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors mt-1">
                      <Plus size={12} /> Add Option
                    </button>
                  </div>
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Marks">
                    <input type="number" min={1} value={q.marks} onChange={e => updateQuestion(qIdx, 'marks', parseInt(e.target.value) || 0)} className={inputCls} />
                  </Field>
                  <Field label="Options">
                    <Toggle checked={q.shuffleOptions} onChange={v => updateQuestion(qIdx, 'shuffleOptions', v)} label="Shuffle options" />
                  </Field>
                </div>

                <Field label="Explanation (optional)" hint="Shown after submission if enabled">
                  <textarea value={q.explanation} onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)} placeholder="Explain why the correct answer is correct..." rows={2} className={`${inputCls} resize-none`} />
                </Field>
              </div>
            )}
          </div>
        );
      })}

      <button type="button" onClick={addQuestion} className="w-full py-4 rounded-2xl border-2 border-dashed border-surface-700 text-surface-400 hover:border-primary-500/30 hover:text-primary-400 transition-all flex items-center justify-center gap-2 text-sm font-bold">
        <Plus size={16} /> Add Another Question
      </button>
    </div>
  );

  const renderReview = () => {
    const calcMarks = isQuizOrExam ? form.questions.reduce((s, q) => s + (q.marks || 0), 0) : form.totalMarks;
    return (
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-6 border border-surface-700/50 bg-surface-900/60 space-y-4">
          <h3 className="text-lg font-bold text-white">{form.title || 'Untitled'}</h3>
          <p className="text-sm text-surface-400">{form.description || 'No description'}</p>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: BookOpen, text: form.courseId || 'No course' },
              { icon: Clock, text: form.timeLimit ? `${form.timeLimit} min` : 'No limit' },
              { icon: Target, text: `${calcMarks} marks` },
              { icon: Shield, text: `${form.passingGrade}% to pass` },
              { icon: Hash, text: `${form.attempts === -1 ? '∞' : form.attempts} attempts` },
            ].map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700 text-xs font-bold text-surface-300">
                <tag.icon size={12} className="text-primary-500" /> {tag.text}
              </span>
            ))}
          </div>
          {isQuizOrExam && <p className="text-xs text-surface-500">{form.questions.length} questions configured</p>}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-800">
            {form.randomizeQuestions && <span className="text-[10px] bg-violet-500/10 text-violet-400 px-2 py-1 rounded font-bold">Randomized</span>}
            {form.autoGrade && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold">Auto-grade</span>}
            {form.showAnswersAfterSubmission && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-bold">Show Answers</span>}
            {form.saveProgress && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-1 rounded font-bold">Save Progress</span>}
            {form.allowLateSubmission && <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-1 rounded font-bold">Late OK</span>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => handleSave(false)} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-surface-800 border border-surface-700 text-white font-bold hover:bg-surface-700 transition-all active:scale-95">
            <Save size={16} /> Save as Draft
          </button>
          <button onClick={() => handleSave(true)} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-primary text-surface-950 font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all active:scale-95">
            <Eye size={16} /> Publish Now
          </button>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    if (step === 0) return renderStep0();
    if (step === 1) return renderStep1();
    if (isQuizOrExam && step === 2) return renderQuestions();
    return renderReview();
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/assessments')} className="p-2 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {isEdit ? 'Edit' : 'Create'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Assessment</span>
          </h1>
          <p className="text-xs text-surface-500 mt-0.5">Step {step + 1} of {steps.length} — {steps[step]}</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <button onClick={() => { if (i < step) setStep(i); }} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
              i < step ? 'gradient-primary text-surface-950 cursor-pointer' :
              i === step ? 'bg-primary-500/20 text-primary-400 border-2 border-primary-500' :
              'bg-surface-800 text-surface-500 border border-surface-700'
            }`}>
              {i < step ? <Check size={14} /> : i + 1}
            </button>
            <span className={`text-xs font-bold hidden sm:block ${i === step ? 'text-white' : 'text-surface-500'}`}>{s}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-primary-500' : 'bg-surface-700'}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 p-6 sm:p-8">
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      {step < steps.length - 1 && (
        <div className="flex justify-between">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-surface-300 font-bold text-sm hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ArrowLeft size={16} /> Back
          </button>
          <button onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-surface-950 font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.2)] active:scale-95 transition-all">
            Next <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

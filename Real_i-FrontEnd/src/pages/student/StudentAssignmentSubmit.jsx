import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessments } from '@/contexts/AssessmentContext';
import { useToast } from '@/components/common/Toast';
import {
  ArrowLeft, Send, Upload, FileText, Clock, Target, Shield,
  AlertTriangle, Paperclip, X, Calendar, CheckCircle
} from 'lucide-react';

export default function StudentAssignmentSubmit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { getAssessmentById, submitAssessment, getStudentSubmission } = useAssessments();

  const assessment = getAssessmentById(id);
  const existingSub = getStudentSubmission(id, user?.id);

  const [textAnswer, setTextAnswer] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <AlertTriangle size={48} className="text-surface-600 mb-4" />
        <p className="text-xl font-bold text-white mb-2">Assessment Not Found</p>
        <button onClick={() => navigate('/student/assessments')} className="text-sm text-primary-400 font-bold">← Back</button>
      </div>
    );
  }

  if (existingSub) {
    return (
      <div className="max-w-2xl mx-auto py-10 animate-fade-in-up">
        <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 p-8 text-center">
          <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Already Submitted</h2>
          <p className="text-sm text-surface-400 mb-6">You've already submitted this {assessment.type}.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(`/student/assessments/${id}/results`)} className="px-5 py-2.5 rounded-xl gradient-primary text-surface-950 font-bold text-sm">View Results</button>
            <button onClick={() => navigate('/student/assessments')} className="px-5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-surface-300 font-bold text-sm">Back</button>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = assessment.endDate && new Date(assessment.endDate) < new Date();
  const isLateAllowed = assessment.allowLateSubmission;
  const totalMarks = assessment.totalMarks || 0;

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    const fileNames = selected.map(f => f.name);
    setFiles(prev => [...prev, ...fileNames]);
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (assessment.submissionType === 'file' && files.length === 0) {
      toast.warning('Please upload at least one file');
      return;
    }
    if (assessment.submissionType === 'text' && !textAnswer.trim()) {
      toast.warning('Please enter your answer');
      return;
    }
    if (assessment.submissionType === 'both' && files.length === 0 && !textAnswer.trim()) {
      toast.warning('Please provide a submission');
      return;
    }

    setSubmitting(true);
    submitAssessment(id, {
      studentId: user?.id,
      studentName: user?.name,
      studentEmail: user?.email,
      files,
      textAnswer,
    });
    toast.success('Submitted successfully!');
    navigate(`/student/assessments/${id}/results`);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/student/assessments')} className="p-2 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white">{assessment.title}</h1>
          <p className="text-xs text-surface-500 mt-0.5">Submit your {assessment.type}</p>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { icon: Target, text: `${totalMarks} Points` },
          { icon: Clock, text: assessment.endDate ? new Date(assessment.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline' },
          { icon: Shield, text: `${assessment.passingGrade}% to pass` },
        ].map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-800 border border-surface-700 text-xs font-bold text-surface-300">
            <tag.icon size={14} className="text-primary-500" /> {tag.text}
          </span>
        ))}
      </div>

      {/* Late Warning */}
      {isExpired && isLateAllowed && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400 font-bold">This submission is past the deadline. Late submissions are allowed for this {assessment.type}.</p>
        </div>
      )}

      {/* Description */}
      {assessment.description && (
        <div className="glass-card rounded-2xl border border-surface-700/50 bg-surface-900/60 p-6 mb-6">
          <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Instructions</h3>
          <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-wrap">{assessment.description}</p>
        </div>
      )}

      {/* Attachments from admin */}
      {assessment.attachments?.length > 0 && (
        <div className="glass-card rounded-2xl border border-surface-700/50 bg-surface-900/60 p-6 mb-6">
          <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Reference Materials</h3>
          <div className="space-y-2">
            {assessment.attachments.map((file, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700">
                <Paperclip size={14} className="text-primary-400 shrink-0" />
                <span className="text-sm text-surface-300 font-medium">{file}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission Area */}
      <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 p-6 sm:p-8 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Submission</h3>

        {/* File Upload */}
        {(assessment.submissionType === 'file' || assessment.submissionType === 'both') && (
          <div>
            <label className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2 block">Upload Files</label>
            <label className="flex flex-col items-center justify-center py-8 px-4 rounded-2xl border-2 border-dashed border-surface-700 hover:border-primary-500/30 transition-all cursor-pointer bg-surface-900/30">
              <Upload size={28} className="text-surface-500 mb-2" />
              <p className="text-sm font-bold text-surface-300">Drop files here or click to browse</p>
              <p className="text-[10px] text-surface-500 mt-1">PDF, DOC, ZIP, PY, IPYNB</p>
              <input type="file" multiple onChange={handleFileSelect} className="hidden" />
            </label>
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/50 border border-surface-700">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-primary-400" />
                      <span className="text-sm text-surface-300">{f}</span>
                    </div>
                    <button onClick={() => removeFile(i)} className="p-1 text-surface-500 hover:text-rose-400 transition-colors"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Text Answer */}
        {(assessment.submissionType === 'text' || assessment.submissionType === 'both') && (
          <div>
            <label className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2 block">Written Answer</label>
            <textarea
              value={textAnswer}
              onChange={e => setTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={8}
              className="w-full px-4 py-3 rounded-xl bg-surface-900/80 border border-surface-700 text-sm text-white placeholder-surface-500 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all resize-none"
            />
            <p className="text-[10px] text-surface-500 mt-1">{textAnswer.length} characters</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl gradient-primary text-surface-950 font-bold text-base shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} /> Submit {assessment.type === 'task' ? 'Task' : 'Assignment'}
        </button>
      </div>
    </div>
  );
}

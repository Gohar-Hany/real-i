import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import * as api from '@/services/api';

const AssessmentContext = createContext(null);

// ── Helper ───────────────────────────────────────────────────
const generateQId = () => `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ── Provider ─────────────────────────────────────────────────
export function AssessmentProvider({ children }) {
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch all assessments from backend ────────────────────
  const fetchAssessments = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await api.getAssessments(params);
      setAssessments(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error('Failed to fetch assessments:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Admin Actions ──────────────────────────────────────────
  const createAssessment = useCallback(async (data) => {
    try {
      // Map frontend field names to backend field names
      const payload = {
        title: data.title,
        type: data.type,
        course_id: data.courseId || data.course_id,
        description: data.description || '',
        instructions: data.instructions || '',
        start_date: data.startDate || data.start_date || null,
        end_date: data.endDate || data.end_date || null,
        time_limit: data.timeLimit || data.time_limit || 0,
        passing_grade: data.passingGrade || data.passing_grade || 60,
        total_marks: data.totalMarks || data.total_marks || 100,
        max_attempts: data.attempts || data.max_attempts || 1,
        shuffle_questions: data.randomizeQuestions || data.shuffle_questions || false,
        show_results: data.showAnswersAfterSubmission ?? data.show_results ?? true,
        status: data.status || 'draft',
        questions: (data.questions || []).map(q => ({
          question: q.text || q.question,
          type: 'mcq',
          options: q.options ? (
            Array.isArray(q.options)
              ? { A: q.options[0], B: q.options[1], C: q.options[2], D: q.options[3] }
              : q.options
          ) : {},
          correct_answer: typeof q.correctAnswer === 'number'
            ? ['A', 'B', 'C', 'D'][q.correctAnswer]
            : (q.correct_answer || q.correctAnswer || ''),
          explanation: q.explanation || '',
          marks: q.marks || 1,
        })),
        settings: {
          autoGrade: data.autoGrade ?? true,
          saveProgress: data.saveProgress ?? false,
          submissionType: data.submissionType || null,
          allowLateSubmission: data.allowLateSubmission ?? false,
          assessmentSubType: data.assessmentSubType || null,
          attachments: data.attachments || [],
        },
      };

      const result = await api.createAssessment(payload);
      setAssessments(prev => [mapAssessmentToFrontend(result), ...prev]);
      return result;
    } catch (err) {
      console.error('Failed to create assessment:', err);
      throw err;
    }
  }, []);

  const updateAssessment = useCallback(async (id, data) => {
    try {
      const payload = { ...data };
      // Map fields if needed
      if (data.courseId) payload.course_id = data.courseId;
      if (data.startDate) payload.start_date = data.startDate;
      if (data.endDate) payload.end_date = data.endDate;
      if (data.timeLimit !== undefined) payload.time_limit = data.timeLimit;
      if (data.passingGrade !== undefined) payload.passing_grade = data.passingGrade;
      if (data.totalMarks !== undefined) payload.total_marks = data.totalMarks;

      if (data.questions) {
        payload.questions = data.questions.map(q => ({
          question: q.text || q.question,
          type: 'mcq',
          options: Array.isArray(q.options)
            ? { A: q.options[0], B: q.options[1], C: q.options[2], D: q.options[3] }
            : (q.options || {}),
          correct_answer: typeof q.correctAnswer === 'number'
            ? ['A', 'B', 'C', 'D'][q.correctAnswer]
            : (q.correct_answer || q.correctAnswer || ''),
          explanation: q.explanation || '',
          marks: q.marks || 1,
        }));
      }

      const result = await api.updateAssessment(id, payload);
      setAssessments(prev => prev.map(a =>
        a.id === id ? mapAssessmentToFrontend(result) : a
      ));
      return result;
    } catch (err) {
      console.error('Failed to update assessment:', err);
      throw err;
    }
  }, []);

  const deleteAssessment = useCallback(async (id) => {
    try {
      await api.deleteAssessment(id);
      setAssessments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete assessment:', err);
      throw err;
    }
  }, []);

  const publishAssessment = useCallback(async (id) => {
    try {
      const result = await api.publishAssessment(id);
      setAssessments(prev => prev.map(a =>
        a.id === id ? { ...a, status: result.new_status } : a
      ));
      return result;
    } catch (err) {
      console.error('Failed to toggle publish:', err);
      throw err;
    }
  }, []);

  const duplicateAssessment = useCallback(async (id) => {
    const original = assessments.find(a => a.id === id);
    if (!original) return null;
    // Create a copy via API
    const copyData = {
      ...original,
      title: `${original.title} (Copy)`,
      status: 'draft',
      id: undefined,
    };
    return createAssessment(copyData);
  }, [assessments, createAssessment]);

  // ── Student Actions ────────────────────────────────────────
  const submitAssessmentAction = useCallback(async (assessmentId, studentData) => {
    try {
      // Map answers from index-based to letter-based for backend
      const mappedAnswers = {};
      if (studentData.answers) {
        Object.entries(studentData.answers).forEach(([key, val]) => {
          // Convert numeric index to letter: 0→A, 1→B, 2→C, 3→D
          const answerLetter = typeof val === 'number' ? ['A', 'B', 'C', 'D'][val] : val;
          mappedAnswers[key] = answerLetter;
        });
      }

      const result = await api.submitAssessment(assessmentId, {
        answers: mappedAnswers,
        time_taken: studentData.timeTaken || 0,
        files: studentData.files || [],
        student_email: studentData.studentEmail || studentData.student_email || '',
      });

      // Update local assessments & submissions to mark as submitted
      setAssessments(prev => prev.map(a =>
        a.id === assessmentId ? { ...a, is_submitted: true, submission: result } : a
      ));
      setSubmissions(prev => [result, ...prev.filter(s => s.assessment_id !== assessmentId)]);

      return result;
    } catch (err) {
      console.error('Failed to submit assessment:', err);
      throw err;
    }
  }, []);

  const saveProgress = useCallback(() => {
    // Progress saving can be handled client-side as it's temporary
    console.log('Progress saved locally (not persisted to server until submit)');
  }, []);

  // ── Queries ────────────────────────────────────────────────
  const getAssessmentById = useCallback((id) =>
    assessments.find(a => a.id === id) || null,
  [assessments]);

  const getSubmissionsForAssessment = useCallback(async (assessmentId) => {
    try {
      const data = await api.getAssessmentSubmissions(assessmentId);
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  }, []);

  const getMySubmissionsAction = useCallback(async () => {
    try {
      const data = await api.getMySubmissions();
      setSubmissions(Array.isArray(data) ? data : []);
      return data;
    } catch { return []; }
  }, []);

  const getStudentSubmission = useCallback((assessmentId, studentId) => {
    // Check assessment object first, then submissions state array
    const assessment = assessments.find(a => a.id === assessmentId);
    if (assessment?.submission) return assessment.submission;
    return submissions.find(s => (s.assessment_id === assessmentId || s.assessment_id?.id === assessmentId || s.assessment?.id === assessmentId)) || null;
  }, [assessments, submissions]);

  const getInProgressSubmission = useCallback(() => null, []);

  const getAssessmentStats = useCallback(async (assessmentId) => {
    try {
      const subs = await api.getAssessmentSubmissions(assessmentId);
      const list = Array.isArray(subs) ? subs : [];
      if (list.length === 0) return { submissions: 0, avgScore: 0, highest: 0, lowest: 0 };
      const scores = list.filter(s => s.score != null).map(s => s.score);
      return {
        submissions: list.length,
        avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        highest: scores.length > 0 ? Math.max(...scores) : 0,
        lowest: scores.length > 0 ? Math.min(...scores) : 0,
      };
    } catch {
      return { submissions: 0, avgScore: 0, highest: 0, lowest: 0 };
    }
  }, []);

  const value = useMemo(() => ({
    assessments,
    submissions,
    loading,
    // Fetch
    fetchAssessments,
    // Admin
    createAssessment,
    updateAssessment,
    deleteAssessment,
    publishAssessment,
    duplicateAssessment,
    // Student
    submitAssessment: submitAssessmentAction,
    saveProgress,
    // Queries
    getAssessmentById,
    getSubmissionsForAssessment,
    getMySubmissions: getMySubmissionsAction,
    getStudentSubmission,
    getInProgressSubmission,
    getAssessmentStats,
    generateQId,
  }), [assessments, submissions, loading, fetchAssessments, createAssessment, updateAssessment, deleteAssessment, publishAssessment, duplicateAssessment, submitAssessmentAction, saveProgress, getAssessmentById, getSubmissionsForAssessment, getMySubmissionsAction, getStudentSubmission, getInProgressSubmission, getAssessmentStats]);

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

// ── Map backend assessment format to frontend-compatible format ──
function mapAssessmentToFrontend(a) {
  return {
    ...a,
    courseId: a.course_id || a.courseId,
    startDate: a.start_date || a.startDate,
    endDate: a.end_date || a.endDate,
    timeLimit: a.time_limit || a.timeLimit || 0,
    passingGrade: a.passing_grade || a.passingGrade || 60,
    totalMarks: a.total_marks || a.totalMarks || 100,
    attempts: a.max_attempts || a.attempts || 1,
    randomizeQuestions: a.shuffle_questions || a.randomizeQuestions || false,
    showAnswersAfterSubmission: a.show_results ?? a.showAnswersAfterSubmission ?? true,
    autoGrade: a.settings?.autoGrade ?? ['quiz', 'exam'].includes(a.type),
    saveProgress: a.settings?.saveProgress ?? false,
    submissionType: a.settings?.submissionType || null,
    allowLateSubmission: a.settings?.allowLateSubmission ?? false,
    assessmentSubType: a.settings?.assessmentSubType || null,
    attachments: a.settings?.attachments || [],
    createdAt: a.created_at || a.createdAt,
    updatedAt: a.updated_at || a.updatedAt,
    questions: (a.questions || []).map((q, idx) => ({
      id: `q-${idx}`,
      text: q.question || q.text,
      question: q.question || q.text,
      options: q.options
        ? (typeof q.options === 'object' && !Array.isArray(q.options)
          ? [q.options.A, q.options.B, q.options.C, q.options.D].filter(Boolean)
          : q.options)
        : [],
      correctAnswer: typeof q.correct_answer === 'string'
        ? ['A', 'B', 'C', 'D'].indexOf(q.correct_answer)
        : (q.correctAnswer ?? 0),
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
      marks: q.marks || 1,
      shuffleOptions: false,
    })),
  };
}

export function useAssessments() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessments must be used within AssessmentProvider');
  return ctx;
}

export { generateQId };

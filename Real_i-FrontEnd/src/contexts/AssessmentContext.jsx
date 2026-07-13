import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AssessmentContext = createContext(null);
const STORAGE_KEY = 'reali_assessments';
const SUBMISSIONS_KEY = 'reali_submissions';

// ── Seed Data ────────────────────────────────────────────────
const SEED_ASSESSMENTS = [
  {
    id: 'assess-1',
    type: 'quiz',
    assessmentSubType: 'mcq_exam',
    title: 'Neural Networks Fundamentals Quiz',
    description: 'Test your understanding of basic neural network architectures, activation functions, and backpropagation.',
    courseId: 'testproject1',
    startDate: '2025-01-01T00:00',
    endDate: '2026-12-31T23:59',
    timeLimit: 30,
    attempts: 3,
    passingGrade: 60,
    totalMarks: 50,
    randomizeQuestions: true,
    showAnswersAfterSubmission: true,
    autoGrade: true,
    saveProgress: true,
    status: 'published',
    submissionType: null,
    allowLateSubmission: false,
    attachments: [],
    questions: [
      { id: 'q1', text: 'What is the primary purpose of an activation function in a neural network?', options: ['To normalize input data', 'To introduce non-linearity', 'To reduce overfitting', 'To speed up training'], correctAnswer: 1, marks: 10, shuffleOptions: true, explanation: 'Activation functions introduce non-linearity, allowing neural networks to learn complex patterns beyond linear relationships.' },
      { id: 'q2', text: 'Which optimizer is known for adapting the learning rate for each parameter?', options: ['SGD', 'Adam', 'Batch Gradient Descent', 'Mini-batch GD'], correctAnswer: 1, marks: 10, shuffleOptions: false, explanation: 'Adam (Adaptive Moment Estimation) maintains per-parameter learning rates that are adapted based on first and second moments of gradients.' },
      { id: 'q3', text: 'What does the term "epoch" mean in training?', options: ['One forward pass', 'One backward pass', 'One complete pass through the entire training dataset', 'One batch of data'], correctAnswer: 2, marks: 10, shuffleOptions: true, explanation: 'An epoch is one complete pass through the entire training dataset during the training process.' },
      { id: 'q4', text: 'Which layer type is primarily used for image recognition tasks?', options: ['Fully Connected Layer', 'Convolutional Layer', 'Recurrent Layer', 'Embedding Layer'], correctAnswer: 1, marks: 10, shuffleOptions: true, explanation: 'Convolutional layers are designed to process spatial data like images by detecting local patterns through learned filters.' },
      { id: 'q5', text: 'What is dropout used for in neural networks?', options: ['Faster training', 'Regularization to prevent overfitting', 'Increasing model capacity', 'Data augmentation'], correctAnswer: 1, marks: 10, shuffleOptions: false, explanation: 'Dropout randomly deactivates neurons during training, which acts as regularization to prevent overfitting.' },
    ],
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'assess-2',
    type: 'exam',
    assessmentSubType: 'midterm',
    title: 'Midterm Exam — Machine Learning',
    description: 'Comprehensive midterm examination covering supervised learning, unsupervised learning, and model evaluation.',
    courseId: 'testproject1',
    startDate: '2025-10-15T09:00',
    endDate: '2026-12-20T11:00',
    timeLimit: 90,
    attempts: 1,
    passingGrade: 50,
    totalMarks: 100,
    randomizeQuestions: true,
    showAnswersAfterSubmission: false,
    autoGrade: true,
    saveProgress: true,
    status: 'published',
    submissionType: null,
    allowLateSubmission: false,
    attachments: [],
    questions: [
      { id: 'mq1', text: 'Which algorithm is used for classification tasks?', options: ['Linear Regression', 'K-Means', 'Logistic Regression', 'PCA'], correctAnswer: 2, marks: 20, shuffleOptions: true, explanation: 'Logistic Regression is a classification algorithm that predicts the probability of a categorical outcome.' },
      { id: 'mq2', text: 'What is the bias-variance tradeoff?', options: ['Balancing training speed vs accuracy', 'Balancing model complexity vs generalization', 'Balancing data size vs features', 'Balancing CPU vs GPU usage'], correctAnswer: 1, marks: 20, shuffleOptions: true, explanation: 'The bias-variance tradeoff is about finding the right model complexity to minimize both underfitting (high bias) and overfitting (high variance).' },
      { id: 'mq3', text: 'What metric is best for imbalanced classification?', options: ['Accuracy', 'F1 Score', 'Mean Squared Error', 'R-squared'], correctAnswer: 1, marks: 20, shuffleOptions: false, explanation: 'F1 Score balances precision and recall, making it suitable for imbalanced datasets where accuracy can be misleading.' },
      { id: 'mq4', text: 'Which technique reduces dimensionality?', options: ['Gradient Boosting', 'Random Forest', 'PCA', 'Cross-Validation'], correctAnswer: 2, marks: 20, shuffleOptions: true, explanation: 'PCA (Principal Component Analysis) reduces dimensionality by projecting data onto the directions of maximum variance.' },
      { id: 'mq5', text: 'What is cross-validation used for?', options: ['Feature selection', 'Model evaluation and hyperparameter tuning', 'Data cleaning', 'Normalization'], correctAnswer: 1, marks: 20, shuffleOptions: true, explanation: 'Cross-validation evaluates model performance by splitting data into multiple train/test folds to get a reliable estimate of generalization ability.' },
    ],
    createdAt: '2025-10-01T08:00:00Z',
    updatedAt: '2025-10-01T08:00:00Z',
  },
  {
    id: 'assess-3',
    type: 'assignment',
    assessmentSubType: null,
    title: 'Build a Simple CNN Classifier',
    description: 'Implement a Convolutional Neural Network using PyTorch or TensorFlow to classify the CIFAR-10 dataset. Your submission should include the code, a brief report on your architecture choices, and training curves.',
    courseId: 'testproject1',
    startDate: '2025-09-15T00:00',
    endDate: '2026-12-25T23:59',
    timeLimit: null,
    attempts: 1,
    passingGrade: 60,
    totalMarks: 100,
    randomizeQuestions: false,
    showAnswersAfterSubmission: true,
    autoGrade: false,
    saveProgress: false,
    status: 'published',
    submissionType: 'both',
    allowLateSubmission: true,
    attachments: ['CIFAR10_Guidelines.pdf', 'Grading_Rubric.pdf'],
    questions: [],
    createdAt: '2025-09-10T12:00:00Z',
    updatedAt: '2025-09-10T12:00:00Z',
  },
  {
    id: 'assess-4',
    type: 'task',
    assessmentSubType: null,
    title: 'Data Preprocessing Exercise',
    description: 'Clean and preprocess the provided raw dataset. Handle missing values, encode categorical features, and normalize numerical columns. Submit your cleaned CSV file.',
    courseId: 'testproject1',
    startDate: '2025-09-20T00:00',
    endDate: '2026-12-28T23:59',
    timeLimit: null,
    attempts: 1,
    passingGrade: 0,
    totalMarks: 30,
    randomizeQuestions: false,
    showAnswersAfterSubmission: true,
    autoGrade: false,
    saveProgress: false,
    status: 'published',
    submissionType: 'file',
    allowLateSubmission: false,
    attachments: ['raw_data.csv'],
    questions: [],
    createdAt: '2025-09-18T14:00:00Z',
    updatedAt: '2025-09-18T14:00:00Z',
  },
  {
    id: 'assess-5',
    type: 'quiz',
    assessmentSubType: 'practice',
    title: 'Python Basics — Practice Test',
    description: 'A low-stakes practice quiz to reinforce Python fundamentals. Unlimited attempts allowed.',
    courseId: 'testproject1',
    startDate: '2025-09-01T00:00',
    endDate: '2027-01-01T00:00',
    timeLimit: 15,
    attempts: -1,
    passingGrade: 0,
    totalMarks: 30,
    randomizeQuestions: true,
    showAnswersAfterSubmission: true,
    autoGrade: true,
    saveProgress: false,
    status: 'published',
    submissionType: null,
    allowLateSubmission: false,
    attachments: [],
    questions: [
      { id: 'pq1', text: 'What is the output of print(type([]))?', options: ["<class 'list'>", "<class 'tuple'>", "<class 'dict'>", "<class 'set'>"], correctAnswer: 0, marks: 10, shuffleOptions: false, explanation: '[] creates an empty list, so type([]) returns <class \'list\'>.' },
      { id: 'pq2', text: 'Which keyword is used to define a function in Python?', options: ['function', 'func', 'def', 'define'], correctAnswer: 2, marks: 10, shuffleOptions: true, explanation: 'Python uses the "def" keyword to define functions.' },
      { id: 'pq3', text: 'What does "len()" return for the string "Hello"?', options: ['4', '5', '6', 'Error'], correctAnswer: 1, marks: 10, shuffleOptions: false, explanation: 'len("Hello") returns 5 because the string contains 5 characters.' },
    ],
    createdAt: '2025-08-25T09:00:00Z',
    updatedAt: '2025-08-25T09:00:00Z',
  },
  {
    id: 'assess-6',
    type: 'exam',
    assessmentSubType: 'final',
    title: 'Final Exam — Deep Learning',
    description: 'Comprehensive final examination covering all course material. This exam will test advanced concepts in deep learning.',
    courseId: 'testproject1',
    startDate: '2026-12-20T09:00',
    endDate: '2027-01-15T17:00',
    timeLimit: 120,
    attempts: 1,
    passingGrade: 50,
    totalMarks: 150,
    randomizeQuestions: true,
    showAnswersAfterSubmission: false,
    autoGrade: true,
    saveProgress: true,
    status: 'draft',
    submissionType: null,
    allowLateSubmission: false,
    attachments: [],
    questions: [
      { id: 'fq1', text: 'What is the vanishing gradient problem?', options: ['Gradients grow too large', 'Gradients shrink to near zero in deep networks', 'Loss function diverges', 'Learning rate is too high'], correctAnswer: 1, marks: 30, shuffleOptions: true, explanation: 'In deep networks, gradients can become extremely small during backpropagation, effectively preventing early layers from learning.' },
      { id: 'fq2', text: 'Which architecture introduced the attention mechanism?', options: ['ResNet', 'Transformer', 'LSTM', 'GAN'], correctAnswer: 1, marks: 30, shuffleOptions: true, explanation: 'The Transformer architecture, introduced in "Attention Is All You Need" (2017), pioneered the self-attention mechanism.' },
    ],
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-01T10:00:00Z',
  },
];

// ── Helper ───────────────────────────────────────────────────
const generateId = () => `assess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const generateSubId = () => `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const generateQId = () => `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* ignore quota errors */ }
}

// ── Provider ─────────────────────────────────────────────────
export function AssessmentProvider({ children }) {
  const [assessments, setAssessments] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEY, null);
    return stored && stored.length > 0 ? stored : SEED_ASSESSMENTS;
  });

  const [submissions, setSubmissions] = useState(() => loadFromStorage(SUBMISSIONS_KEY, []));

  // Persist on change
  useEffect(() => { saveToStorage(STORAGE_KEY, assessments); }, [assessments]);
  useEffect(() => { saveToStorage(SUBMISSIONS_KEY, submissions); }, [submissions]);

  // ── Admin Actions ──────────────────────────────────────────
  const createAssessment = useCallback((data) => {
    const now = new Date().toISOString();
    const assessment = {
      ...data,
      id: generateId(),
      questions: (data.questions || []).map(q => ({ ...q, id: q.id || generateQId() })),
      createdAt: now,
      updatedAt: now,
    };
    setAssessments(prev => [assessment, ...prev]);
    return assessment;
  }, []);

  const updateAssessment = useCallback((id, data) => {
    setAssessments(prev => prev.map(a =>
      a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
    ));
  }, []);

  const deleteAssessment = useCallback((id) => {
    setAssessments(prev => prev.filter(a => a.id !== id));
    setSubmissions(prev => prev.filter(s => s.assessmentId !== id));
  }, []);

  const publishAssessment = useCallback((id) => {
    setAssessments(prev => prev.map(a =>
      a.id === id ? { ...a, status: a.status === 'published' ? 'draft' : 'published', updatedAt: new Date().toISOString() } : a
    ));
  }, []);

  const duplicateAssessment = useCallback((id) => {
    const original = assessments.find(a => a.id === id);
    if (!original) return null;
    const now = new Date().toISOString();
    const copy = {
      ...original,
      id: generateId(),
      title: `${original.title} (Copy)`,
      status: 'draft',
      questions: original.questions.map(q => ({ ...q, id: generateQId() })),
      createdAt: now,
      updatedAt: now,
    };
    setAssessments(prev => [copy, ...prev]);
    return copy;
  }, [assessments]);

  // ── Student Actions ────────────────────────────────────────
  const submitAssessment = useCallback((assessmentId, studentData) => {
    const now = new Date().toISOString();
    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) return null;

    // Auto-grade MCQ
    let score = 0;
    let totalMarks = assessment.totalMarks || 0;
    if (assessment.autoGrade && assessment.questions.length > 0 && studentData.answers) {
      assessment.questions.forEach((q, idx) => {
        if (studentData.answers[idx] === q.correctAnswer) {
          score += q.marks || 0;
        }
      });
    }

    // Check for existing in-progress submission
    const existingIdx = submissions.findIndex(
      s => s.assessmentId === assessmentId && s.studentId === studentData.studentId && s.status === 'in_progress'
    );

    const submission = {
      id: existingIdx >= 0 ? submissions[existingIdx].id : generateSubId(),
      assessmentId,
      studentId: studentData.studentId,
      studentName: studentData.studentName,
      studentEmail: studentData.studentEmail,
      status: assessment.autoGrade ? 'graded' : 'submitted',
      answers: studentData.answers || {},
      score: assessment.autoGrade ? score : null,
      totalMarks,
      feedback: '',
      startedAt: existingIdx >= 0 ? submissions[existingIdx].startedAt : studentData.startedAt || now,
      submittedAt: now,
      files: studentData.files || [],
      textAnswer: studentData.textAnswer || '',
    };

    if (existingIdx >= 0) {
      setSubmissions(prev => prev.map((s, i) => i === existingIdx ? submission : s));
    } else {
      setSubmissions(prev => [...prev, submission]);
    }
    return submission;
  }, [assessments, submissions]);

  const saveProgress = useCallback((assessmentId, studentData) => {
    const now = new Date().toISOString();
    const existingIdx = submissions.findIndex(
      s => s.assessmentId === assessmentId && s.studentId === studentData.studentId && s.status === 'in_progress'
    );

    const progressData = {
      id: existingIdx >= 0 ? submissions[existingIdx].id : generateSubId(),
      assessmentId,
      studentId: studentData.studentId,
      studentName: studentData.studentName,
      studentEmail: studentData.studentEmail,
      status: 'in_progress',
      answers: studentData.answers || {},
      score: null,
      totalMarks: null,
      feedback: '',
      startedAt: existingIdx >= 0 ? submissions[existingIdx].startedAt : now,
      submittedAt: null,
      files: studentData.files || [],
      textAnswer: studentData.textAnswer || '',
    };

    if (existingIdx >= 0) {
      setSubmissions(prev => prev.map((s, i) => i === existingIdx ? progressData : s));
    } else {
      setSubmissions(prev => [...prev, progressData]);
    }
  }, [submissions]);

  // ── Queries ────────────────────────────────────────────────
  const getAssessmentById = useCallback((id) => assessments.find(a => a.id === id) || null, [assessments]);

  const getSubmissionsForAssessment = useCallback((assessmentId) =>
    submissions.filter(s => s.assessmentId === assessmentId),
  [submissions]);

  const getMySubmissions = useCallback((studentId) =>
    submissions.filter(s => s.studentId === studentId),
  [submissions]);

  const getStudentSubmission = useCallback((assessmentId, studentId) =>
    submissions.find(s => s.assessmentId === assessmentId && s.studentId === studentId && s.status !== 'in_progress') || null,
  [submissions]);

  const getInProgressSubmission = useCallback((assessmentId, studentId) =>
    submissions.find(s => s.assessmentId === assessmentId && s.studentId === studentId && s.status === 'in_progress') || null,
  [submissions]);

  const getAssessmentStats = useCallback((assessmentId) => {
    const subs = submissions.filter(s => s.assessmentId === assessmentId && s.status !== 'in_progress');
    if (subs.length === 0) return { submissions: 0, avgScore: 0, highest: 0, lowest: 0, completionRate: 0 };
    const scores = subs.filter(s => s.score != null).map(s => s.score);
    return {
      submissions: subs.length,
      avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      highest: scores.length > 0 ? Math.max(...scores) : 0,
      lowest: scores.length > 0 ? Math.min(...scores) : 0,
      inProgress: submissions.filter(s => s.assessmentId === assessmentId && s.status === 'in_progress').length,
    };
  }, [submissions]);

  const value = useMemo(() => ({
    assessments,
    submissions,
    // Admin
    createAssessment,
    updateAssessment,
    deleteAssessment,
    publishAssessment,
    duplicateAssessment,
    // Student
    submitAssessment,
    saveProgress,
    // Queries
    getAssessmentById,
    getSubmissionsForAssessment,
    getMySubmissions,
    getStudentSubmission,
    getInProgressSubmission,
    getAssessmentStats,
    generateQId,
  }), [assessments, submissions, createAssessment, updateAssessment, deleteAssessment, publishAssessment, duplicateAssessment, submitAssessment, saveProgress, getAssessmentById, getSubmissionsForAssessment, getMySubmissions, getStudentSubmission, getInProgressSubmission, getAssessmentStats]);

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessments() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessments must be used within AssessmentProvider');
  return ctx;
}

export { generateQId };

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { generateQuiz, getProjects, getAssignedQuizzes, submitQuizResult, getCompletedQuizzes } from '@/services/api';
import { useToast } from '@/components/common/Toast';
import Select from '@/components/common/Select';
import {
  BrainCircuit, Loader2, CheckCircle, XCircle, ArrowRight,
  RotateCcw, Trophy, Target, Clock, Sparkles, Lightbulb
} from 'lucide-react';

const STATES = { SETUP: 'setup', LOADING: 'loading', QUIZ: 'quiz', RESULTS: 'results' };

export default function StudentQuiz() {
  const [state, setState] = useState(STATES.SETUP);
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('testproject1');
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [animatedOffset, setAnimatedOffset] = useState(2 * Math.PI * 60);
  const { user } = useAuth();

  const [answers, setAnswers] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [quizScore, setQuizScore] = useState(null);
  const [quizTotal, setQuizTotal] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (state === STATES.RESULTS) {
      const correctCount = quizScore !== null ? quizScore : answers.filter(a => a.isCorrect).length;
      const totalCount = quizTotal !== null ? quizTotal : answers.length;
      const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      const circumference = 2 * Math.PI * 60;
      const offset = circumference - (percentage / 100) * circumference;
      
      const timer = setTimeout(() => {
        setAnimatedOffset(offset);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // safe fallback
      setAnimatedOffset(2 * Math.PI * 60);
    }
  }, [state, quizScore, quizTotal, answers]);

  const [assignedQuizzes, setAssignedQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const list = await getProjects();
        setProjects(list);
        if (list.length > 0) {
          const hasTest = list.some(p => p.project_id === 'testproject1');
          setProjectId(hasTest ? 'testproject1' : list[0].project_id);
          
          let allQuizzes = [];
          
          let completedTasksMap = {};
          try {
             const res = await getCompletedQuizzes(user?.id);
             if (res.completed_tasks) {
               res.completed_tasks.forEach(ct => {
                 completedTasksMap[ct.task_id] = ct;
               });
             }
          } catch (e) {
             console.error("Failed to fetch completed quizzes", e);
          }
          
          for (const project of list) {
            try {
              const projectQuizzes = await getAssignedQuizzes(project.project_id);
              if (projectQuizzes && projectQuizzes.length > 0) {
                 const enrichedQuizzes = projectQuizzes
                   .map(q => {
                     const completedData = completedTasksMap[q.task_id];
                     return {
                       ...q, 
                       project_id: project.project_id,
                       isCompleted: !!completedData,
                       score: completedData?.score,
                       total: completedData?.total,
                       pastAnswers: completedData?.answers
                     };
                   })
                   .filter(q => q.topic && q.topic !== 'N/A' && q.quiz?.questions?.length > 0);
                 allQuizzes = [...allQuizzes, ...enrichedQuizzes];
              }
            } catch (err) {
              console.error(`Failed to load quizzes for ${project.project_id}:`, err);
            }
          }
          // Sort: Uncompleted first, then completed
          allQuizzes.sort((a, b) => (a.isCompleted === b.isCompleted) ? 0 : a.isCompleted ? 1 : -1);
          setAssignedQuizzes(allQuizzes);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    fetchQuizzes();
    
    const intervalId = setInterval(fetchQuizzes, 30000);
    return () => clearInterval(intervalId);
  }, [user?.id]);

  const startAssignedQuiz = (quizItem) => {
    setQuizData(quizItem.quiz);
    setTopic(quizItem.topic);
    setActiveTaskId(quizItem.task_id);
    
    if (quizItem.isCompleted) {
      if (quizItem.pastAnswers) {
        const pastAnswersObj = quizItem.pastAnswers;
        const pastAnswersArray = Object.keys(pastAnswersObj)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(k => pastAnswersObj[k]);
        setAnswers(pastAnswersArray);
      } else {
        setAnswers([]);
      }
      setQuizScore(quizItem.score);
      setQuizTotal(quizItem.total);
      setState(STATES.RESULTS);
    } else {
      setCurrentQuestion(0);
      setAnswers([]);
      setQuizScore(null);
      setQuizTotal(null);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setState(STATES.QUIZ);
    }
  };


  const startQuiz = async () => {
    if (!topic.trim()) {
      toast.warning('Please enter a topic');
      return;
    }
    setState(STATES.LOADING);
    try {
      const result = await generateQuiz(projectId, topic, numQuestions);
      setQuizData(result.quiz);
      setCurrentQuestion(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setState(STATES.QUIZ);
    } catch (err) {
      toast.error(`Failed to generate quiz: ${err.message}`);
      setState(STATES.SETUP);
    }
  };

  const handleAnswer = (optionKey) => {
    if (selectedAnswer) return;
    setSelectedAnswer(optionKey);
    setShowExplanation(true);
    const question = quizData.questions[currentQuestion];
    const correctAnsKey = question.correct_answer ? question.correct_answer.trim() : "";
    setAnswers(prev => [...prev, {
      question: question.question,
      selected: optionKey,
      selectedText: question.options[optionKey],
      correct: correctAnsKey,
      correctText: question.options[correctAnsKey],
      isCorrect: optionKey === correctAnsKey,
    }]);
  };

  const nextQuestion = async () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Calculate Score for both assigned and custom quizzes
      const score = answers.filter(a => a.isCorrect).length;
      setQuizScore(score);
      setQuizTotal(quizData.questions.length);

      if (activeTaskId) {
        try {
            await submitQuizResult({
              student_id: user?.id,
              task_id: activeTaskId,
              score: score,
              total: quizData.questions.length,
              answers: answers.reduce((acc, curr, index) => {
                 acc[index] = curr;
                 return acc;
              }, {})
            });
            setAssignedQuizzes(prev => {
              const updated = prev.map(q => 
                q.task_id === activeTaskId 
                  ? { ...q, isCompleted: true, score: score, total: quizData.questions.length }
                  : q
              );
              return updated.sort((a, b) => (a.isCompleted === b.isCompleted) ? 0 : a.isCompleted ? 1 : -1);
            });
          } catch (e) {
            toast.error("Failed to save quiz result");
          }
      }
      setState(STATES.RESULTS);
    }
  };

  const resetQuiz = () => {
    setState(STATES.SETUP);
    setQuizData(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizScore(null);
    setQuizTotal(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setActiveTaskId(null);
    setTopic('');
    setAnimatedOffset(2 * Math.PI * 60);
  };

  const retryQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizScore(null);
    setQuizTotal(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setState(STATES.QUIZ);
  };

  // ── SETUP SCREEN ──────────────────────────────────────────
  if (state === STATES.SETUP) {
    return (
      <div className="animate-fade-in-up pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md">
              <BrainCircuit size={14} className="text-primary-400" />
              <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
                AI Testing Center
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Quizzes</span>
            </h1>
            <p className="text-surface-400 text-sm sm:text-base max-w-xl leading-relaxed">
              Test your knowledge with AI-generated quizzes tailored specifically to your learning materials.
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative z-50 glass-card rounded-3xl border border-surface-700/50 p-8 sm:p-10 shadow-2xl bg-surface-900/60 group">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary-500/20 transition-all duration-700"></div>
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-amber-500/5 border border-primary-500/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(212,175,55,0.15)] relative z-10">
              <Sparkles size={32} className="text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-8 relative z-10">
              Configure Your Quiz
            </h2>

            <div className="space-y-6 relative z-10">
              {projects.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-surface-300 mb-2 uppercase tracking-wide">
                    Select Course
                  </label>
                  <div className="relative z-10 w-full md:w-64">
                  <Select
                    value={selectedTopic}
                    onChange={(val) => setSelectedTopic(val)}
                    options={topics}
                    placeholder="All Topics"
                  />
                </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-surface-300 mb-2 uppercase tracking-wide">
                  Topic Focus
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-surface-800/80 border border-surface-700 text-sm outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all text-white placeholder:text-surface-500 font-medium"
                  placeholder="e.g., Neural Networks, Sorting Algorithms..."
                  onKeyDown={(e) => e.key === 'Enter' && startQuiz()}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-300 mb-2 uppercase tracking-wide">
                  Number of Questions
                </label>
                <div className="flex gap-3">
                  {[3, 5, 10, 15].map(n => (
                    <button
                      key={n}
                      onClick={() => setNumQuestions(n)}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                        numQuestions === n
                          ? 'bg-primary-500/10 text-primary-400 border-primary-500/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                          : 'bg-surface-800/50 text-surface-400 border-surface-700 hover:bg-surface-700 hover:text-white'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startQuiz}
                className="w-full mt-4 py-4 rounded-xl gradient-primary text-surface-950 font-bold text-base transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <BrainCircuit size={20} />
                Generate AI Quiz
              </button>

              {assignedQuizzes.length > 0 && (
                <div className="mt-10 pt-8 border-t border-surface-800/50">
                  <h3 className="text-sm font-bold text-surface-300 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <Target size={16} className="text-blue-400" />
                    Assigned Tasks
                  </h3>
                  <div className="space-y-3">
                    {assignedQuizzes.map((q, idx) => (
                      <button
                        key={q.task_id || idx}
                        onClick={() => startAssignedQuiz(q)}
                        className="w-full text-left p-4 rounded-2xl border border-surface-700/50 hover:border-blue-500/40 bg-surface-800/40 hover:bg-surface-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            q.isCompleted ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          }`}>
                            {q.isCompleted ? <CheckCircle size={18} /> : <Target size={18} />}
                          </div>
                          <div>
                            <p className={`text-sm font-bold truncate transition-colors ${
                              q.isCompleted ? 'text-surface-500 line-through decoration-surface-600' : 'text-white group-hover:text-blue-400'
                            }`}>
                              {q.topic}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-mono text-surface-400 bg-surface-900 px-2 py-0.5 rounded">
                                {q.quiz?.questions?.length || 5} Qs
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                q.priority === 'High' ? 'text-danger-400 bg-danger-500/10' : 'text-surface-400 bg-surface-900'
                              }`}>
                                {q.priority || 'High'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                          {q.isCompleted && q.score !== undefined && (
                            <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                              Score: {q.score}/{q.total}
                            </span>
                          )}
                          <div className="w-8 h-8 rounded-full bg-surface-900 border border-surface-700 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-colors">
                             <ArrowRight size={14} className="text-surface-400 group-hover:text-blue-400" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LOADING SCREEN ──────────────────────────────────────────
  if (state === STATES.LOADING) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-primary-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-amber-300 animate-[spin_1.5s_linear_infinite_reverse]"></div>
          <div className="absolute inset-4 rounded-full border-b-2 border-primary-400 opacity-50 animate-[spin_3s_linear_infinite]"></div>
          <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center backdrop-blur-sm border border-primary-500/20 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <BrainCircuit size={32} className="text-primary-400 animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-3 tracking-tight">
          Synthesizing Intelligence...
        </h2>
        <p className="text-surface-400 text-sm max-w-sm text-center font-medium">
          Our AI is scanning course materials and generating highly targeted questions on <strong className="text-primary-400">"{topic}"</strong>
        </p>
      </div>
    );
  }

  // ── QUIZ SCREEN ────────────────────────────────────────────
  if (state === STATES.QUIZ && quizData) {
    const question = quizData.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;
    const correctSoFar = answers.filter(a => a.isCorrect).length;

    return (
      <div className="animate-fade-in-up pb-10">
        <div className="max-w-4xl mx-auto">
          {/* Header & Progress Bar */}
          <div className="mb-8">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs font-mono text-primary-400 font-bold uppercase tracking-widest mb-1">
                  {quizData.topic}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Question <span className="text-primary-400">{currentQuestion + 1}</span> <span className="text-surface-500 text-lg">/ {quizData.questions.length}</span>
                </h2>
              </div>
              <div className="flex items-center gap-2 bg-surface-900 px-3 py-1.5 rounded-lg border border-surface-700">
                <Target size={14} className="text-emerald-400" />
                <span className="text-xs font-bold text-white">{correctSoFar} Correct</span>
              </div>
            </div>
            <div className="h-2 w-full bg-surface-900 rounded-full overflow-hidden border border-surface-800">
              <div
                className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #D4AF37, #e8c84a)' }}
              >
                <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div
            key={currentQuestion}
            className="glass-card rounded-3xl bg-surface-900/60 border border-surface-700/50 p-6 sm:p-10 shadow-2xl relative overflow-hidden animate-slide-up"
          >
            {/* Subtle Grid Bg */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-8 leading-relaxed relative z-10 drop-shadow-sm">
              {question.question}
            </h3>

            {/* Options */}
            <div className="space-y-4 relative z-10">
              {Object.entries(question.options).map(([key, value]) => {
                const isSelected = selectedAnswer === key;
                const isCorrect = key === question.correct_answer;
                const showResult = selectedAnswer !== null;

                let optionStyle = 'border-surface-700 bg-surface-800/50 hover:bg-surface-700 hover:border-primary-500/50';
                let indicatorStyle = 'bg-surface-900 border-surface-600 text-surface-400';
                
                if (showResult) {
                  if (isCorrect) {
                    optionStyle = 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]';
                    indicatorStyle = 'bg-emerald-500 text-surface-950 border-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'border-danger-500/50 bg-danger-500/10';
                    indicatorStyle = 'bg-danger-500 text-white border-danger-500';
                  } else {
                    optionStyle = 'border-surface-800 bg-surface-900/30 opacity-40';
                  }
                } else if (isSelected) {
                   // While strictly selected before evaluation (not possible here due to immediate eval, but good practice)
                   optionStyle = 'border-primary-500 bg-primary-500/10';
                }

                return (
                  <button
                    key={key}
                    onClick={() => handleAnswer(key)}
                    disabled={showResult}
                    className={`w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${optionStyle} disabled:cursor-default group text-left`}
                  >
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border transition-colors ${indicatorStyle}`}>
                      {showResult && isCorrect ? <CheckCircle size={20} /> :
                       showResult && isSelected && !isCorrect ? <XCircle size={20} /> :
                       key}
                    </span>
                    <span className={`text-sm sm:text-base font-semibold ${
                       showResult && isCorrect ? 'text-emerald-400' :
                       showResult && isSelected && !isCorrect ? 'text-danger-400' :
                       'text-surface-200 group-hover:text-white'
                    }`}>
                      {value}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-surface-900/80 border border-primary-500/20 relative overflow-hidden animate-slide-up shadow-inner">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                <div className="flex items-start gap-3 relative z-10">
                  <div className="p-2 rounded-lg bg-primary-500/10 shrink-0">
                    <Lightbulb size={20} className="text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-2">AI Explanation</p>
                    <p className="text-sm text-surface-300 leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          {selectedAnswer && (
            <div className="flex justify-end animate-fade-in-up mt-6">
              <button
                onClick={nextQuestion}
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl gradient-primary text-surface-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] active:scale-[0.98]"
              >
                {currentQuestion < quizData.questions.length - 1 ? (
                  <>Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                ) : (
                  <>Complete & View Results <Trophy size={18} className="group-hover:scale-110 transition-transform" /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS SCREEN ──────────────────────────────────────────
  if (state === STATES.RESULTS) {
    const correctCount = quizScore !== null ? quizScore : answers.filter(a => a.isCorrect).length;
    const totalCount = quizTotal !== null ? quizTotal : answers.length;
    const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const circumference = 2 * Math.PI * 60;
    const strokeDashoffset = Math.max(0, circumference - (percentage / 100) * circumference);

    let gradeColor = 'text-danger-400';
    let gradeStroke = 'stroke-danger-500';
    let gradeGlow = 'rgba(239,68,68,0.2)';
    let gradeMessage = 'Keep pushing! Review the material and try again.';
    
    if (percentage >= 80) {
      gradeColor = 'text-primary-400';
      gradeStroke = 'stroke-primary-500';
      gradeGlow = 'rgba(212,175,55,0.2)';
      gradeMessage = 'Outstanding performance! You have mastered this material.';
    } else if (percentage >= 60) {
      gradeColor = 'text-amber-400';
      gradeStroke = 'stroke-amber-500';
      gradeGlow = 'rgba(245,158,11,0.2)';
      gradeMessage = 'Good effort! Review the missed questions to sharpen your skills.';
    }

    return (
      <div className="animate-fade-in-up pb-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Score Header Card */}
          <div className="glass-card rounded-3xl bg-surface-900/70 border border-surface-700/50 p-10 text-center relative overflow-hidden shadow-2xl">
            {/* Background ambient glow based on score */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: gradeGlow }}></div>
            
            <h2 className="text-3xl font-extrabold text-white mb-10 relative z-10 tracking-tight">Quiz Completed</h2>
            
            <div className="relative flex items-center justify-center mb-10 mx-auto w-48 h-48 z-10">
              <svg className="w-full h-full -rotate-90 filter drop-shadow-xl" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" fill="none" stroke="currentColor" strokeWidth="6" className="text-surface-800" />
                <circle cx="70" cy="70" r="60" fill="none" strokeWidth="6" strokeLinecap="round"
                  className={`${gradeStroke} transition-all duration-[2000ms] ease-out`}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: animatedOffset,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className={`text-5xl font-extrabold font-mono tracking-tighter ${gradeColor}`}>
                  {percentage}%
                </p>
                <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mt-1">Accuracy</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-surface-800/80 border border-surface-700 flex items-center justify-center">
                 <Target size={20} className={gradeColor} />
              </div>
              <p className="text-2xl font-bold text-white">
                {correctCount} <span className="text-surface-500 text-lg">/ {totalCount} Correct</span>
              </p>
            </div>
            <p className="text-base text-surface-400 max-w-md mx-auto relative z-10 font-medium">{gradeMessage}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 relative z-10">
              {!activeTaskId && (
                <button
                  onClick={retryQuiz}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-surface-600 text-sm font-bold text-white hover:bg-surface-800 hover:border-surface-500 transition-all shadow-sm"
                >
                  <RotateCcw size={16} />
                  Retake Quiz
                </button>
              )}
              <button
                onClick={resetQuiz}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl gradient-primary text-surface-950 text-sm font-bold transition-all hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
              >
                <BrainCircuit size={16} />
                {activeTaskId ? 'Back to Hub' : 'Generate Another'}
              </button>
            </div>
          </div>

          {/* Answer Review Section */}
          <div className="glass-card rounded-3xl bg-surface-900/60 border border-surface-700/50 p-6 sm:p-10 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-8 h-8 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center">
                  <CheckCircle size={16} className="text-primary-400" />
               </div>
               <h3 className="text-xl font-bold text-white tracking-tight">Performance Review</h3>
            </div>
            
            <div className="space-y-4">
              {answers.map((a, i) => (
                <div
                  key={i}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                    a.isCorrect
                      ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40'
                      : 'border-danger-500/20 bg-danger-500/5 hover:border-danger-500/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      a.isCorrect 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-danger-500/20 text-danger-400 border-danger-500/30'
                    }`}>
                      {a.isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-white mb-4 leading-relaxed">
                        <span className="text-surface-500 font-mono mr-2">{i + 1}.</span>
                        {a.question}
                      </p>
                      
                      <div className="space-y-2">
                        {!a.isCorrect && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-900/80 border border-surface-800">
                             <div className="w-5 h-5 rounded flex items-center justify-center bg-danger-500/10 shrink-0 mt-0.5">
                               <XCircle size={12} className="text-danger-500" />
                             </div>
                             <div>
                               <p className="text-xs font-semibold text-surface-500 mb-0.5 uppercase tracking-wider">Your Answer</p>
                               <p className="text-sm font-medium text-danger-400">{a.selectedText || a.selected}</p>
                             </div>
                          </div>
                        )}
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-900/80 border border-surface-800">
                           <div className="w-5 h-5 rounded flex items-center justify-center bg-emerald-500/10 shrink-0 mt-0.5">
                             <CheckCircle size={12} className="text-emerald-500" />
                           </div>
                           <div>
                             <p className="text-xs font-semibold text-surface-500 mb-0.5 uppercase tracking-wider">Correct Answer</p>
                             <p className="text-sm font-medium text-emerald-400">{a.correctText || a.correct}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

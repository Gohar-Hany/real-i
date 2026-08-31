import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ChatInterface from '@/components/features/chat/ChatInterface';
import Select from '@/components/common/Select';
import { useAuth } from '@/contexts/AuthContext';
import { chatWithAgent, clearSession, getCourses, getUser, getActiveGuidelines } from '@/services/api';
import { useToast } from '@/components/common/Toast';
import { Sparkles, BookOpen, ChevronDown, ArrowRight } from 'lucide-react';

export default function StudentChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [projectId, setProjectId] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const fetchGuidance = async (projId) => {
    if (!projId) return;
    try {
      const guidelines = await getActiveGuidelines(projId);
      if (guidelines && guidelines.length > 0) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let welcomeText = "Welcome! Today, our focus is on the following topics:\n\n";
        
        let hasQuiz = false;
        guidelines.forEach(g => {
          const cleanDesc = g.description.replace(/Create a quiz|Generate a quiz|Focus on/gi, '').trim();
          if (g.task_type?.toLowerCase() === 'quiz') {
            welcomeText += `• Assigned Quiz: ${cleanDesc}\n\n`;
            hasQuiz = true;
          } else {
            welcomeText += `• Focus Topic: ${cleanDesc}\n\n`;
          }
        });
        
        welcomeText += "How can I help you today?";
        
        const welcomeMessage = {
          role: 'assistant',
          content: welcomeText,
          timestamp
        };
        
        if (hasQuiz) {
           welcomeMessage.action = {
             label: 'Take Quiz',
             onClick: () => navigate('/student/quiz')
          };
        }
        
        setMessages([welcomeMessage]);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to load active guidelines:', err);
      setMessages([]);
    }
  };

  useEffect(() => {
    const loadCourses = async () => {
      try {
        let userEnrolled = user?.enrolled_courses || [];
        try {
          const fresh = await getUser(user?.id);
          if (fresh?.enrolled_courses) userEnrolled = fresh.enrolled_courses;
        } catch {}

        const allCourses = await getCourses();
        const enrolled = (Array.isArray(allCourses) ? allCourses : []).filter(c => 
          userEnrolled.includes(c.id) ||
          userEnrolled.includes(c._id) ||
          userEnrolled.includes(c.project_id) ||
          (c.enrolled_students && c.enrolled_students.includes(user?.id))
        );

        setEnrolledCourses(enrolled);
        if (enrolled.length > 0) {
          const selectedId = enrolled[0].project_id || enrolled[0].id;
          setProjectId(selectedId);
          fetchGuidance(selectedId);
        }
      } catch (err) {
        console.error('Failed to load courses for chat:', err);
      }
    };
    if (user) loadCourses();
  }, [user]);

  const handleSend = async (message) => {
    if (!projectId) {
      toast.error('Please select an enrolled course first');
      return;
    }
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', content: message, timestamp }]);
    setLoading(true);

    try {
      const result = await chatWithAgent(projectId, message, sessionId);
      setSessionId(result.session_id);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an issue: ${err.message}\n\nPlease try again shortly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      toast.error(err.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async (targetProjId) => {
    if (sessionId) {
      try {
        await clearSession(sessionId);
      } catch {}
    }
    setSessionId(null);
    toast.info('Chat cleared');
    fetchGuidance(targetProjId || projectId);
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10 h-full flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md">
            <Sparkles size={14} className="text-primary-400" />
            <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
              AI Study Assistant
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-50 tracking-tight mb-2">
            Chat with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200 font-heading">REAL_i</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-surface-400 text-sm">
            <p>Ask anything about your enrolled course materials, concepts, or labs.</p>
            {sessionId && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-800/80 border border-surface-700">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-surface-300">Session: {sessionId.slice(0, 8)}...</span>
              </div>
            )}
          </div>
        </div>

        {enrolledCourses.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-surface-800/80 flex items-center justify-center border border-surface-700">
              <BookOpen size={14} className="text-surface-400" />
            </div>
            <div className="relative z-10 w-full sm:w-72">
              <Select
                value={projectId}
                onChange={(val) => {
                  setProjectId(val);
                  handleClear(val);
                }}
                options={enrolledCourses.map(c => ({ 
                  value: c.project_id || c.id, 
                  label: c.title || c.project_id 
                }))}
                placeholder="Select Course"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chat Container */}
      {enrolledCourses.length === 0 ? (
        <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-surface-900 border border-surface-700/50 shadow-sm relative overflow-hidden">
          <div className="w-20 h-20 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center mb-4 text-primary-400">
            <BookOpen size={36} />
          </div>
          <h3 className="text-xl font-bold text-surface-100 font-heading mb-2">No Enrolled Courses Found</h3>
          <p className="text-surface-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Your AI study assistant activates automatically for courses you are enrolled in. Browse available courses to start asking questions.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-surface-950 shadow-md hover:shadow-lg transition-all"
          >
            Explore Courses Catalog
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="flex-1 min-h-[500px] h-[calc(100vh-200px)] relative rounded-3xl bg-surface-900/40 border border-surface-700/50 shadow-2xl overflow-hidden glass-card flex flex-col">
          {/* Glow Effects */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 flex-1 flex flex-col h-full">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSend}
              loading={loading}
              onClear={handleClear}
              botName="REAL_i"
              botSubtitle="Study Assistant • Online"
              placeholder="Type your question here..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

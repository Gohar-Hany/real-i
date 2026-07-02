import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '@/components/features/chat/ChatInterface';
import { chatWithAgent, clearSession, getProjects, getActiveGuidelines } from '@/services/api';
import { useToast } from '@/components/common/Toast';
import { Sparkles, BookOpen, ChevronDown } from 'lucide-react';
export default function StudentChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('testproject1');
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
          // Clean up the description just in case it contains internal system prompt artifacts
          const cleanDesc = g.description.replace(/Create a quiz|Generate a quiz|Focus on/gi, '').trim();
          
          if (g.task_type.toLowerCase() === 'quiz') {
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
    const loadProjects = async () => {
      try {
        const list = await getProjects();
        setProjects(list);
        if (list.length > 0) {
          const selectedId = list[0].project_id;
          setProjectId(selectedId);
          fetchGuidance(selectedId);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    loadProjects();
  }, []);

  const handleSend = async (message) => {
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
        content: `Sorry, I encountered an error: ${err.message}\n\nPlease make sure the backend server is running.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      toast.error('Failed to get response');
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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Chat with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200 font-heading">REAL.i</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-surface-400 text-sm">
            <p>Ask anything about your course materials or quizzes.</p>
            {sessionId && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-800/80 border border-surface-700">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-surface-300">Session: {sessionId.slice(0, 8)}...</span>
              </div>
            )}
          </div>
        </div>

        {projects.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-surface-800/80 flex items-center justify-center border border-surface-700">
              <BookOpen size={14} className="text-surface-400" />
            </div>
            <div className="relative group">
              <select
                value={projectId}
                onChange={(e) => {
                  const newProjId = e.target.value;
                  setProjectId(newProjId);
                  handleClear(newProjId);
                }}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-surface-900 border border-surface-700 text-sm text-white font-medium outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 hover:border-surface-600 transition-all cursor-pointer min-w-[160px]"
              >
                {projects.map(p => (
                  <option key={p.project_id} value={p.project_id}>{p.project_id}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500 group-hover:text-primary-400 transition-colors">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Container */}
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
            botName="REAL.i"
            botSubtitle="Study Assistant • Online"
            placeholder="Type your question here..."
          />
        </div>
      </div>
    </div>
  );
}

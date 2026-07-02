import { useState } from 'react';
import ChatInterface from '@/components/features/chat/ChatInterface';
import { createTask } from '@/services/api';
import { useToast } from '@/components/common/Toast';

export default function AdminChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionTasks, setSessionTasks] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const toast = useToast();

  const handleSend = async (message) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', content: message, timestamp }]);
    setLoading(true);

    try {
      const result = await createTask(message, sessionId);
      if (result.session_id) {
        setSessionId(result.session_id);
      }
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      if (result.status === 'created') {
        setSessionTasks(prev => [...prev, result]);
        toast.success(`Task ${result.task_id} created successfully`);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}\n\nPlease make sure the backend server is running.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      toast.error('Failed to process message');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setSessionTasks([]);
    setSessionId(null);
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10 h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow"></div>
            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Agent Terminal Active
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary-500">Center</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Direct interface with the AI Admin Agent. Issue natural language commands to generate content, analyze data, and manage the platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Chat Area */}
        <div className="xl:col-span-3 glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 overflow-hidden relative flex flex-col h-[calc(100vh-250px)]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="flex-1 relative z-10 p-2 overflow-hidden">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSend}
              loading={loading}
              onClear={handleClear}
              botName="System Agent"
              botSubtitle="Awaiting Instructions"
              placeholder="e.g., Generate a comprehensive quiz on Neural Networks with 20 MCQs..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-2">
          {/* Task History */}
          <div className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 p-6 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none"></div>
            
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-5 relative z-10">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block"></span>
              Execution Logs
            </h3>
            
            {sessionTasks.length === 0 ? (
              <div className="py-8 text-center bg-surface-800/30 rounded-2xl border border-dashed border-surface-700">
                <p className="text-sm font-bold text-surface-400">System Idle</p>
                <p className="text-[10px] text-surface-500 uppercase tracking-widest mt-1">No active tasks</p>
              </div>
            ) : (
              <div className="space-y-3 relative z-10">
                {sessionTasks.map((task, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-surface-800/40 border border-surface-700/50 animate-slide-up hover:bg-surface-800/60 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-emerald-400 font-mono tracking-wider">
                        {task.task_id}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
                        {task.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-surface-500 font-mono">Process deployed successfully.</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Example Commands */}
          <div className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 p-6 relative overflow-hidden flex-1">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[50px] pointer-events-none"></div>
            
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-5 relative z-10">
              <span className="w-1.5 h-6 bg-primary-500 rounded-full inline-block"></span>
              Quick Directives
            </h3>
            
            <div className="space-y-3 relative z-10">
              {[
                'Create a quiz about Neural Networks with 10 MCQs',
                'Focus today with students on Module 5',
                'Generate a study guide for Chapter 3',
                'Create an assignment on Data Structures',
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(cmd)}
                  disabled={loading}
                  className="w-full text-left p-3.5 rounded-2xl bg-surface-800/40 border border-surface-700/50 text-surface-300 hover:bg-primary-500/10 hover:border-primary-500/30 hover:text-primary-300 transition-all disabled:opacity-50 group flex items-start gap-3"
                >
                  <span className="text-primary-500 font-mono font-bold mt-0.5 group-hover:text-primary-400 transition-colors">{'>'}</span>
                  <span className="text-xs font-medium leading-relaxed">{cmd}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

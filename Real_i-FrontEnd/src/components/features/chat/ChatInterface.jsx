import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Trash2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const preprocessMarkdown = (content) => {
  if (!content) return '';
  // Replace \[ ... \] with $$ ... $$
  let processed = content.replace(/\\\[([\\s\\S]*?)\\\]/g, (_, equation) => `$$\n${equation}\n$$`);
  // Replace \( ... \) with $ ... $
  processed = processed.replace(/\\\(([\\s\\S]*?)\\\)/g, (_, equation) => `$${equation}$`);
  return processed;
};

export default function ChatInterface({
  onSendMessage,
  messages = [],
  loading = false,
  placeholder = 'Type your message...',
  botName = 'Real_i',
  botSubtitle = 'AI Assistant',
  showClearButton = true,
  onClear,
  className = '',
}) {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0 || loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800/50 bg-surface-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Bot size={20} className="text-surface-950" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg tracking-tight">{botName}</h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-surface-400 uppercase tracking-wider">{botSubtitle}</span>
            </div>
          </div>
        </div>
        {showClearButton && onClear && (
          <button
            onClick={onClear}
            className="p-2 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-500/10 transition-all"
            aria-label="Clear chat"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl group-hover:bg-primary-500/30 transition-all duration-700"></div>
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700 flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.15)] relative z-10 transform group-hover:scale-105 transition-transform duration-500">
                <Bot size={48} className="text-primary-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-white mb-3 tracking-tight">
              Start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Conversation</span>
            </h3>
            <p className="text-surface-400 text-sm sm:text-base max-w-md leading-relaxed font-medium">
              I'm your AI Study Assistant. Ask me anything about your courses, request a quiz, or explore complex topics.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
                  : 'gradient-primary text-surface-950 shadow-sm'
              }`}
            >
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[75%] group relative shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-surface-950 rounded-2xl rounded-tr-md px-5 py-3.5 border border-primary-400/20'
                  : 'bg-surface-800/80 backdrop-blur-sm text-surface-100 rounded-2xl rounded-tl-md px-5 py-3.5 border border-surface-700/50'
              }`}
            >
              <div className="text-sm leading-relaxed markdown-content">
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                      a: ({ node, ...props }) => <a className="text-primary-400 hover:underline" {...props} />,
                      code: ({ node, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <pre className="bg-surface-200 dark:bg-surface-700 p-3 rounded-lg overflow-x-auto my-2">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className="bg-surface-200 dark:bg-surface-700 px-1 py-0.5 rounded text-xs" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {preprocessMarkdown(msg.content)}
                  </ReactMarkdown>
                )}
              </div>
              {msg.action && (
                <button
                  onClick={msg.action.onClick}
                  className="mt-3 px-4 py-2 w-full md:w-auto gradient-primary text-surface-950 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
                >
                  {msg.action.label}
                </button>
              )}
              <div className={`flex items-center gap-2 mt-2 ${msg.role === 'user' ? 'justify-end' : 'justify-between'}`}>
                <span className={`text-[10px] ${msg.role === 'user' ? 'text-surface-950/50' : 'text-surface-400'}`}>
                  {msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.role !== 'user' && (
                  <button
                    onClick={() => copyToClipboard(msg.content, i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700"
                    aria-label="Copy message"
                  >
                    {copiedId === i ? (
                      <Check size={12} className="text-primary-500" />
                    ) : (
                      <Copy size={12} className="text-surface-400" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex gap-3 animate-fade-in-up">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-surface-950 shadow-sm shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-surface-800/80 backdrop-blur-sm border border-surface-700/50 rounded-2xl rounded-tl-md px-5 py-4">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-500 typing-dot" />
                <span className="w-2 h-2 rounded-full bg-primary-500 typing-dot" />
                <span className="w-2 h-2 rounded-full bg-primary-500 typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-surface-800/50 bg-surface-900/60 backdrop-blur-md"
      >
        <div className="flex items-center gap-3 bg-surface-900 border border-surface-700 rounded-2xl px-4 py-2 focus-within:border-primary-500/50 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all shadow-inner">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1 bg-transparent py-2 outline-none text-sm text-white placeholder:text-surface-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl gradient-primary text-surface-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-glow active:scale-95"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

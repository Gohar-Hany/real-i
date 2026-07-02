import { BookOpen, BrainCircuit, TrendingUp, Activity, Award, Clock, ArrowUpRight, ArrowDownRight, Users, BarChart3 } from 'lucide-react';

const WEEKLY_DATA = [40, 55, 38, 72, 60, 85, 78];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const maxVal = Math.max(...WEEKLY_DATA);

export default function AdminAnalytics() {
  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md shadow-sm">
            <BarChart3 size={14} className="text-primary-400" />
            <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
              Data Intelligence
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Analytics</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Monitor platform performance, analyze student engagement metrics, and track overall system health in real-time.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {[
          { label: 'Active Students', value: '1,247', change: '+12%', up: true, icon: Users, color: '#3B82F6' },
          { label: 'Course Completions', value: '342', change: '+8%', up: true, icon: BookOpen, color: '#10B981' },
          { label: 'Quizzes Taken', value: '1,893', change: '+23%', up: true, icon: BrainCircuit, color: '#8B5CF6' },
          { label: 'Avg. Score', value: '82%', change: '-2%', up: false, icon: Award, color: '#F59E0B' },
        ].map((kpi, i) => (
          <div 
            key={i} 
            className="relative glass-card rounded-3xl p-6 bg-surface-900/60 border border-surface-700/50 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            style={{ boxShadow: `0 4px 30px ${kpi.color}08` }}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${kpi.color} 0%, transparent 70%)` }}
            ></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border"
                  style={{ background: `linear-gradient(135deg, ${kpi.color}20, ${kpi.color}05)`, borderColor: `${kpi.color}40` }}
                >
                  <kpi.icon size={22} style={{ color: kpi.color }} className="drop-shadow-[0_0_8px_currentColor]" />
                </div>
                <div className={`px-2.5 py-1 rounded-lg flex items-center gap-1 border shadow-inner ${kpi.up ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                  {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  <span className="text-xs font-bold">{kpi.change}</span>
                </div>
              </div>
              <p className="text-3xl font-extrabold text-white tracking-tight mb-1">{kpi.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-surface-400">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-surface-700/50 shadow-2xl bg-surface-900/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20 shadow-inner">
                <Activity size={20} className="text-primary-400" />
              </div>
              Activity Heatmap
            </h3>
            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest px-3 py-1.5 rounded-lg bg-surface-800/50 border border-surface-700">Last 7 Days</span>
          </div>
          
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-56 relative z-10 mt-6">
            {WEEKLY_DATA.map((val, i) => {
              const heightPct = (val / maxVal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full">
                  <div className="w-full relative h-full flex items-end">
                    <div
                      className="w-full rounded-t-xl transition-all duration-500 relative cursor-pointer"
                      style={{ 
                        height: `${heightPct}%`,
                        background: 'linear-gradient(to top, rgba(212,175,55,0.2), rgba(212,175,55,0.8))',
                        boxShadow: '0 0 15px rgba(212,175,55,0.2)',
                      }}
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-600 text-xs font-bold text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-y-1 pointer-events-none whitespace-nowrap z-20">
                        {val} <span className="text-primary-400">active</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-surface-400 font-bold uppercase tracking-wider group-hover:text-primary-400 transition-colors">{DAYS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Courses */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-surface-700/50 shadow-2xl bg-surface-900/60 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>

          <h3 className="text-xl font-extrabold text-white flex items-center gap-3 mb-8 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <TrendingUp size={20} className="text-emerald-400" />
            </div>
            Top Performing Modules
          </h3>
          <div className="space-y-5 relative z-10">
            {[
              { name: 'AI Fundamentals', students: 1247, completion: 87, score: 85 },
              { name: 'Data Science Bootcamp', students: 1893, completion: 72, score: 78 },
              { name: 'Deep Learning Mastery', students: 834, completion: 65, score: 92 },
              { name: 'NLP Course', students: 623, completion: 58, score: 80 },
              { name: 'RAG Systems', students: 312, completion: 90, score: 88 },
            ].map((course, i) => (
              <div key={i} className="flex items-center gap-4 bg-surface-800/30 p-3.5 rounded-2xl border border-surface-700/50 hover:bg-surface-800/60 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-surface-950 flex items-center justify-center text-primary-400 text-sm font-black shrink-0 border border-surface-700 shadow-inner group-hover:border-primary-500/30 group-hover:text-primary-300 transition-colors">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-white truncate">{course.name}</p>
                    <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider shrink-0 ml-2 bg-surface-950 px-2 py-1 rounded-md border border-surface-800">{course.students} Enrolled</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 bg-surface-950 rounded-full overflow-hidden border border-surface-800">
                      <div className="h-full bg-emerald-500 rounded-full relative" style={{ width: `${course.completion}%`, boxShadow: '0 0 10px rgba(16,185,129,0.5)' }}>
                        <div className="absolute top-0 right-0 w-4 h-full bg-white/30 rounded-full"></div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-400 shrink-0 w-8 text-right">{course.completion}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-surface-700/50 shadow-2xl bg-surface-900/60 relative overflow-hidden lg:col-span-2">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-64 bg-violet-500/5 rounded-full blur-[120px] pointer-events-none"></div>

          <h3 className="text-xl font-extrabold text-white flex items-center gap-3 mb-8 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 shadow-inner">
              <Clock size={20} className="text-violet-400" />
            </div>
            Real-Time Activity Feed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {[
              { user: 'Ahmed M.', action: 'Completed assessment', detail: 'AI Fundamentals — Neural Networks', time: '2 min ago', color: 'emerald' },
              { user: 'Sara K.', action: 'Initiated module', detail: 'Deep Learning Mastery', time: '15 min ago', color: 'blue' },
              { user: 'Omar H.', action: 'Achieved 95%', detail: 'NLP Quiz — Transformers', time: '32 min ago', color: 'amber' },
              { user: 'Nour A.', action: 'Registered', detail: 'RAG Systems & Vector Databases', time: '1 hour ago', color: 'violet' },
              { user: 'Youssef R.', action: 'Graduated', detail: 'Data Science Bootcamp', time: '2 hours ago', color: 'emerald' },
              { user: 'Lina S.', action: 'Failed assessment', detail: 'Python for AI - Basics', time: '3 hours ago', color: 'rose' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-800/40 border border-surface-700/50 hover:bg-surface-800/80 hover:border-surface-600 transition-all group">
                <div className="relative">
                  <div className={`absolute -inset-1 rounded-full bg-${activity.color}-500/20 blur-sm group-hover:bg-${activity.color}-500/40 transition-colors`}></div>
                  <div className="relative w-12 h-12 rounded-xl bg-surface-950 flex items-center justify-center text-white text-lg font-black border border-surface-700 shadow-inner">
                    {activity.user.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-${activity.color}-500 border-2 border-surface-900 animate-pulse-slow`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-300 mb-0.5">
                    <span className="font-bold text-white mr-1.5">{activity.user}</span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider text-${activity.color}-400`}>{activity.action}</span>
                  </p>
                  <p className="text-xs text-surface-500 truncate font-medium">{activity.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider bg-surface-950 px-2 py-1 rounded-md border border-surface-800 inline-block mt-1">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

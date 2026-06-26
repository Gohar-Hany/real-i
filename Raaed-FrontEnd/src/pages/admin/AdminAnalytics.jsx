import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Users, BookOpen, BrainCircuit, TrendingUp, BarChart3,
  Activity, Award, Clock, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

const WEEKLY_DATA = [40, 55, 38, 72, 60, 85, 78];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const maxVal = Math.max(...WEEKLY_DATA);

export default function AdminAnalytics() {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.analytics-card', {
        opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2,
      });
      gsap.from('.bar-fill', {
        scaleY: 0, duration: 0.8, stagger: 0.08, ease: 'back.out(1.7)', delay: 0.5,
        transformOrigin: 'bottom',
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-surface-100">Analytics</h1>
        <p className="text-surface-400 mt-1">Monitor platform performance and student engagement</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Students', value: '1,247', change: '+12%', up: true, icon: Users, color: 'text-primary-400' },
          { label: 'Course Completions', value: '342', change: '+8%', up: true, icon: BookOpen, color: 'text-emerald-400' },
          { label: 'Quizzes Taken', value: '1,893', change: '+23%', up: true, icon: BrainCircuit, color: 'text-blue-400' },
          { label: 'Avg. Score', value: '82%', change: '-2%', up: false, icon: Award, color: 'text-amber-400' },
        ].map((kpi, i) => (
          <div key={i} className="analytics-card glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-surface-800/50 flex items-center justify-center">
                <kpi.icon size={20} className={kpi.color} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${kpi.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-surface-100 mb-0.5">{kpi.value}</p>
            <p className="text-xs text-surface-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <div className="analytics-card glass-card rounded-2xl p-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-surface-100 flex items-center gap-2">
              <Activity size={20} className="text-primary-400" />
              Weekly Activity
            </h3>
            <span className="text-xs text-surface-500">Last 7 days</span>
          </div>
          <div ref={chartRef} className="flex items-end justify-between gap-3 h-48">
            {WEEKLY_DATA.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative h-full flex items-end">
                  <div
                    className="bar-fill w-full rounded-t-lg gradient-primary opacity-80 hover:opacity-100 transition-opacity cursor-pointer relative group"
                    style={{ height: `${(val / maxVal) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-surface-800 text-xs font-semibold text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {val} active
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-surface-500 font-medium">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Courses */}
        <div className="analytics-card glass-card rounded-2xl p-7">
          <h3 className="text-lg font-bold text-surface-100 flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-primary-400" />
            Top Performing Courses
          </h3>
          <div className="space-y-4">
            {[
              { name: 'AI Fundamentals', students: 1247, completion: 87, score: 85 },
              { name: 'Data Science Bootcamp', students: 1893, completion: 72, score: 78 },
              { name: 'Deep Learning Mastery', students: 834, completion: 65, score: 92 },
              { name: 'NLP Course', students: 623, completion: 58, score: 80 },
              { name: 'RAG Systems', students: 312, completion: 90, score: 88 },
            ].map((course, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center text-surface-950 text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-surface-200 truncate">{course.name}</p>
                    <span className="text-xs text-surface-400 shrink-0 ml-2">{course.students} students</span>
                  </div>
                  <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full" style={{ width: `${course.completion}%` }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-primary-400 shrink-0">{course.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="analytics-card glass-card rounded-2xl p-7 lg:col-span-2">
          <h3 className="text-lg font-bold text-surface-100 flex items-center gap-2 mb-6">
            <Clock size={20} className="text-primary-400" />
            Recent Student Activity
          </h3>
          <div className="space-y-3">
            {[
              { user: 'Ahmed M.', action: 'Completed quiz', detail: 'AI Fundamentals — Neural Networks', time: '2 min ago', color: 'bg-emerald-500' },
              { user: 'Sara K.', action: 'Started course', detail: 'Deep Learning Mastery', time: '15 min ago', color: 'bg-blue-500' },
              { user: 'Omar H.', action: 'Scored 95%', detail: 'NLP Quiz — Transformers', time: '32 min ago', color: 'bg-primary-500' },
              { user: 'Nour A.', action: 'Enrolled', detail: 'RAG Systems & Vector Databases', time: '1 hour ago', color: 'bg-purple-500' },
              { user: 'Youssef R.', action: 'Completed course', detail: 'Data Science Bootcamp', time: '2 hours ago', color: 'bg-amber-500' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-800/30 transition-colors">
                <div className={`w-2 h-2 rounded-full ${activity.color} shrink-0`} />
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-surface-950 text-xs font-bold shrink-0">
                  {activity.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-200">
                    <span className="font-semibold">{activity.user}</span>
                    {' '}{activity.action}
                  </p>
                  <p className="text-xs text-surface-500 truncate">{activity.detail}</p>
                </div>
                <span className="text-xs text-surface-500 shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

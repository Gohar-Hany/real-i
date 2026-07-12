import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, getProjects, getGuidelines, getUserResults } from '@/services/api';
import {
  BookOpen, BrainCircuit, TrendingUp, Activity, Award, Clock,
  ArrowUpRight, ArrowDownRight, Users, BarChart3, GraduationCap,
  Target, AlertTriangle, CheckCircle, Eye, ChevronRight
} from 'lucide-react';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ totalStudents: 0, totalProjects: 0, totalQuizzesTaken: 0, avgScore: 0 });
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [projectBreakdown, setProjectBreakdown] = useState([]);
  const [scoreDistribution, setScoreDistribution] = useState({ excellent: 0, good: 0, average: 0, poor: 0 });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [users, projects, guidelines] = await Promise.all([
        getUsers().catch(() => []),
        getProjects().catch(() => []),
        getGuidelines().catch(() => []),
      ]);

      const students = users.filter(u => u.role === 'student');

      // Fetch quiz results for each student
      const performanceData = [];
      let totalQuizzes = 0;
      let totalScoreSum = 0;
      let totalQuizCount = 0;
      let excellent = 0, good = 0, average = 0, poor = 0;

      for (const student of students) {
        try {
          const data = await getUserResults(student.id);
          const results = Array.isArray(data?.results) ? data.results : [];
          const quizCount = results.length;
          totalQuizzes += quizCount;

          if (quizCount > 0) {
            const avg = Math.round(results.reduce((acc, r) => acc + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) / quizCount);
            totalScoreSum += avg;
            totalQuizCount++;

            // Score distribution
            if (avg >= 90) excellent++;
            else if (avg >= 75) good++;
            else if (avg >= 60) average++;
            else poor++;

            performanceData.push({
              id: student.id,
              name: student.name,
              email: student.email,
              quizzes: quizCount,
              avgScore: avg,
              bestScore: Math.max(...results.map(r => r.total > 0 ? Math.round((r.score / r.total) * 100) : 0)),
              passRate: Math.round(results.filter(r => r.total > 0 && (r.score / r.total) * 100 >= 60).length / quizCount * 100),
            });
          } else {
            performanceData.push({
              id: student.id,
              name: student.name,
              email: student.email,
              quizzes: 0,
              avgScore: 0,
              bestScore: 0,
              passRate: 0,
            });
          }
        } catch (e) {
          performanceData.push({
            id: student.id,
            name: student.name,
            email: student.email,
            quizzes: 0,
            avgScore: 0,
            bestScore: 0,
            passRate: 0,
          });
        }
      }

      const overallAvg = totalQuizCount > 0 ? Math.round(totalScoreSum / totalQuizCount) : 0;

      setKpis({
        totalStudents: students.length,
        totalProjects: projects.length,
        totalQuizzesTaken: totalQuizzes,
        avgScore: overallAvg,
      });

      setStudentPerformance(performanceData.sort((a, b) => b.avgScore - a.avgScore));
      setScoreDistribution({ excellent, good, average, poor });
      setProjectBreakdown(projects.map(p => ({ id: p.project_id, name: p.project_id })));
    } catch (err) {
      console.error('Analytics load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const distTotal = scoreDistribution.excellent + scoreDistribution.good + scoreDistribution.average + scoreDistribution.poor;

  // At-risk students: avg < 60 and has at least 1 quiz
  const atRiskStudents = studentPerformance.filter(s => s.quizzes > 0 && s.avgScore < 60);
  // Top performers: avg >= 85
  const topPerformers = studentPerformance.filter(s => s.quizzes > 0 && s.avgScore >= 85);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
        <div className="w-14 h-14 relative mb-4">
          <div className="absolute inset-0 rounded-full border-t-2 border-primary-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-blue-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
        </div>
        <p className="text-surface-400 font-mono text-xs uppercase tracking-widest">Crunching analytics data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md">
          <BarChart3 size={14} className="text-primary-400" />
          <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
            Data Intelligence
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Analytics</span>
        </h1>
        <p className="text-surface-400 text-sm max-w-2xl leading-relaxed">
          Real-time performance metrics aggregated from all students, courses, and quiz results.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: GraduationCap, label: 'Total Students', value: kpis.totalStudents, color: '#3B82F6' },
          { icon: BookOpen, label: 'Active Projects', value: kpis.totalProjects, color: '#10B981' },
          { icon: BrainCircuit, label: 'Quizzes Taken', value: kpis.totalQuizzesTaken, color: '#8B5CF6' },
          { icon: Award, label: 'Avg. Score', value: `${kpis.avgScore}%`, color: '#F59E0B' },
        ].map((kpi, i) => (
          <div
            key={i}
            className="relative glass-card rounded-2xl p-5 bg-surface-900/60 border border-surface-700/50 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            style={{ boxShadow: `0 4px 30px ${kpi.color}08` }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${kpi.color} 0%, transparent 70%)` }}
            ></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg border"
                  style={{ background: `linear-gradient(135deg, ${kpi.color}20, ${kpi.color}05)`, borderColor: `${kpi.color}40` }}
                >
                  <kpi.icon size={20} style={{ color: kpi.color }} />
                </div>
                <span className="text-2xl font-extrabold text-white">{kpi.value}</span>
              </div>
              <p className="text-xs font-bold text-surface-300 uppercase tracking-wider">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Distribution */}
        <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
          <div className="p-6 border-b border-surface-800 bg-surface-900/80">
            <h3 className="text-base font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                <Target size={16} className="text-primary-400" />
              </div>
              Score Distribution
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Excellent (90%+)', count: scoreDistribution.excellent, color: '#10B981', bg: 'bg-emerald-500' },
              { label: 'Good (75-89%)', count: scoreDistribution.good, color: '#3B82F6', bg: 'bg-blue-500' },
              { label: 'Average (60-74%)', count: scoreDistribution.average, color: '#F59E0B', bg: 'bg-amber-500' },
              { label: 'Poor (<60%)', count: scoreDistribution.poor, color: '#EF4444', bg: 'bg-rose-500' },
            ].map((tier, i) => {
              const pct = distTotal > 0 ? Math.round((tier.count / distTotal) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-surface-300">{tier.label}</span>
                    <span className="text-xs font-bold" style={{ color: tier.color }}>
                      {tier.count} <span className="text-surface-600">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-800 rounded-full overflow-hidden border border-surface-700">
                    <div
                      className={`h-full rounded-full ${tier.bg}`}
                      style={{ width: `${pct}%`, transition: 'width 1s ease-out' }}
                    ></div>
                  </div>
                </div>
              );
            })}

            {distTotal === 0 && (
              <p className="text-xs text-surface-500 text-center py-4">No quiz data available yet</p>
            )}
          </div>
        </div>

        {/* At-Risk Students */}
        <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
          <div className="p-6 border-b border-surface-800 bg-surface-900/80 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <AlertTriangle size={16} className="text-rose-400" />
              </div>
              At-Risk Students
            </h3>
            <span className="text-[10px] font-black px-2 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
              {atRiskStudents.length} found
            </span>
          </div>
          <div className="p-3 space-y-1.5 max-h-[320px] overflow-y-auto custom-scrollbar">
            {atRiskStudents.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle size={28} className="text-emerald-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-surface-300">All Clear!</p>
                <p className="text-xs text-surface-500">No students below the 60% threshold</p>
              </div>
            ) : (
              atRiskStudents.map(s => (
                <Link
                  key={s.id}
                  to={`/admin/students/${s.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-800/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 text-xs font-extrabold shrink-0 border border-rose-500/20">
                    {s.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-surface-200 truncate">{s.name}</p>
                    <p className="text-[10px] text-surface-500">{s.quizzes} quizzes · {s.passRate}% pass rate</p>
                  </div>
                  <span className="text-sm font-black text-rose-400">{s.avgScore}%</span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
          <div className="p-6 border-b border-surface-800 bg-surface-900/80 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Award size={16} className="text-emerald-400" />
              </div>
              Top Performers
            </h3>
            <span className="text-[10px] font-black px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              {topPerformers.length} found
            </span>
          </div>
          <div className="p-3 space-y-1.5 max-h-[320px] overflow-y-auto custom-scrollbar">
            {topPerformers.length === 0 ? (
              <div className="py-8 text-center">
                <Award size={28} className="text-surface-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-surface-300">No data yet</p>
                <p className="text-xs text-surface-500">Needs quiz completions to rank</p>
              </div>
            ) : (
              topPerformers.map((s, i) => (
                <Link
                  key={s.id}
                  to={`/admin/students/${s.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-800/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-surface-950 text-xs font-extrabold shrink-0 shadow-sm">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-surface-200 truncate">{s.name}</p>
                    <p className="text-[10px] text-surface-500">{s.quizzes} quizzes · Best: {s.bestScore}%</p>
                  </div>
                  <span className="text-sm font-black text-emerald-400">{s.avgScore}%</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Full Student Leaderboard */}
      <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
        <div className="p-6 border-b border-surface-800 bg-surface-900/80 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
              <TrendingUp size={16} className="text-violet-400" />
            </div>
            Student Performance Leaderboard
          </h3>
          <Link to="/admin/students" className="text-[10px] text-primary-400 font-bold hover:text-primary-300 uppercase tracking-wider flex items-center gap-1">
            Manage Students <ChevronRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700/80 bg-surface-950/30">
                <th className="text-left px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest w-8">#</th>
                <th className="text-left px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest">Student</th>
                <th className="text-center px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest hidden sm:table-cell">Quizzes</th>
                <th className="text-center px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest">Avg Score</th>
                <th className="text-center px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest hidden md:table-cell">Best</th>
                <th className="text-center px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest hidden md:table-cell">Pass Rate</th>
                <th className="text-right px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {studentPerformance.map((s, i) => (
                <tr key={s.id} className="hover:bg-surface-800/30 transition-colors group">
                  <td className="px-6 py-4 text-xs font-bold text-surface-500">{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-surface-950 text-[10px] font-extrabold shrink-0">
                        {s.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-primary-300 transition-colors">{s.name}</p>
                        <p className="text-[10px] text-surface-500 font-mono">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center hidden sm:table-cell">
                    <span className="text-sm font-bold text-surface-300">{s.quizzes}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-black ${s.avgScore >= 85 ? 'text-emerald-400' : s.avgScore >= 60 ? 'text-primary-400' : s.quizzes > 0 ? 'text-rose-400' : 'text-surface-600'}`}>
                      {s.quizzes > 0 ? `${s.avgScore}%` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center hidden md:table-cell">
                    <span className="text-sm font-bold text-surface-300">{s.quizzes > 0 ? `${s.bestScore}%` : '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-center hidden md:table-cell">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      s.passRate >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      s.passRate >= 60 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      s.quizzes > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-surface-800 text-surface-500 border-surface-700'
                    }`}>
                      {s.quizzes > 0 ? `${s.passRate}%` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/students/${s.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      <Eye size={14} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projects Overview */}
      {projectBreakdown.length > 0 && (
        <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
          <div className="p-6 border-b border-surface-800 bg-surface-900/80">
            <h3 className="text-base font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <BookOpen size={16} className="text-emerald-400" />
              </div>
              Active Projects / Courses
            </h3>
          </div>
          <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projectBreakdown.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-surface-800/30 border border-surface-700/50 hover:bg-surface-800/60 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
                  <BookOpen size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{p.name}</p>
                  <p className="text-[10px] text-surface-500 uppercase tracking-wider">Active module</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

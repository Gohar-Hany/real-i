import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessments } from '@/contexts/AssessmentContext';
import CalendarWidget from '@/components/common/CalendarWidget';
import {
  CalendarDays, Clock, AlertTriangle, CheckCircle
} from 'lucide-react';

export default function StudentCalendar() {
  const { user } = useAuth();
  const { assessments, getStudentSubmission } = useAssessments();

  const calendarEvents = useMemo(() => {
    const events = [];
    const published = assessments.filter(a => a.status === 'published');

    published.forEach(a => {
      const sub = getStudentSubmission(a.id, user?.id);

      // Start date
      if (a.startDate) {
        events.push({
          id: `${a.id}-start`,
          title: `📗 ${a.title} — Opens`,
          date: new Date(a.startDate),
          type: a.type,
          description: `This ${a.type} becomes available for you to start.`,
          link: sub
            ? `/student/assessments/${a.id}/results`
            : (a.type === 'quiz' || a.type === 'exam')
              ? `/student/assessments/${a.id}/take`
              : `/student/assessments/${a.id}/submit`,
          linkLabel: sub ? 'View Results' : 'Open',
          meta: [
            a.timeLimit ? `${a.timeLimit} min` : null,
            a.questions?.length ? `${a.questions.length} questions` : null,
            sub ? '✓ Completed' : null,
          ].filter(Boolean),
        });
      }

      // Deadline
      if (a.endDate) {
        const isExpired = new Date(a.endDate) < new Date();
        events.push({
          id: `${a.id}-deadline`,
          title: `⏰ ${a.title} — ${sub ? 'Submitted' : isExpired ? 'Expired' : 'Due'}`,
          date: new Date(a.endDate),
          type: a.type,
          description: sub
            ? `You submitted this ${a.type}. ${sub.score != null ? `Score: ${sub.score}` : ''}`
            : isExpired
              ? `This ${a.type} deadline has passed.`
              : `Submit before this deadline.`,
          link: sub
            ? `/student/assessments/${a.id}/results`
            : !isExpired
              ? (a.type === 'quiz' || a.type === 'exam')
                ? `/student/assessments/${a.id}/take`
                : `/student/assessments/${a.id}/submit`
              : undefined,
          linkLabel: sub ? 'View Results' : 'Submit Now',
          meta: [
            `${a.passingGrade}% to pass`,
            sub?.score != null ? `Score: ${sub.score}` : null,
          ].filter(Boolean),
        });
      }
    });

    return events;
  }, [assessments, user?.id, getStudentSubmission]);

  // Stats
  const now = new Date();
  const upcomingDeadlines = calendarEvents.filter(e => {
    const d = e.date instanceof Date ? e.date : new Date(e.date);
    return d >= now && e.title.includes('Due');
  }).length;

  const completedCount = calendarEvents.filter(e => e.title.includes('Submitted')).length;

  const urgentCount = calendarEvents.filter(e => {
    const d = e.date instanceof Date ? e.date : new Date(e.date);
    const diff = d - now;
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000 && e.title.includes('Due');
  }).length;

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md">
          <CalendarDays size={14} className="text-primary-400" />
          <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
            My Calendar
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Calendar</span>
        </h1>
        <p className="text-surface-400 text-sm max-w-2xl leading-relaxed">
          Stay on track with your assignments, quizzes, exams, and task deadlines all in one view.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Clock, label: 'Upcoming Due', value: upcomingDeadlines, color: '#3B82F6' },
          { icon: AlertTriangle, label: 'Due in 3 Days', value: urgentCount, color: '#F59E0B' },
          { icon: CheckCircle, label: 'Completed', value: completedCount, color: '#10B981' },
        ].map((stat, i) => (
          <div key={i} className="relative glass-card rounded-2xl p-5 bg-surface-900/60 border border-surface-700/50 overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${stat.color} 0%, transparent 70%)` }}></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center border" style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`, borderColor: `${stat.color}40` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mt-0.5">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <CalendarWidget events={calendarEvents} />
    </div>
  );
}

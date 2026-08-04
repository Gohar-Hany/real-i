import { useState, useEffect, useMemo } from 'react';
import { useAssessments } from '@/contexts/AssessmentContext';
import { api, getEvents } from '@/services/api';
import CalendarWidget, { TYPE_CONFIG } from '@/components/common/CalendarWidget';
import { Clock, CalendarDays, Filter } from 'lucide-react';

export default function StudentCalendar() {
  const { assessments, fetchAssessments } = useAssessments();
  const [customEvents, setCustomEvents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  
  const [filters, setFilters] = useState({
    quiz: true, exam: true, assignment: true, task: true, custom: true, meeting: true
  });

  useEffect(() => { fetchAssessments(); }, [fetchAssessments]);

  const fetchCustomEvents = () => {
    getEvents()
      .then(data => {
        const custom = (Array.isArray(data) ? data : []).filter(e => !e.is_auto);
        setCustomEvents(custom);
      })
      .catch(() => setCustomEvents([]));
  };

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/meetings');
      if (response.success) {
        setMeetings(response.meetings || []);
      }
    } catch (err) {
      console.error('Failed to fetch meetings', err);
    }
  };

  useEffect(() => { 
    fetchCustomEvents(); 
    fetchMeetings();
  }, []);

  const calendarEvents = useMemo(() => {
    const events = [];

    // For students, we only care about published assessments
    const publishedAssessments = assessments.filter(a => a.status === 'published');

    publishedAssessments.forEach(a => {
      if (a.startDate || a.start_date) {
        events.push({
          id: `${a.id}-start`,
          title: `${a.title} — Opens`,
          date: new Date(a.startDate || a.start_date),
          type: a.type,
          description: `Assessment opens for students`,
          link: `/student/assessments/${a.id}/take`,
          linkLabel: 'Start Assessment',
          meta: [
            a.timeLimit ? `${a.timeLimit}m` : null,
            `${a.passingGrade || 60}% pass`,
          ].filter(Boolean),
        });
      }

      if (a.endDate || a.end_date) {
        events.push({
          id: `${a.id}-end`,
          title: `${a.title} — Deadline`,
          date: new Date(a.endDate || a.end_date),
          type: a.type,
          description: `Submission deadline for ${a.title}`,
          link: `/student/assessments/${a.id}/submit`,
          linkLabel: 'Submit Assessment',
          meta: [
            a.type,
          ].filter(Boolean),
        });
      }
    });

    customEvents.forEach(ev => {
      events.push({
        id: ev.id,
        title: ev.title,
        date: new Date(ev.date),
        type: 'custom',
        description: ev.description,
      });
    });

    meetings.forEach(m => {
      if (m.scheduledFor) {
        events.push({
          id: m._id,
          title: m.title,
          date: new Date(m.scheduledFor),
          type: 'meeting',
          description: `Duration: ${m.expectedDurationMinutes} mins. Room: ${m.roomName}`,
          link: `/student/live?roomName=${encodeURIComponent(m.roomName)}`,
          linkLabel: m.status === 'live' ? 'Join Live Now' : 'Join Session',
          meta: [
            m.status === 'live' ? 'LIVE' : m.status,
            `${m.expectedDurationMinutes}m`,
          ],
        });
      }
    });

    return events;
  }, [assessments, customEvents, meetings]);

  const toggleFilter = (type) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const upcomingEvents = [...customEvents]
    .filter(e => new Date(e.date) >= new Date())
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in pb-10 min-h-[85vh]">
      
      {/* ── Left Sidebar ── */}
      <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
        <div className="glass-card rounded-3xl p-6 border border-surface-700/50 bg-surface-900/60">
          <div className="mb-8">
            <h3 className="text-xs font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Filter size={14} /> Filter Calendar
            </h3>
            <div className="space-y-3">
              {['quiz', 'exam', 'assignment', 'task', 'custom', 'meeting'].map(type => {
                const conf = TYPE_CONFIG[type];
                if(!conf) return null;
                const Icon = conf.icon;
                return (
                  <label key={type} className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-800/50 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${conf.bg} ${conf.border} ${conf.text}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-sm font-semibold text-surface-200 group-hover:text-surface-50 transition-colors">{conf.label}s</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={filters[type]} 
                      onChange={() => toggleFilter(type)}
                      className="w-4 h-4 accent-primary-500 rounded bg-surface-800 border-surface-600 focus:ring-0" 
                    />
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Clock size={14} /> Upcoming Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-surface-500 text-center py-4">No upcoming events</p>
              ) : upcomingEvents.map(ev => (
                <div key={ev.id} className="p-3 rounded-xl bg-surface-800/30 border border-surface-700/50">
                  <p className="text-sm font-bold text-surface-50 mb-1">{ev.title}</p>
                  <p className="text-xs text-surface-400 flex items-center gap-1">
                    <CalendarDays size={12} />
                    {new Date(ev.date).toLocaleDateString()} at {ev.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Calendar Grid ── */}
      <div className="flex-1 min-w-0">
        <CalendarWidget 
          events={calendarEvents} 
          filters={filters}
          // Note: onAddEvent is NOT passed, making it read-only for students
        />
      </div>
    </div>
  );
}

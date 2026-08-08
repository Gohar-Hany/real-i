import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAssessments } from '@/contexts/AssessmentContext';
import { api, getEvents, createEvent, deleteEvent } from '@/services/api';
import CalendarWidget, { TYPE_CONFIG } from '@/components/common/CalendarWidget';
import {
  CalendarDays, Plus, X, Save, Clock, Bell, Trash2, Filter
} from 'lucide-react';
import { useToast } from '@/components/common/Toast';

export default function AdminCalendar() {
  const { assessments, fetchAssessments } = useAssessments();
  const toast = useToast();
  const [customEvents, setCustomEvents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  
  // Custom Event Modal
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', time: '09:00', type: 'custom' });
  
  // Filters state
  const [filters, setFilters] = useState({
    quiz: true, exam: true, assignment: true, task: true, custom: true
  });

  useEffect(() => { fetchAssessments(); }, [fetchAssessments]);

  const fetchCustomEvents = useCallback(() => {
    getEvents()
      .then(data => {
        const custom = (Array.isArray(data) ? data : []).filter(e => !e.is_auto);
        setCustomEvents(custom);
      })
      .catch(() => setCustomEvents([]));
  }, []);

  const fetchMeetings = useCallback(async () => {
    try {
      const response = await api.get('/meetings');
      if (response.success) {
        setMeetings(response.meetings || []);
      }
    } catch (err) {
      console.error('Failed to fetch meetings', err);
    }
  }, []);

  useEffect(() => { 
    fetchCustomEvents(); 
    fetchMeetings();
  }, [fetchCustomEvents, fetchMeetings]);

  // Build calendar events from assessments + custom events + meetings
  const calendarEvents = useMemo(() => {
    const events = [];

    assessments.forEach(a => {
      if (a.startDate || a.start_date) {
        events.push({
          id: `${a.id}-start`,
          title: `${a.title} — Opens`,
          date: new Date(a.startDate || a.start_date),
          type: a.type,
          description: `Assessment opens for ${a.status === 'published' ? 'students' : 'review (draft)'}`,
          link: `/admin/assessments/${a.id}`,
          linkLabel: 'View Assessment',
          meta: [
            a.timeLimit ? `${a.timeLimit}m` : null,
            `${a.passingGrade || 60}% pass`,
            a.status,
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
          link: `/admin/assessments/${a.id}`,
          linkLabel: 'View Assessment',
          meta: [
            a.type,
            a.questions?.length ? `${a.questions.length}Q` : null,
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
          link: `/admin/live?roomName=${encodeURIComponent(m.roomName)}`,
          linkLabel: m.status === 'live' ? 'Join Live Now' : 'Launch Session',
          meta: [
            m.status === 'live' ? 'LIVE' : m.status,
            `${m.expectedDurationMinutes}m`,
          ],
        });
      }
    });

    return events;
  }, [assessments, customEvents, meetings]);

  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    try {
      const result = await createEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: new Date(`${newEvent.date}T${newEvent.time || '09:00'}`).toISOString(),
        time: newEvent.time,
        type: 'custom',
      });
      setCustomEvents(prev => [...prev, result]);
      setShowModal(false);
      toast.success('Event scheduled successfully');
    } catch {
      toast.error('Failed to create event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if(!window.confirm("Delete this custom event?")) return;
    try {
      await deleteEvent(id);
      setCustomEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  // Called when user clicks a day on the calendar
  const onDayClickAddEvent = (dateObj) => {
    // Format date to YYYY-MM-DD
    const pad = (n) => n.toString().padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const mm = pad(dateObj.getMonth() + 1);
    const dd = pad(dateObj.getDate());
    
    setNewEvent({ title: '', description: '', date: `${yyyy}-${mm}-${dd}`, time: '09:00', type: 'custom' });
    setShowModal(true);
  };

  const toggleFilter = (type) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Upcoming custom events (for the sidebar)
  const upcomingEvents = [...customEvents]
    .filter(e => new Date(e.date) >= new Date())
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in pb-10 min-h-[85vh]">
      
      {/* ── Left Sidebar (Filters & Upcoming) ── */}
      <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
        <div className="glass-card rounded-3xl p-6 border border-surface-700/50 bg-surface-900/60">
          <button 
            onClick={() => onDayClickAddEvent(new Date())}
            className="w-full py-3 mb-8 rounded-xl gradient-primary text-surface-950 font-bold text-sm shadow-glow hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Schedule Custom Event
          </button>
          
          <div className="mb-8">
            <h3 className="text-xs font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Filter size={14} /> Filter Calendar
            </h3>
            <div className="space-y-3">
              {['quiz', 'exam', 'assignment', 'task', 'custom'].map(type => {
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
              <Clock size={14} /> Upcoming Custom Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-surface-500 text-center py-4">No upcoming events</p>
              ) : upcomingEvents.map(ev => (
                <div key={ev.id} className="p-3 rounded-xl bg-surface-800/30 border border-surface-700/50 group">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-surface-50 mb-1">{ev.title}</p>
                    <button onClick={() => handleDeleteEvent(ev.id)} className="text-surface-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
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
          onAddEvent={onDayClickAddEvent}
        />
      </div>

      {/* ── Custom Event Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-surface-900 border border-surface-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-surface-700 flex justify-between items-center bg-surface-800/50">
              <h3 className="font-bold text-surface-50 flex items-center gap-2"><Bell size={18} className="text-primary-400" /> Schedule Custom Event</h3>
              <button onClick={() => setShowModal(false)} className="text-surface-400 hover:text-surface-50"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g., Live Q&A Session"
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-surface-50 focus:border-primary-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-surface-50 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-surface-50 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Description (Optional)</label>
                <textarea
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-surface-50 focus:border-primary-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-surface-700 bg-surface-800/50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 font-bold text-surface-400 hover:text-surface-50">Cancel</button>
              <button onClick={handleAddEvent} className="px-6 py-2 rounded-xl gradient-primary text-surface-950 font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all">
                <span className="flex items-center gap-2"><Save size={16} /> Save Event</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useAssessments } from '@/contexts/AssessmentContext';
import CalendarWidget from '@/components/common/CalendarWidget';
import {
  CalendarDays, Plus, X, Save, Clock, Bell,
  BrainCircuit, GraduationCap, FileText, CheckSquare
} from 'lucide-react';

const STORAGE_KEY = 'reali_custom_events';

function loadCustomEvents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveCustomEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export default function AdminCalendar() {
  const { assessments } = useAssessments();
  const [customEvents, setCustomEvents] = useState(loadCustomEvents);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', time: '09:00', type: 'custom' });

  // Build calendar events from assessments
  const calendarEvents = useMemo(() => {
    const events = [];

    assessments.forEach(a => {
      // Start date event
      if (a.startDate) {
        events.push({
          id: `${a.id}-start`,
          title: `📗 ${a.title} — Opens`,
          date: new Date(a.startDate),
          type: a.type,
          description: `${a.type.charAt(0).toUpperCase() + a.type.slice(1)} opens for ${a.status === 'published' ? 'students' : 'review (draft)'}`,
          link: `/admin/assessments/${a.id}`,
          linkLabel: 'View Assessment',
          meta: [
            a.timeLimit ? `${a.timeLimit}m` : null,
            `${a.passingGrade}% pass`,
            a.status,
          ].filter(Boolean),
        });
      }

      // End / deadline event
      if (a.endDate) {
        events.push({
          id: `${a.id}-end`,
          title: `⏰ ${a.title} — Deadline`,
          date: new Date(a.endDate),
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

    // Add custom events
    customEvents.forEach(ev => {
      events.push({
        id: ev.id,
        title: ev.title,
        date: new Date(`${ev.date}T${ev.time || '09:00'}`),
        type: 'custom',
        description: ev.description,
      });
    });

    return events;
  }, [assessments, customEvents]);

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    const ev = {
      ...newEvent,
      id: `custom-${Date.now()}`,
    };
    const updated = [...customEvents, ev];
    setCustomEvents(updated);
    saveCustomEvents(updated);
    setNewEvent({ title: '', description: '', date: '', time: '09:00', type: 'custom' });
    setShowModal(false);
  };

  const handleDeleteCustom = (id) => {
    const updated = customEvents.filter(e => e.id !== id);
    setCustomEvents(updated);
    saveCustomEvents(updated);
  };

  // Stats
  const totalEvents = calendarEvents.length;
  const thisMonth = calendarEvents.filter(e => {
    const d = e.date instanceof Date ? e.date : new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const upcoming = calendarEvents.filter(e => {
    const d = e.date instanceof Date ? e.date : new Date(e.date);
    return d >= new Date();
  }).length;

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-surface-900/80 border border-surface-700 text-sm text-white placeholder-surface-500 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all';

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md">
            <CalendarDays size={14} className="text-primary-400" />
            <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
              Academic Calendar
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Calendar & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Scheduling</span>
          </h1>
          <p className="text-surface-400 text-sm max-w-2xl leading-relaxed">
            Track all assessment deadlines, quiz schedules, exam dates, and custom academic events.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-surface-950 font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} /> Add Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: CalendarDays, label: 'Total Events', value: totalEvents, color: '#D4AF37' },
          { icon: Clock, label: 'This Month', value: thisMonth, color: '#3B82F6' },
          { icon: Bell, label: 'Upcoming', value: upcoming, color: '#10B981' },
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
      <CalendarWidget events={calendarEvents} onAddEvent={() => setShowModal(true)} />

      {/* Custom Events List */}
      {customEvents.length > 0 && (
        <div className="glass-card rounded-2xl border border-surface-700/50 bg-surface-900/60 p-5">
          <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Custom Events ({customEvents.length})</h3>
          <div className="space-y-2">
            {customEvents.map(ev => (
              <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/30 border border-surface-700/50">
                <div className="flex items-center gap-3">
                  <Bell size={14} className="text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">{ev.title}</p>
                    <p className="text-[10px] text-surface-500">{ev.date} at {ev.time}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteCustom(ev.id)} className="p-1.5 rounded-lg text-surface-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900 p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-white">Add Custom Event</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Title</label>
                <input type="text" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Faculty Meeting" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Description</label>
                <textarea value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} placeholder="Optional details..." rows={2} className={`${inputCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Date</label>
                  <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Time</label>
                  <input type="time" value={newEvent.time} onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))} className={inputCls} />
                </div>
              </div>

              <button onClick={handleAddEvent} disabled={!newEvent.title.trim() || !newEvent.date}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-primary text-surface-950 font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <Save size={16} /> Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

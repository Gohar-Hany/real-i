import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Clock, Target, Calendar as CalendarIcon,
  BrainCircuit, GraduationCap, FileText, CheckSquare, AlertTriangle,
  Bell, X
} from 'lucide-react';

const TYPE_CONFIG = {
  quiz: { label: 'Quiz', icon: BrainCircuit, color: '#8B5CF6', bg: 'bg-violet-500', dotBg: 'bg-violet-500' },
  exam: { label: 'Exam', icon: GraduationCap, color: '#EF4444', bg: 'bg-rose-500', dotBg: 'bg-rose-500' },
  assignment: { label: 'Assignment', icon: FileText, color: '#3B82F6', bg: 'bg-blue-500', dotBg: 'bg-blue-500' },
  task: { label: 'Task', icon: CheckSquare, color: '#10B981', bg: 'bg-emerald-500', dotBg: 'bg-emerald-500' },
  custom: { label: 'Event', icon: Bell, color: '#F59E0B', bg: 'bg-amber-500', dotBg: 'bg-amber-500' },
  start: { label: 'Start', icon: Clock, color: '#06B6D4', bg: 'bg-cyan-500', dotBg: 'bg-cyan-500' },
  deadline: { label: 'Deadline', icon: AlertTriangle, color: '#F97316', bg: 'bg-orange-500', dotBg: 'bg-orange-500' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * CalendarWidget — Reusable monthly calendar with event dots & detail panel.
 *
 * Props:
 *  events: Array<{ id, title, date (Date|string), type, description?, link?, linkLabel?, meta? }>
 *  onAddEvent?: () => void   — if provided, shows an "Add Event" button (admin only)
 */
export default function CalendarWidget({ events = [], onAddEvent }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Previous month filler days
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

  // Navigate
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
    setSelectedEvent(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
    setSelectedEvent(null);
  };
  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(today);
    setSelectedEvent(null);
  };

  // Index events by date key "YYYY-MM-DD"
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(ev => {
      const d = ev.date instanceof Date ? ev.date : new Date(ev.date);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push({ ...ev, _date: d });
    });
    return map;
  }, [events]);

  // Events for selected date
  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    return eventsByDate[key] || [];
  }, [selectedDate, eventsByDate]);

  // Upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const next7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return events
      .map(ev => ({ ...ev, _date: ev.date instanceof Date ? ev.date : new Date(ev.date) }))
      .filter(ev => !isNaN(ev._date) && ev._date >= now && ev._date <= next7)
      .sort((a, b) => a._date - b._date)
      .slice(0, 6);
  }, [events]);

  // Build calendar grid (6 rows x 7 cols)
  const calendarGrid = useMemo(() => {
    const cells = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, inMonth: false, date: new Date(viewYear, viewMonth - 1, prevMonthDays - i) });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, inMonth: true, date: new Date(viewYear, viewMonth, d) });
    }

    // Next month padding (fill to 42 = 6 rows)
    const remainder = 42 - cells.length;
    for (let d = 1; d <= remainder; d++) {
      cells.push({ day: d, inMonth: false, date: new Date(viewYear, viewMonth + 1, d) });
    }

    return cells;
  }, [viewYear, viewMonth, daysInMonth, firstDay, prevMonthDays]);

  const getDateEvents = (date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return eventsByDate[key] || [];
  };

  return (
    <div className="grid lg:grid-cols-[1fr,360px] gap-6">
      {/* ── Main Calendar ─────────────────────────────────── */}
      <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
        {/* Month Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-700/50">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white transition-all active:scale-95">
              <ChevronLeft size={16} />
            </button>
            <div className="min-w-[180px] text-center">
              <h2 className="text-lg font-extrabold text-white">
                {MONTHS[viewMonth]} <span className="text-primary-400">{viewYear}</span>
              </h2>
            </div>
            <button onClick={nextMonth} className="p-2 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white transition-all active:scale-95">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToday} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-800 border border-surface-700 text-surface-300 hover:text-white transition-all">
              Today
            </button>
            {onAddEvent && (
              <button onClick={onAddEvent} className="px-3 py-1.5 rounded-xl text-xs font-bold gradient-primary text-surface-950 active:scale-95 transition-all">
                + Event
              </button>
            )}
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-surface-700/50">
          {DAYS.map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-bold text-surface-500 uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarGrid.map((cell, i) => {
            const cellEvents = getDateEvents(cell.date);
            const isToday = isSameDay(cell.date, today);
            const isSelected = selectedDate && isSameDay(cell.date, selectedDate);
            const hasEvents = cellEvents.length > 0;

            return (
              <button
                key={i}
                onClick={() => { setSelectedDate(cell.date); setSelectedEvent(null); }}
                className={`relative min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2 border-b border-r border-surface-800/30 text-left transition-all hover:bg-surface-800/30 group ${
                  !cell.inMonth ? 'opacity-30' : ''
                } ${isSelected ? 'bg-primary-500/10 ring-1 ring-primary-500/30' : ''}`}
              >
                {/* Day Number */}
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  isToday ? 'gradient-primary text-surface-950 shadow-[0_0_10px_rgba(212,175,55,0.2)]' :
                  isSelected ? 'text-primary-400' :
                  'text-surface-300 group-hover:text-white'
                }`}>
                  {cell.day}
                </span>

                {/* Event dots / pills */}
                {hasEvents && (
                  <div className="mt-0.5 flex flex-col gap-0.5">
                    {cellEvents.slice(0, 3).map((ev, j) => {
                      const tc = TYPE_CONFIG[ev.type] || TYPE_CONFIG.custom;
                      return (
                        <div key={j}
                          className={`hidden sm:block truncate text-[9px] font-bold px-1.5 py-0.5 rounded ${tc.dotBg}/20`}
                          style={{ color: tc.color }}
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                    {/* Mobile: dots only */}
                    <div className="flex gap-0.5 sm:hidden mt-1">
                      {cellEvents.slice(0, 4).map((ev, j) => {
                        const tc = TYPE_CONFIG[ev.type] || TYPE_CONFIG.custom;
                        return <div key={j} className={`w-1.5 h-1.5 rounded-full ${tc.dotBg}`} />;
                      })}
                    </div>
                    {cellEvents.length > 3 && (
                      <span className="hidden sm:block text-[9px] text-surface-500 font-bold pl-1.5">
                        +{cellEvents.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-surface-700/50 flex flex-wrap gap-3">
          {Object.entries(TYPE_CONFIG).filter(([k]) => !['start', 'deadline'].includes(k)).map(([key, tc]) => (
            <div key={key} className="flex items-center gap-1.5 text-[10px] text-surface-400">
              <div className={`w-2.5 h-2.5 rounded-full ${tc.dotBg}`} />
              <span className="font-bold">{tc.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ───────────────────────────────────── */}
      <div className="space-y-6">
        {/* Selected Date Events */}
        {selectedDate && (
          <div className="glass-card rounded-2xl border border-surface-700/50 bg-surface-900/60 overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-surface-700/50 flex items-center justify-between">
              <div>
                <p className="text-xs text-surface-500 font-bold uppercase tracking-wider">Events on</p>
                <p className="text-sm font-extrabold text-white">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelectedDate(null)} className="p-1.5 rounded-lg text-surface-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>

            {selectedEvents.length === 0 ? (
              <div className="p-6 text-center">
                <CalendarIcon size={24} className="text-surface-600 mx-auto mb-2" />
                <p className="text-xs text-surface-500 font-bold">No events on this day</p>
              </div>
            ) : (
              <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto">
                {selectedEvents.map((ev, i) => {
                  const tc = TYPE_CONFIG[ev.type] || TYPE_CONFIG.custom;
                  const EvIcon = tc.icon;
                  const isExpanded = selectedEvent === ev.id;
                  return (
                    <div key={i}>
                      <button
                        onClick={() => setSelectedEvent(isExpanded ? null : ev.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          isExpanded ? 'border-primary-500/30 bg-primary-500/5' : 'border-surface-700/50 bg-surface-800/30 hover:bg-surface-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${tc.color}15`, border: `1px solid ${tc.color}30` }}>
                            <EvIcon size={14} style={{ color: tc.color }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{ev.title}</p>
                            <p className="text-[10px] text-surface-500">
                              {formatTime(ev._date)} · <span style={{ color: tc.color }}>{tc.label}</span>
                            </p>
                          </div>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="mt-1 ml-10 p-3 rounded-xl bg-surface-800/30 border border-surface-700/50 animate-fade-in">
                          {ev.description && <p className="text-xs text-surface-400 mb-2">{ev.description}</p>}
                          {ev.meta && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {ev.meta.map((m, j) => (
                                <span key={j} className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-700/50 text-surface-300">{m}</span>
                              ))}
                            </div>
                          )}
                          {ev.link && (
                            <Link to={ev.link} className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-400 hover:text-primary-300 transition-colors">
                              {ev.linkLabel || 'Open'} →
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Upcoming Events */}
        <div className="glass-card rounded-2xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
          <div className="p-4 border-b border-surface-700/50">
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Upcoming · Next 7 Days</p>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="p-6 text-center">
              <Clock size={24} className="text-surface-600 mx-auto mb-2" />
              <p className="text-xs text-surface-500 font-bold">No upcoming events</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {upcomingEvents.map((ev, i) => {
                const tc = TYPE_CONFIG[ev.type] || TYPE_CONFIG.custom;
                const EvIcon = tc.icon;
                const daysUntil = Math.ceil((ev._date - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/30 border border-surface-700/50 hover:bg-surface-800/60 transition-all">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${tc.color}15`, border: `1px solid ${tc.color}30` }}>
                      <EvIcon size={14} style={{ color: tc.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{ev.title}</p>
                      <p className="text-[10px] text-surface-500">
                        {ev._date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {formatTime(ev._date)}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                      daysUntil <= 1 ? 'bg-rose-500/10 text-rose-400' :
                      daysUntil <= 3 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-surface-700/50 text-surface-400'
                    }`}>
                      {daysUntil <= 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

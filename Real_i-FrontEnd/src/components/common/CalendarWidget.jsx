import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Clock, Target, Calendar as CalendarIcon,
  BrainCircuit, GraduationCap, FileText, CheckSquare, AlertTriangle,
  Bell, X, Plus
} from 'lucide-react';

export const TYPE_CONFIG = {
  quiz: { label: 'Quiz', icon: BrainCircuit, color: '#8B5CF6', bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
  exam: { label: 'Exam', icon: GraduationCap, color: '#EF4444', bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400' },
  assignment: { label: 'Assignment', icon: FileText, color: '#3B82F6', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  task: { label: 'Task', icon: CheckSquare, color: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  custom: { label: 'Event', icon: Bell, color: '#F59E0B', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
  start: { label: 'Start', icon: Clock, color: '#06B6D4', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
  deadline: { label: 'Deadline', icon: AlertTriangle, color: '#F97316', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

/**
 * Advanced Calendar Widget
 * 
 * Props:
 *  events: Array<{ id, title, date (Date|string), type, description?, link?, linkLabel?, meta? }>
 *  filters: Object of active event types to show { quiz: true, custom: false, etc }
 *  onAddEvent?: (date) => void - if provided, enables clicking on days to add events
 */
export default function CalendarWidget({ events = [], filters = null, onAddEvent }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  
  // Modal for Viewing Day's Events
  const [selectedDate, setSelectedDate] = useState(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

  // Navigate
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  // Filter events before indexing
  const filteredEvents = useMemo(() => {
    if (!filters) return events;
    return events.filter(ev => {
      // If it's a deadline or start event, we use the original type from meta or default logic
      // Actually, we can just allow everything if no strict filtering is needed, 
      // but let's check filters[ev.type]. If the type isn't in filters object, we assume true.
      if (filters[ev.type] !== undefined && !filters[ev.type]) return false;
      return true;
    });
  }, [events, filters]);

  // Index events by date key "YYYY-MM-DD"
  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach(ev => {
      const d = ev.date instanceof Date ? ev.date : new Date(ev.date);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push({ ...ev, _date: d });
    });
    // Sort events inside each day by time
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => a._date.getTime() - b._date.getTime());
    });
    return map;
  }, [filteredEvents]);

  // Generate Calendar Grid
  const gridCells = [];
  
  // 1. Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    gridCells.push({
      day: prevMonthDays - i,
      month: viewMonth === 0 ? 11 : viewMonth - 1,
      year: viewMonth === 0 ? viewYear - 1 : viewYear,
      isCurrentMonth: false,
    });
  }
  
  // 2. Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    gridCells.push({
      day: i,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
    });
  }
  
  // 3. Next month leading days (to fill out a 6-row grid usually = 42 cells)
  const remainingCells = 42 - gridCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    gridCells.push({
      day: i,
      month: viewMonth === 11 ? 0 : viewMonth + 1,
      year: viewMonth === 11 ? viewYear + 1 : viewYear,
      isCurrentMonth: false,
    });
  }

  return (
    <div className="w-full flex flex-col h-full bg-surface-900 rounded-3xl border border-surface-700/50 overflow-hidden shadow-2xl">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 border-b border-surface-700/50 bg-surface-800/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-surface-950 shadow-lg">
            <CalendarIcon size={24} className="opacity-90" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <p className="text-sm text-surface-400 mt-0.5">Manage your learning schedule</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-4 py-2 rounded-xl bg-surface-800 border border-surface-700 text-sm font-bold text-surface-300 hover:text-white hover:bg-surface-700 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl bg-surface-800 border border-surface-700 p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-surface-700/50 bg-surface-800/50">
          {DAYS.map(d => (
            <div key={d} className="px-2 py-3 text-center text-xs font-bold text-surface-400 uppercase tracking-widest hidden md:block">
              {d}
            </div>
          ))}
          {DAYS.map(d => (
            <div key={d + 'short'} className="px-2 py-3 text-center text-xs font-bold text-surface-400 uppercase tracking-widest md:hidden">
              {d.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-7 flex-1 min-h-[500px] auto-rows-fr">
          {gridCells.map((cell, idx) => {
            const dateObj = new Date(cell.year, cell.month, cell.day);
            const key = `${cell.year}-${cell.month}-${cell.day}`;
            const dayEvents = eventsByDate[key] || [];
            const isToday = isSameDay(dateObj, today);
            
            // Only show up to 3 events, then "+X more"
            const visibleEvents = dayEvents.slice(0, 3);
            const hiddenCount = dayEvents.length - 3;

            return (
              <div 
                key={idx}
                onClick={() => setSelectedDate(dateObj)}
                className={`min-h-[100px] border-b border-r border-surface-800/50 p-1 md:p-2 flex flex-col transition-colors cursor-pointer group hover:bg-surface-800/30
                  ${!cell.isCurrentMonth ? 'bg-surface-950/40 text-surface-600' : 'bg-surface-900 text-surface-300'}
                `}
              >
                {/* Day Header */}
                <div className="flex items-start justify-between mb-1">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                    isToday ? 'gradient-primary text-surface-950 shadow-lg shadow-primary-500/20' : 
                    (!cell.isCurrentMonth ? 'text-surface-600' : 'text-surface-300 group-hover:text-white')
                  }`}>
                    {cell.day}
                  </span>
                  {onAddEvent && cell.isCurrentMonth && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAddEvent(dateObj); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-surface-500 hover:text-primary-400 hover:bg-primary-500/10 rounded-md transition-all hidden md:block"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>

                {/* Event Pills */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-hide">
                  {visibleEvents.map(ev => {
                    const conf = TYPE_CONFIG[ev.type] || TYPE_CONFIG.custom;
                    const Icon = conf.icon;
                    return (
                      <div 
                        key={ev.id}
                        className={`text-[10px] md:text-xs px-1.5 py-1 rounded border truncate flex items-center gap-1.5 ${conf.bg} ${conf.border} ${conf.text}`}
                        title={ev.title}
                      >
                        <Icon size={10} className="shrink-0 hidden md:block" />
                        <span className="truncate font-semibold">{ev.title}</span>
                      </div>
                    );
                  })}
                  {hiddenCount > 0 && (
                    <div className="text-[10px] text-surface-500 font-bold px-1 mt-1 text-center">
                      +{hiddenCount} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Events Modal */}
      {selectedDate && (
        <DayModal 
          date={selectedDate} 
          events={eventsByDate[`${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`] || []}
          onClose={() => setSelectedDate(null)}
          onAddEvent={onAddEvent}
        />
      )}
    </div>
  );
}

// ── Daily Events Modal Component ──
function DayModal({ date, events, onClose, onAddEvent }) {
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const isToday = isSameDay(date, new Date());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-surface-900 border border-surface-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-surface-700 flex justify-between items-center bg-surface-800/50">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <CalendarIcon size={18} className="text-primary-400" />
              {dateStr}
              {isToday && <span className="text-[10px] bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full uppercase tracking-wider ml-2">Today</span>}
            </h3>
            <p className="text-sm text-surface-400 mt-1">{events.length} event(s) scheduled</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-800 text-surface-400 hover:text-white transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {events.length === 0 ? (
            <div className="py-10 text-center">
              <Target size={40} className="text-surface-700 mx-auto mb-4" />
              <p className="text-white font-bold text-lg mb-1">Clear Schedule!</p>
              <p className="text-sm text-surface-500">There are no events planned for this day.</p>
            </div>
          ) : (
            events.map(ev => {
              const conf = TYPE_CONFIG[ev.type] || TYPE_CONFIG.custom;
              const Icon = conf.icon;
              return (
                <div key={ev.id} className="relative glass-card rounded-2xl p-5 border border-surface-700/50 bg-surface-800/30 hover:bg-surface-800/60 transition-colors">
                  <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl`} style={{ backgroundColor: conf.color }} />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${conf.bg} ${conf.border} ${conf.text}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base leading-tight mb-1">{ev.title}</h4>
                        <div className="flex items-center gap-3 text-xs font-mono text-surface-400 mb-2">
                          <span className="flex items-center gap-1"><Clock size={12}/> {ev._date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          <span className={`px-1.5 py-0.5 rounded font-sans uppercase tracking-wider text-[9px] ${conf.bg} ${conf.text}`}>{conf.label}</span>
                        </div>
                        {ev.description && <p className="text-sm text-surface-300 line-clamp-2">{ev.description}</p>}
                        
                        {/* Meta Pills */}
                        {ev.meta && ev.meta.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {ev.meta.map((m, i) => (
                              <span key={i} className="px-2 py-1 rounded bg-surface-800 border border-surface-700 text-xs text-surface-400 font-medium">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {ev.link && (
                      <Link 
                        to={ev.link} 
                        onClick={onClose}
                        className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-white text-xs font-bold rounded-xl transition-colors border border-surface-700 whitespace-nowrap shrink-0"
                      >
                        {ev.linkLabel || 'View'}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {onAddEvent && (
          <div className="p-5 border-t border-surface-700 bg-surface-800/30">
            <button 
              onClick={() => { onClose(); onAddEvent(date); }}
              className="w-full py-3 rounded-xl gradient-primary text-surface-950 font-bold text-sm shadow-glow hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Schedule New Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

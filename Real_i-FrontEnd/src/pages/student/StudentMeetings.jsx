import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Video, Radio, Calendar, Clock, CheckCircle2, Sparkles, 
  Search, Filter, BookOpen, ChevronRight, Play, Award, 
  Layers, AlertCircle, ArrowUpRight, HelpCircle, Check, X,
  FileText, BarChart2, RefreshCw, Lock, Users, Repeat
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMeetings, getCourses } from '@/services/api';
import Select from '@/components/common/Select';

export default function StudentMeetings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meetings, setMeetings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    liveCount: 0,
    scheduledCount: 0,
    endedCount: 0,
    attendedCount: 0,
    totalLearningMinutes: 0,
    enrolledSeriesCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'live', 'upcoming', 'attended', 'series'
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Study Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedAiMeeting, setSelectedAiMeeting] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({}); // { [questionIdx]: selectedOptionIdx }
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [meetingsRes, coursesRes] = await Promise.all([
        getMeetings().catch(() => ({ success: false, meetings: [] })),
        getCourses().catch(() => [])
      ]);

      if (meetingsRes.success && Array.isArray(meetingsRes.meetings)) {
        setMeetings(meetingsRes.meetings);
        if (meetingsRes.stats) {
          setStats(meetingsRes.stats);
        }
      }

      if (Array.isArray(coursesRes)) {
        setCourses(coursesRes);
      }
    } catch (err) {
      console.error('Failed to fetch student meetings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Join Meeting Handler (Direct token authorization link)
  const handleJoinMeeting = (meeting) => {
    const slug = meeting.roomSlug || meeting.roomName;
    navigate(`/student/live?meetingId=${encodeURIComponent(meeting._id)}&roomSlug=${encodeURIComponent(slug)}`);
  };

  // Open AI Summary & Quiz Modal
  const handleOpenAiNotes = (meeting) => {
    setSelectedAiMeeting(meeting);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setShowAiModal(true);
  };

  const handleQuizSelect = (questionIdx, optionIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
  };

  // Filtered Meetings Calculation
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      // Tab Filtering
      if (activeTab === 'live' && m.status !== 'live') return false;
      if (activeTab === 'upcoming' && m.status !== 'scheduled') return false;
      if (activeTab === 'attended' && (!m.isAttended && m.status !== 'ended')) return false;
      if (activeTab === 'series' && !m.recurrence?.isRecurring) return false;

      // Course Filter
      if (selectedCourseFilter !== 'all' && m.courseId !== selectedCourseFilter) return false;

      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = m.title?.toLowerCase().includes(q);
        const matchesCourse = m.courseName?.toLowerCase().includes(q);
        const matchesDesc = m.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCourse && !matchesDesc) return false;
      }

      return true;
    });
  }, [meetings, activeTab, selectedCourseFilter, searchQuery]);

  // Grouped Series for the 'series' tab
  const groupedSeries = useMemo(() => {
    const map = {};
    meetings.forEach(m => {
      if (m.recurrence?.seriesId) {
        const sId = m.recurrence.seriesId;
        if (!map[sId]) {
          map[sId] = {
            seriesId: sId,
            courseName: m.courseName || 'General Masterclass',
            title: m.title.replace(/— Session \d+ of \d+/, '').trim(),
            totalSessions: m.recurrence.totalSessionsInSeries || 16,
            sessions: []
          };
        }
        map[sId].sessions.push(m);
      }
    });

    // Sort sessions in each series chronologically
    Object.values(map).forEach(group => {
      group.sessions.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
      group.completedCount = group.sessions.filter(s => s.status === 'ended').length;
      group.attendedCount = group.sessions.filter(s => s.isAttended).length;
    });

    return Object.values(map);
  }, [meetings]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── Executive Header Banner ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-surface-900 via-surface-900/90 to-surface-950 p-6 rounded-3xl border border-surface-700/60 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-sm">
              <Video className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-surface-50 font-heading">
              My Virtual Classrooms & Live Cohorts
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-surface-400 mt-1 max-w-2xl font-sans">
            Access your course lectures, join scheduled 4-month cohort series, review attendance logs, and study AI cognitive lecture notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-3 rounded-2xl bg-surface-800 hover:bg-surface-700 text-surface-300 border border-surface-700 transition-all hover:scale-105 active:scale-95"
            title="Refresh schedule"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/student/calendar"
            className="flex items-center gap-2 px-4 py-3 bg-surface-800 hover:bg-surface-700 text-surface-200 font-semibold text-xs rounded-2xl border border-surface-700 transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4 text-primary-400" />
            <span>View Calendar</span>
          </Link>
        </div>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Live Now Card */}
        <div className={`p-5 rounded-3xl border transition-all ${
          stats.liveCount > 0 
            ? 'bg-gradient-to-br from-emerald-950/40 via-surface-900 to-surface-900 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
            : 'bg-surface-900/70 border-surface-700/50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-surface-400">Live Streaming</span>
            <span className={`p-2 rounded-xl ${stats.liveCount > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface-800 text-surface-500'}`}>
              <Radio className={`w-4 h-4 ${stats.liveCount > 0 ? 'animate-pulse' : ''}`} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${stats.liveCount > 0 ? 'text-emerald-400' : 'text-surface-100'}`}>
              {stats.liveCount}
            </span>
            <span className="text-xs text-surface-400">Class(es) active</span>
          </div>
        </div>

        {/* Upcoming Card */}
        <div className="p-5 rounded-3xl bg-surface-900/70 border border-surface-700/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-surface-400">Upcoming Scheduled</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-surface-100">
              {stats.scheduledCount}
            </span>
            <span className="text-xs text-surface-400">Lectures</span>
          </div>
        </div>

        {/* Attended & Learning Time */}
        <div className="p-5 rounded-3xl bg-surface-900/70 border border-surface-700/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-surface-400">Attended & Learning Time</span>
            <span className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-primary-400">
              {stats.attendedCount}
            </span>
            <span className="text-xs text-surface-400">
              Sessions ({Math.round(stats.totalLearningMinutes / 60 * 10) / 10}h)
            </span>
          </div>
        </div>

        {/* 4-Month Cohorts */}
        <div className="p-5 rounded-3xl bg-surface-900/70 border border-surface-700/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-surface-400">4-Month Cohort Series</span>
            <span className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Repeat className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-violet-400">
              {stats.enrolledSeriesCount}
            </span>
            <span className="text-xs text-surface-400">Course Cohorts</span>
          </div>
        </div>
      </div>

      {/* ── Filters, Tabs & Search Bar ── */}
      <div className="bg-surface-900/70 p-4 rounded-3xl border border-surface-700/50 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Navigation Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Sessions', count: meetings.length },
            { id: 'live', label: 'Live Now', count: stats.liveCount, badgeColor: 'bg-emerald-500 text-white animate-pulse' },
            { id: 'upcoming', label: 'Upcoming Schedule', count: stats.scheduledCount },
            { id: 'attended', label: 'Attended & Past', count: stats.endedCount },
            { id: 'series', label: '4-Month Cohort Series', count: groupedSeries.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-surface-950 shadow-md shadow-primary-500/20'
                  : 'bg-surface-950/60 text-surface-400 hover:text-surface-200 border border-surface-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-surface-950/30 text-surface-950' : (tab.badgeColor || 'bg-surface-800 text-surface-300')
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Course Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-48">
            <Select
              value={selectedCourseFilter}
              onChange={setSelectedCourseFilter}
              options={[
                { value: 'all', label: 'All Enrolled Courses' },
                ...courses.map(c => ({ value: c.id || c._id, label: c.title }))
              ]}
            />
          </div>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lectures, topics..." 
              className="w-full pl-9 pr-4 py-2.5 bg-surface-950 border border-surface-700/60 rounded-2xl text-xs focus:outline-none focus:border-primary-500 text-surface-50 placeholder-surface-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Main Content View ── */}
      {isLoading ? (
        <div className="p-16 text-center text-surface-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading your classroom schedule...</span>
        </div>
      ) : activeTab === 'series' ? (
        /* ── 4-Month Cohort Series Grouped View ── */
        <div className="space-y-4">
          {groupedSeries.length === 0 ? (
            <div className="p-12 text-center bg-surface-900/40 rounded-3xl border border-surface-800">
              <Repeat className="w-10 h-10 text-surface-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-surface-200">No Cohort Series Found</h3>
              <p className="text-xs text-surface-400 mt-1">You will see your multi-month weekly course cohorts here once scheduled by your instructor.</p>
            </div>
          ) : (
            groupedSeries.map(group => {
              const progressPct = Math.round((group.completedCount / group.totalSessions) * 100);

              return (
                <div key={group.seriesId} className="bg-surface-900/80 border border-surface-700/60 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20 uppercase tracking-wider">
                          4-Month Cohort Series
                        </span>
                        <span className="text-xs text-primary-400 font-semibold font-mono">
                          {group.courseName}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-surface-50 font-heading mt-1">
                        {group.title}
                      </h3>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <span className="text-xs font-bold text-surface-300 font-mono">
                        {group.completedCount} of {group.totalSessions} Sessions Complete ({progressPct}%)
                      </span>
                      <div className="w-44 h-2 bg-surface-950 rounded-full mt-1.5 overflow-hidden border border-surface-800">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-primary-500 rounded-full transition-all duration-500" 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sessions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    {group.sessions.map((session, idx) => {
                      const isLive = session.status === 'live';
                      const isEnded = session.status === 'ended';

                      return (
                        <div 
                          key={session._id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isLive 
                              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-md'
                              : isEnded
                              ? 'bg-surface-950/60 border-surface-800 text-surface-400'
                              : 'bg-surface-950 border-surface-800/80 hover:border-surface-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                            <span className="font-bold text-surface-200">
                              Session {session.recurrence?.sessionIndex || idx + 1}
                            </span>
                            {isLive && (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <Radio className="w-3 h-3 animate-pulse" /> LIVE
                              </span>
                            )}
                            {isEnded && (
                              <span className="text-surface-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Done
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-bold text-surface-100 truncate mb-1">
                            {session.title}
                          </p>

                          <div className="text-[10px] text-surface-400 font-mono mb-3">
                            {session.scheduledFor ? new Date(session.scheduledFor).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'TBD'}
                            {' • '}
                            {session.scheduledFor ? new Date(session.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>

                          {isLive ? (
                            <button
                              onClick={() => handleJoinMeeting(session)}
                              className="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-surface-950 font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Join Now</span>
                            </button>
                          ) : isEnded && session.aiSummary?.summary ? (
                            <button
                              onClick={() => handleOpenAiNotes(session)}
                              className="w-full py-1.5 rounded-xl bg-surface-900 hover:bg-surface-800 text-violet-300 font-semibold text-xs border border-violet-500/30 transition-all flex items-center justify-center gap-1"
                            >
                              <Sparkles className="w-3 h-3 text-violet-400" />
                              <span>AI Notes</span>
                            </button>
                          ) : (
                            <div className="text-[10px] text-surface-500 text-center py-1">
                              Scheduled
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="p-16 text-center bg-surface-900/40 rounded-3xl border border-surface-800">
          <Video className="w-12 h-12 text-surface-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-surface-100 font-heading">No Lectures Found</h3>
          <p className="text-xs text-surface-400 mt-1 max-w-sm mx-auto">
            There are no virtual classroom sessions matching your current filter. Scheduled course lectures will appear here automatically.
          </p>
        </div>
      ) : (
        /* ── Standard Card Grid View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMeetings.map(meeting => {
            const isLive = meeting.status === 'live';
            const isEnded = meeting.status === 'ended';
            const isSeries = !!meeting.recurrence?.isRecurring;
            const hasAiNotes = !!meeting.aiSummary?.summary;

            return (
              <div 
                key={meeting._id}
                className={`flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300 shadow-xl relative overflow-hidden ${
                  isLive 
                    ? 'bg-gradient-to-br from-emerald-950/40 via-surface-900 to-surface-900 border-emerald-500/50 shadow-emerald-950/30 hover:scale-[1.01]' 
                    : 'bg-surface-900/80 border-surface-700/60 hover:border-surface-600'
                }`}
              >
                {/* Live Top Accent Line */}
                {isLive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-primary-400 to-emerald-400 animate-pulse" />
                )}

                <div>
                  {/* Top Badge Strip */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      {isLive && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          LIVE NOW
                        </span>
                      )}
                      {meeting.status === 'scheduled' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Calendar className="w-3 h-3" />
                          SCHEDULED
                        </span>
                      )}
                      {isEnded && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-800 text-surface-400 border border-surface-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          COMPLETED
                        </span>
                      )}
                    </div>

                    {isSeries && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        <Repeat className="w-2.5 h-2.5" />
                        <span>S{meeting.recurrence.sessionIndex}/{meeting.recurrence.totalSessionsInSeries}</span>
                      </span>
                    )}
                  </div>

                  {/* Course Tag */}
                  {meeting.courseName && (
                    <div className="text-[11px] font-semibold text-primary-400 uppercase tracking-wider mb-1">
                      {meeting.courseName}
                    </div>
                  )}

                  {/* Lecture Title */}
                  <h3 className="text-base font-bold text-surface-50 font-heading leading-snug mb-2">
                    {meeting.title}
                  </h3>

                  {meeting.description && (
                    <p className="text-xs text-surface-400 line-clamp-2 mb-4 leading-relaxed font-sans">
                      {meeting.description}
                    </p>
                  )}

                  {/* Time & Duration Specs */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-surface-950/70 border border-surface-800 text-xs font-mono mb-4">
                    <div className="flex items-center justify-between text-surface-300">
                      <span className="flex items-center gap-1.5 text-surface-400">
                        <Calendar className="w-3.5 h-3.5 text-primary-400" /> Date:
                      </span>
                      <span>
                        {meeting.scheduledFor 
                          ? new Date(meeting.scheduledFor).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
                          : 'Immediate'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-surface-300">
                      <span className="flex items-center gap-1.5 text-surface-400">
                        <Clock className="w-3.5 h-3.5 text-primary-400" /> Time:
                      </span>
                      <span>
                        {meeting.scheduledFor 
                          ? new Date(meeting.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Ongoing'} ({meeting.expectedDurationMinutes}m)
                      </span>
                    </div>

                    {meeting.isAttended && (
                      <div className="flex items-center justify-between text-emerald-400 pt-1 border-t border-surface-800">
                        <span>Attendance Status:</span>
                        <span className="font-bold">✓ Attended ({meeting.myAttendance?.attendancePercentage || 100}%)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 border-t border-surface-800/80 flex items-center gap-2">
                  {isLive ? (
                    <button
                      onClick={() => handleJoinMeeting(meeting)}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-400 hover:to-emerald-500 text-surface-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 animate-pulse-soft"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Join Live Classroom</span>
                    </button>
                  ) : hasAiNotes ? (
                    <button
                      onClick={() => handleOpenAiNotes(meeting)}
                      className="w-full py-2.5 rounded-2xl bg-surface-800 hover:bg-surface-700 text-violet-300 border border-violet-500/30 font-semibold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      <span>Study AI Lecture Notes & Quiz</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinMeeting(meeting)}
                      className="w-full py-2.5 rounded-2xl bg-surface-800 hover:bg-surface-700 text-surface-200 font-semibold text-xs border border-surface-700 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-primary-400" />
                      <span>Classroom Locked (Scheduled)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── AI STUDY NOTES & INTERACTIVE QUIZ MODAL ── */}
      {showAiModal && selectedAiMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-surface-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-surface-700/70">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-800 bg-surface-950/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-50 font-heading">
                    {selectedAiMeeting.title}
                  </h3>
                  <p className="text-xs text-violet-300 font-mono">
                    AI Lecture Companion & Interactive Comprehension Quiz
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="p-2 text-surface-400 hover:text-surface-100 rounded-xl hover:bg-surface-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-xs">
              {/* Executive Summary */}
              <div className="space-y-2">
                <h4 className="font-bold text-surface-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary-400" /> Executive Lecture Summary
                </h4>
                <p className="p-4 rounded-2xl bg-surface-950 border border-surface-800 text-surface-300 leading-relaxed font-sans text-xs">
                  {selectedAiMeeting.aiSummary?.summary}
                </p>
              </div>

              {/* Key Takeaways */}
              {selectedAiMeeting.aiSummary?.keyTakeaways?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-surface-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" /> Key Concepts Mastered
                  </h4>
                  <ul className="space-y-1.5 bg-surface-950 p-4 rounded-2xl border border-surface-800 text-surface-300 list-disc list-inside">
                    {selectedAiMeeting.aiSummary.keyTakeaways.map((k, i) => (
                      <li key={i} className="leading-relaxed">{k}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive Lecture Quiz */}
              {selectedAiMeeting.aiSummary?.generatedQuiz?.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-surface-800">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-violet-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-violet-400" /> Interactive Review Questions
                    </h4>
                    {quizSubmitted && (
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        Score: {Object.entries(quizAnswers).filter(([qIdx, optIdx]) => selectedAiMeeting.aiSummary.generatedQuiz[qIdx]?.correctIndex === optIdx).length} / {selectedAiMeeting.aiSummary.generatedQuiz.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {selectedAiMeeting.aiSummary.generatedQuiz.map((q, qIdx) => (
                      <div key={qIdx} className="p-4 rounded-2xl bg-surface-950 border border-surface-800 space-y-2.5">
                        <p className="font-semibold text-surface-100 font-sans">
                          {qIdx + 1}. {q.question}
                        </p>

                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = quizAnswers[qIdx] === optIdx;
                            const isCorrect = q.correctIndex === optIdx;

                            let optClass = 'bg-surface-900 border-surface-800 text-surface-300 hover:border-surface-700';
                            if (isSelected && !quizSubmitted) {
                              optClass = 'bg-primary-500/20 text-primary-300 border-primary-500/50';
                            } else if (quizSubmitted) {
                              if (isCorrect) {
                                optClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-semibold';
                              } else if (isSelected && !isCorrect) {
                                optClass = 'bg-rose-500/20 text-rose-300 border-rose-500/60';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={quizSubmitted}
                                onClick={() => handleQuizSelect(qIdx, optIdx)}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${optClass}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                {quizSubmitted && isSelected && !isCorrect && <X className="w-3.5 h-3.5 text-rose-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length === 0}
                      className="w-full py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md"
                    >
                      Check My Answers
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setQuizAnswers({});
                      }}
                      className="w-full py-2.5 rounded-2xl bg-surface-800 hover:bg-surface-700 text-surface-300 font-semibold text-xs transition-colors"
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

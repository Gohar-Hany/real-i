import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, Plus, Play, Calendar, Clock, Search, 
  Users, MoreVertical, X, CheckCircle, Radio, BarChart, Edit3, Trash2,
  Repeat, Shield, Sparkles, Download, Lock, Check, Layers, Filter,
  FileSpreadsheet, HelpCircle, ChevronRight, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getMeetings, getCourses, createMeeting, updateMeeting, deleteMeeting, 
  launchMeeting, endMeeting, deleteMeetingSeries, generateMeetingSummary,
  getMeetingAttendance
} from '@/services/api';
import Select from '@/components/common/Select';

const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun', short: 'S' },
  { id: 1, label: 'Mon', short: 'M' },
  { id: 2, label: 'Tue', short: 'T' },
  { id: 3, label: 'Wed', short: 'W' },
  { id: 4, label: 'Thu', short: 'T' },
  { id: 5, label: 'Fri', short: 'F' },
  { id: 6, label: 'Sat', short: 'S' }
];

export default function AdminMeetings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [meetings, setMeetings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, live, scheduled, ended, series
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportMeeting, setSelectedReportMeeting] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  
  // Form State
  const [isRecurring, setIsRecurring] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [duration, setDuration] = useState(60);
  const [scheduleType, setScheduleType] = useState('immediate');
  const [scheduledFor, setScheduledFor] = useState('');
  
  // Recurrence State
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('weekly');
  const [selectedDays, setSelectedDays] = useState([3]); // default Wednesday
  const [repeatWeeks, setRepeatWeeks] = useState(16); // 16 weeks = 4 months

  // Enterprise Security State
  const [lobbyEnabled, setLobbyEnabled] = useState(false);
  const [autoRecord, setAutoRecord] = useState(false);
  const [muteOnEntry, setMuteOnEntry] = useState(true);
  const [requireHostToStart, setRequireHostToStart] = useState(true);
  const [disableStudentScreenShare, setDisableStudentScreenShare] = useState(true);

  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMeetings();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      if (Array.isArray(data)) {
        setCourses(data);
      }
    } catch (err) {
      console.error('Failed to load courses', err);
    }
  };

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const response = await getMeetings();
      if (response.success && Array.isArray(response.meetings)) {
        setMeetings(response.meetings);
      }
    } catch (err) {
      console.error('Failed to fetch meetings', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDayToggle = (dayId) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== dayId));
      }
    } else {
      setSelectedDays([...selectedDays, dayId].sort((a, b) => a - b));
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedCourse = courses.find(c => (c.id || c._id) === courseId);
      const courseName = selectedCourse ? selectedCourse.title : '';

      const payload = {
        title,
        description,
        roomName: roomName ? roomName.replace(/\s+/g, '-') : undefined,
        expectedDurationMinutes: parseInt(duration, 10),
        status: scheduleType === 'immediate' && !isRecurring ? 'live' : 'scheduled',
        scheduledFor: scheduleType === 'scheduled' || isRecurring ? (scheduledFor ? new Date(scheduledFor).toISOString() : new Date().toISOString()) : undefined,
        courseId: courseId || undefined,
        courseName,
        lobbyEnabled,
        autoRecord,
        security: {
          muteOnEntry,
          requireHostToStart,
          disableStudentScreenShare
        },
        recurrence: isRecurring ? {
          isRecurring: true,
          frequency: recurrenceFrequency,
          daysOfWeek: selectedDays,
          repeatWeeks: parseInt(repeatWeeks, 10)
        } : { isRecurring: false }
      };

      let response;
      if (editingMeetingId) {
        response = await updateMeeting(editingMeetingId, payload);
      } else {
        response = await createMeeting(payload);
      }

      if (response.success) {
        setShowCreateModal(false);
        resetForm();
        fetchMeetings();

        if (scheduleType === 'immediate' && !isRecurring && response.meeting?.roomSlug) {
          navigate(`/admin/live?meetingId=${encodeURIComponent(response.meeting._id)}&roomSlug=${encodeURIComponent(response.meeting.roomSlug)}`);
        }
      }
    } catch (err) {
      console.error('Failed to create/update meeting', err);
      alert(err.message || 'Failed to save session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCourseId('');
    setRoomName('');
    setDuration(60);
    setScheduleType('scheduled');
    setScheduledFor('');
    setIsRecurring(false);
    setRecurrenceFrequency('weekly');
    setSelectedDays([3]);
    setRepeatWeeks(16);
    setLobbyEnabled(false);
    setAutoRecord(false);
    setMuteOnEntry(true);
    setRequireHostToStart(true);
    setDisableStudentScreenShare(true);
    setEditingMeetingId(null);
  };

  const handleEdit = (meeting) => {
    setEditingMeetingId(meeting._id);
    setTitle(meeting.title || '');
    setDescription(meeting.description || '');
    setCourseId(meeting.courseId || '');
    setRoomName(meeting.roomName ? meeting.roomName.replace(/^REAL_i-/, '') : '');
    setDuration(meeting.expectedDurationMinutes || 60);
    setScheduleType(meeting.status === 'scheduled' ? 'scheduled' : 'immediate');
    setIsRecurring(!!meeting.recurrence?.isRecurring);
    setLobbyEnabled(!!meeting.lobbyEnabled);
    setAutoRecord(!!meeting.autoRecord);
    setMuteOnEntry(meeting.security?.muteOnEntry !== false);
    setRequireHostToStart(!!meeting.security?.requireHostToStart);
    setDisableStudentScreenShare(meeting.security?.disableStudentScreenShare !== false);

    if (meeting.scheduledFor) {
      const date = new Date(meeting.scheduledFor);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      setScheduledFor(date.toISOString().slice(0, 16));
    } else {
      setScheduledFor('');
    }

    setShowCreateModal(true);
  };

  const handleDeleteSingle = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) return;
    try {
      const res = await deleteMeeting(meetingId);
      if (res.success) {
        setMeetings(prev => prev.filter(m => m._id !== meetingId));
      }
    } catch (err) {
      console.error('Failed to delete meeting', err);
      alert('Failed to delete session.');
    }
  };

  const handleDeleteSeries = async (seriesId) => {
    if (!window.confirm('Are you sure you want to delete all future scheduled sessions in this 4-month recurring series?')) return;
    try {
      const res = await deleteMeetingSeries(seriesId);
      if (res.success) {
        setMeetings(prev => prev.filter(m => m.recurrence?.seriesId !== seriesId || m.status === 'ended'));
        alert(res.message || 'Series deleted successfully.');
      }
    } catch (err) {
      console.error('Failed to delete series', err);
      alert('Failed to delete series.');
    }
  };

  const handleLaunchMeeting = async (meeting) => {
    if (meeting.status === 'scheduled') {
      try {
        await launchMeeting(meeting._id);
      } catch (err) {
        console.error('Failed to launch meeting', err);
      }
    }
    navigate(`/admin/live?meetingId=${encodeURIComponent(meeting._id)}&roomSlug=${encodeURIComponent(meeting.roomSlug || meeting.roomName)}`);
  };

  const handleOpenReport = async (meeting) => {
    setSelectedReportMeeting(meeting);
    setShowReportModal(true);
    setReportLoading(true);
    try {
      const res = await getMeetingAttendance(meeting._id);
      if (res.success) {
        setSelectedReportMeeting(prev => ({
          ...prev,
          attendance: res.attendance || [],
          totalCount: res.totalCount,
          presentCount: res.presentCount
        }));
      }
    } catch (err) {
      console.error('Failed to load attendance report', err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleGenerateAiSummary = async (meetingId) => {
    setGeneratingAi(true);
    try {
      const res = await generateMeetingSummary(meetingId);
      if (res.success) {
        setSelectedReportMeeting(prev => ({
          ...prev,
          aiSummary: res.aiSummary
        }));
        setMeetings(prev => prev.map(m => m._id === meetingId ? { ...m, aiSummary: res.aiSummary } : m));
      }
    } catch (err) {
      console.error('Failed to generate AI summary', err);
      alert('Failed to generate AI summary.');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleExportCSV = (meeting) => {
    if (!meeting.attendance || meeting.attendance.length === 0) {
      alert('No attendance data available to export.');
      return;
    }
    const headers = ['Participant Name', 'Email', 'Role', 'Status', 'Join Time', 'Duration (Seconds)', 'Attendance %'];
    const rows = meeting.attendance.map(a => [
      `"${a.name || 'Unknown'}"`,
      `"${a.email || 'N/A'}"`,
      `"${a.role || 'student'}"`,
      `"${a.status || 'present'}"`,
      `"${a.joinTime ? new Date(a.joinTime).toLocaleString() : 'N/A'}"`,
      a.durationSeconds || 0,
      `${a.attendancePercentage || 100}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `REAL_i_Attendance_${meeting.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      // Tab filter
      if (activeTab === 'live' && m.status !== 'live') return false;
      if (activeTab === 'scheduled' && m.status !== 'scheduled') return false;
      if (activeTab === 'ended' && m.status !== 'ended') return false;
      if (activeTab === 'series' && !m.recurrence?.isRecurring) return false;

      // Course filter
      if (selectedCourseFilter !== 'all' && m.courseId !== selectedCourseFilter) return false;

      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = m.title?.toLowerCase().includes(q);
        const matchesCourse = m.courseName?.toLowerCase().includes(q);
        const matchesRoom = m.roomName?.toLowerCase().includes(q) || m.roomSlug?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCourse && !matchesRoom) return false;
      }

      return true;
    });
  }, [meetings, activeTab, selectedCourseFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-900/60 p-6 rounded-3xl border border-surface-700/50 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <Video className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-surface-50 font-heading">
              Virtual Classroom & Live Meetings
            </h1>
          </div>
          <p className="text-sm text-surface-400 mt-1 max-w-2xl font-sans">
            Enterprise WebRTC suite with automated multi-month cohort scheduling, role-gated token authorization, and AI lecture cognitive synthesis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMeetings()}
            className="p-3 rounded-2xl bg-surface-800 hover:bg-surface-700 text-surface-300 border border-surface-700 transition-all hover:scale-105 active:scale-95"
            title="Refresh list"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-400 hover:to-primary-600 text-surface-950 font-bold rounded-2xl transition-all shadow-lg shadow-primary-500/25 hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Schedule Session / Series</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-900/70 p-4 rounded-2xl border border-surface-700/50 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-surface-400 font-medium block">Total Sessions</span>
            <span className="text-xl font-bold text-surface-50 font-mono">{meetings.length}</span>
          </div>
        </div>

        <div className="bg-surface-900/70 p-4 rounded-2xl border border-surface-700/50 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-emerald-400 font-medium block">Live Now</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {meetings.filter(m => m.status === 'live').length}
            </span>
          </div>
        </div>

        <div className="bg-surface-900/70 p-4 rounded-2xl border border-surface-700/50 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-surface-400 font-medium block">Upcoming Scheduled</span>
            <span className="text-xl font-bold text-surface-50 font-mono">
              {meetings.filter(m => m.status === 'scheduled').length}
            </span>
          </div>
        </div>

        <div className="bg-surface-900/70 p-4 rounded-2xl border border-surface-700/50 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-surface-400 font-medium block">4-Month Series</span>
            <span className="text-xl font-bold text-violet-400 font-mono">
              {new Set(meetings.filter(m => m.recurrence?.seriesId).map(m => m.recurrence.seriesId)).size}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Table & Filters */}
      <div className="bg-surface-900/70 rounded-3xl border border-surface-700/50 overflow-hidden shadow-xl">
        {/* Navigation Tabs and Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 border-b border-surface-700/50 bg-surface-900/40">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Sessions', count: meetings.length },
              { id: 'live', label: 'Live Now', count: meetings.filter(m => m.status === 'live').length, badgeColor: 'bg-emerald-500 text-white' },
              { id: 'scheduled', label: 'Scheduled', count: meetings.filter(m => m.status === 'scheduled').length },
              { id: 'series', label: 'Recurring Series', count: meetings.filter(m => m.recurrence?.isRecurring).length },
              { id: 'ended', label: 'Completed', count: meetings.filter(m => m.status === 'ended').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40 shadow-sm'
                    : 'bg-surface-950/60 text-surface-400 hover:text-surface-200 border border-surface-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${tab.badgeColor || 'bg-surface-800 text-surface-300'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Course Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-48">
              <Select
                value={selectedCourseFilter}
                onChange={setSelectedCourseFilter}
                options={[
                  { value: 'all', label: 'All Courses' },
                  ...courses.map(c => ({ value: c.id || c._id, label: c.title }))
                ]}
              />
            </div>

            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, room, slug..." 
                className="w-full pl-9 pr-4 py-2 bg-surface-950 border border-surface-700/60 rounded-xl text-xs focus:outline-none focus:border-primary-500 text-surface-50 placeholder-surface-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        {isLoading ? (
          <div className="p-16 text-center text-surface-400 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading virtual classrooms...</span>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-800/80 flex items-center justify-center mb-4 border border-surface-700">
              <Video className="w-8 h-8 text-surface-500" />
            </div>
            <h3 className="text-lg font-bold text-surface-50 mb-1">No sessions match your filter</h3>
            <p className="text-sm text-surface-400 mb-6 max-w-sm">
              Schedule single lectures or an automated 4-month recurring series for your course cohorts.
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-surface-950 font-bold rounded-xl text-xs transition-colors"
            >
              Create New Session
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-950/50 border-b border-surface-700/50 text-[11px] uppercase tracking-wider text-surface-400">
                  <th className="p-4 font-bold">Session & Course</th>
                  <th className="p-4 font-bold">Recurrence / Series</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Scheduled Time</th>
                  <th className="p-4 font-bold">Security & Token</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60 text-xs">
                {filteredMeetings.map(meeting => {
                  const isLive = meeting.status === 'live';
                  const isSeries = !!meeting.recurrence?.isRecurring;

                  return (
                    <tr key={meeting._id} className="hover:bg-surface-800/30 transition-colors group">
                      {/* Title & Course */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                            isLive 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                              : 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                          }`}>
                            {isLive ? <Radio className="w-5 h-5 animate-pulse" /> : <Video className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-bold text-surface-100 text-sm font-heading">{meeting.title}</div>
                            <div className="flex items-center gap-2 mt-0.5 text-surface-400 text-[11px]">
                              {meeting.courseName ? (
                                <span className="text-primary-400 font-semibold">{meeting.courseName}</span>
                              ) : (
                                <span className="text-surface-500">Standalone Lecture</span>
                              )}
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {meeting.expectedDurationMinutes} mins
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Recurrence & Series Tag */}
                      <td className="p-4">
                        {isSeries ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-violet-500/10 text-violet-300 border border-violet-500/25">
                              <Repeat className="w-3 h-3 text-violet-400" />
                              <span>Session {meeting.recurrence.sessionIndex} of {meeting.recurrence.totalSessionsInSeries}</span>
                            </span>
                            <div className="text-[10px] text-surface-400 font-mono">
                              Series: {meeting.recurrence.seriesId.slice(0, 12)}...
                            </div>
                          </div>
                        ) : (
                          <span className="text-surface-500 font-medium text-[11px]">One-Time Session</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {isLive && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live Now
                          </span>
                        )}
                        {meeting.status === 'scheduled' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Calendar className="w-3.5 h-3.5" />
                            Scheduled
                          </span>
                        )}
                        {meeting.status === 'ended' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-surface-800 text-surface-400 border border-surface-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        )}
                      </td>

                      {/* Scheduled Time */}
                      <td className="p-4 font-mono text-surface-300">
                        {meeting.scheduledFor ? (
                          <div>
                            <div className="font-semibold text-surface-200">
                              {new Date(meeting.scheduledFor).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="text-[10px] text-surface-400">
                              {new Date(meeting.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-surface-500">Immediate</span>
                        )}
                      </td>

                      {/* Security & Gatekeeper Token */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-surface-950 border border-surface-800 text-emerald-400">
                            <Lock className="w-2.5 h-2.5" />
                            <span>{meeting.roomSlug ? meeting.roomSlug.slice(0, 14) + '...' : 'reali_cls_sec'}</span>
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-surface-400">
                            {meeting.lobbyEnabled && <span className="text-amber-400 font-semibold">Lobby ON</span>}
                            {meeting.security?.requireHostToStart && <span>• Host Req</span>}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {meeting.status === 'scheduled' && (
                            <>
                              <button 
                                onClick={() => handleLaunchMeeting(meeting)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-400 text-surface-950 rounded-xl font-bold transition-all shadow-sm active:scale-95"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Launch</span>
                              </button>
                              <button
                                onClick={() => handleEdit(meeting)}
                                className="p-1.5 text-surface-400 hover:text-primary-400 rounded-lg hover:bg-surface-800 transition-colors"
                                title="Edit Session"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {isLive && (
                            <button 
                              onClick={() => handleLaunchMeeting(meeting)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 rounded-xl font-bold transition-all animate-pulse-soft"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Join Live</span>
                            </button>
                          )}

                          <button 
                            onClick={() => handleOpenReport(meeting)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-200 border border-surface-700 rounded-xl font-semibold transition-all shadow-sm"
                            title="View attendance and AI summary"
                          >
                            <BarChart className="w-3.5 h-3.5 text-primary-400" />
                            <span className="hidden sm:inline">Analytics</span>
                          </button>

                          <button
                            onClick={() => handleDeleteSingle(meeting._id)}
                            className="p-1.5 text-surface-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                            title="Delete Session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {isSeries && (
                            <button
                              onClick={() => handleDeleteSeries(meeting.recurrence.seriesId)}
                              className="p-1.5 text-violet-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                              title="Delete Entire 4-Month Series"
                            >
                              <Repeat className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL (WITH ADVANCED 4-MONTH RECURRENCE BUILDER) ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-surface-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-surface-700/70">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-800 bg-surface-950/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-surface-50 font-heading">
                    {editingMeetingId ? 'Edit Classroom Session' : 'Schedule Virtual Classroom Session'}
                  </h3>
                  <p className="text-xs text-surface-400">
                    Configure role-gated token authorization and recurring 4-month cohort lectures.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-surface-400 hover:text-surface-100 rounded-xl hover:bg-surface-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Form Body */}
            <form onSubmit={handleCreateMeeting} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {/* Type Switcher: Single Session vs 4-Month Recurring Series */}
              {!editingMeetingId && (
                <div className="p-1 bg-surface-950 rounded-2xl border border-surface-800 grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setIsRecurring(false)}
                    className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      !isRecurring 
                        ? 'bg-primary-500 text-surface-950 shadow-md' 
                        : 'text-surface-400 hover:text-surface-200'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Single Meeting</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRecurring(true)}
                    className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      isRecurring 
                        ? 'bg-gradient-to-r from-violet-600 to-primary-500 text-white shadow-md' 
                        : 'text-surface-400 hover:text-surface-200'
                    }`}
                  >
                    <Repeat className="w-4 h-4" />
                    <span>Recurring Series (e.g. 4 Months)</span>
                  </button>
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-1.5">
                    Session / Series Title <span className="text-primary-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Advanced Cognitive Systems Masterclass"
                    className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700/80 rounded-xl focus:outline-none focus:border-primary-500 text-surface-50 placeholder-surface-500 text-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-1.5">
                    Course Association & Cohort Guard <span className="text-primary-400">*</span>
                  </label>
                  <Select
                    value={courseId}
                    onChange={setCourseId}
                    className="w-full"
                    placeholder="Select Target Course..."
                    options={[
                      { value: '', label: 'Public / Standalone (Open to All Authenticated)' },
                      ...courses.map(c => ({ value: c.id || c._id, label: `${c.title} (${c.enrolled_count || 0} students)` }))
                    ]}
                  />
                  <p className="text-[11px] text-surface-400 mt-1">
                    🔒 When linked to a course, only enrolled students in this course will be authorized to join.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-1.5">
                    Agenda & Learning Objectives <span className="text-surface-500 font-normal">(Optional)</span>
                  </label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide context, required readings, or session goals..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700/80 rounded-xl focus:outline-none focus:border-primary-500 text-surface-50 placeholder-surface-500 text-xs transition-colors resize-none"
                  />
                </div>
              </div>

              {/* ── ADVANCED RECURRENCE CONFIGURATION (4 MONTHS / WEEKLY) ── */}
              {isRecurring && !editingMeetingId && (
                <div className="bg-gradient-to-br from-violet-950/40 via-surface-950 to-surface-950 p-5 rounded-2xl border border-violet-500/30 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider">
                      Automated Recurrence Engine (RRULE)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-surface-300 mb-1">
                        Frequency:
                      </label>
                      <Select
                        value={recurrenceFrequency}
                        onChange={setRecurrenceFrequency}
                        options={[
                          { value: 'weekly', label: 'Every Week (Weekly)' },
                          { value: 'biweekly', label: 'Every 2 Weeks (Bi-Weekly)' },
                          { value: 'monthly', label: 'Once a Month (Monthly)' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-surface-300 mb-1">
                        Semester Span (Total Sessions):
                      </label>
                      <Select
                        value={repeatWeeks.toString()}
                        onChange={(v) => setRepeatWeeks(parseInt(v, 10))}
                        options={[
                          { value: '4', label: '1 Month (4 Weeks / 4 Sessions)' },
                          { value: '8', label: '2 Months (8 Weeks / 8 Sessions)' },
                          { value: '12', label: '3 Months (12 Weeks / 12 Sessions)' },
                          { value: '16', label: '4 Months (16 Weeks / 16 Sessions — Recommended)' },
                          { value: '24', label: '6 Months (24 Weeks / 24 Sessions)' }
                        ]}
                      />
                    </div>
                  </div>

                  {/* Day of Week Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-surface-300 mb-2">
                      Repeat on Days of Week:
                    </label>
                    <div className="flex items-center gap-2">
                      {DAYS_OF_WEEK.map(day => {
                        const isSelected = selectedDays.includes(day.id);
                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => handleDayToggle(day.id)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                              isSelected
                                ? 'bg-violet-600 text-white border-violet-500 shadow-md'
                                : 'bg-surface-900 text-surface-400 border-surface-800 hover:border-surface-700'
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Schedule Summary Banner */}
                  <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>
                      Will batch-generate <strong>{repeatWeeks} sessions</strong> recurring every{' '}
                      <strong>{selectedDays.map(d => DAYS_OF_WEEK[d].label).join(', ')}</strong> over the next{' '}
                      <strong>{Math.round(repeatWeeks / 4)} months</strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* Timing & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-1.5">
                    Start Date & Time <span className="text-primary-500">*</span>
                  </label>
                  <input 
                    type="datetime-local" 
                    required={scheduleType === 'scheduled' || isRecurring}
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700/80 rounded-xl focus:outline-none focus:border-primary-500 text-surface-50 text-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-1.5">
                    Expected Duration
                  </label>
                  <Select
                    value={duration.toString()}
                    onChange={(v) => setDuration(parseInt(v, 10))}
                    options={[
                      { value: '30', label: '30 Minutes' },
                      { value: '45', label: '45 Minutes' },
                      { value: '60', label: '60 Minutes (1 Hour)' },
                      { value: '90', label: '90 Minutes (1.5 Hours)' },
                      { value: '120', label: '120 Minutes (2 Hours)' },
                      { value: '180', label: '180 Minutes (3 Hours)' }
                    ]}
                  />
                </div>
              </div>

              {/* Enterprise Security Policies & Guardrails */}
              <div className="p-4 rounded-2xl bg-surface-950/60 border border-surface-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-surface-200 uppercase tracking-wider">
                    Enterprise Meeting Security & Policies
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-900 border border-surface-800/80 cursor-pointer hover:border-surface-700">
                    <input 
                      type="checkbox"
                      checked={lobbyEnabled}
                      onChange={(e) => setLobbyEnabled(e.target.checked)}
                      className="rounded text-primary-500 focus:ring-0 w-4 h-4 bg-surface-950 border-surface-700"
                    />
                    <div>
                      <span className="block text-xs font-bold text-surface-200">Lobby Waiting Room</span>
                      <span className="text-[10px] text-surface-400">Admit students manually</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-900 border border-surface-800/80 cursor-pointer hover:border-surface-700">
                    <input 
                      type="checkbox"
                      checked={requireHostToStart}
                      onChange={(e) => setRequireHostToStart(e.target.checked)}
                      className="rounded text-primary-500 focus:ring-0 w-4 h-4 bg-surface-950 border-surface-700"
                    />
                    <div>
                      <span className="block text-xs font-bold text-surface-200">Require Host to Start</span>
                      <span className="text-[10px] text-surface-400">Lock entry until instructor joins</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-900 border border-surface-800/80 cursor-pointer hover:border-surface-700">
                    <input 
                      type="checkbox"
                      checked={muteOnEntry}
                      onChange={(e) => setMuteOnEntry(e.target.checked)}
                      className="rounded text-primary-500 focus:ring-0 w-4 h-4 bg-surface-950 border-surface-700"
                    />
                    <div>
                      <span className="block text-xs font-bold text-surface-200">Mute on Entry</span>
                      <span className="text-[10px] text-surface-400">Mute attendee audio automatically</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-900 border border-surface-800/80 cursor-pointer hover:border-surface-700">
                    <input 
                      type="checkbox"
                      checked={disableStudentScreenShare}
                      onChange={(e) => setDisableStudentScreenShare(e.target.checked)}
                      className="rounded text-primary-500 focus:ring-0 w-4 h-4 bg-surface-950 border-surface-700"
                    />
                    <div>
                      <span className="block text-xs font-bold text-surface-200">Host-Only Screen Share</span>
                      <span className="text-[10px] text-surface-400">Prevent student screen hijack</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex gap-3 border-t border-surface-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-2xl font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-surface-950 rounded-2xl font-bold text-xs transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-surface-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>{editingMeetingId ? 'Save Changes' : isRecurring ? `Batch-Generate ${repeatWeeks} Sessions` : 'Create Session'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ATTENDANCE REPORT & AI COGNITIVE SUMMARY MODAL ── */}
      {showReportModal && selectedReportMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-surface-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-surface-700/70">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-800 bg-surface-950/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  <BarChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-50 font-heading">
                    {selectedReportMeeting.title} — Analytics & AI Report
                  </h3>
                  <p className="text-xs text-surface-400">
                    Attendance logs, duration ratios, and AI lecture key takeaways.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-2 text-surface-400 hover:text-surface-100 rounded-xl hover:bg-surface-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-950 p-4 rounded-2xl border border-surface-800 text-center">
                  <span className="text-xs text-surface-400 block font-medium">Total Attendees</span>
                  <span className="text-2xl font-bold text-surface-100 font-mono mt-1 block">
                    {selectedReportMeeting.attendance?.length || 0}
                  </span>
                </div>

                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-center">
                  <span className="text-xs text-emerald-400 block font-medium">Present Students</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
                    {selectedReportMeeting.attendance?.filter(a => a.status === 'present').length || 0}
                  </span>
                </div>

                <div className="bg-surface-950 p-4 rounded-2xl border border-surface-800 text-center">
                  <span className="text-xs text-surface-400 block font-medium">Duration</span>
                  <span className="text-2xl font-bold text-primary-400 font-mono mt-1 block">
                    {selectedReportMeeting.expectedDurationMinutes}m
                  </span>
                </div>
              </div>

              {/* AI Cognitive Lecture Summary Section */}
              <div className="bg-gradient-to-br from-violet-950/30 via-surface-950 to-surface-950 p-5 rounded-2xl border border-violet-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider">
                      AI Lecture Companion & Smart Synthesis
                    </h4>
                  </div>
                  <button
                    disabled={generatingAi}
                    onClick={() => handleGenerateAiSummary(selectedReportMeeting._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
                  >
                    {generatingAi ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{selectedReportMeeting.aiSummary?.summary ? 'Regenerate AI Notes' : 'Generate AI Summary & Quiz'}</span>
                  </button>
                </div>

                {selectedReportMeeting.aiSummary?.summary ? (
                  <div className="space-y-3 text-xs text-surface-300 pt-2">
                    <p className="leading-relaxed bg-surface-900/80 p-3 rounded-xl border border-surface-800">
                      {selectedReportMeeting.aiSummary.summary}
                    </p>

                    {selectedReportMeeting.aiSummary.keyTakeaways?.length > 0 && (
                      <div>
                        <span className="font-bold text-surface-200 block mb-1">Key Takeaways:</span>
                        <ul className="list-disc list-inside space-y-1 text-surface-400">
                          {selectedReportMeeting.aiSummary.keyTakeaways.map((k, i) => (
                            <li key={i}>{k}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedReportMeeting.aiSummary.generatedQuiz?.length > 0 && (
                      <div className="pt-2 border-t border-surface-800">
                        <span className="font-bold text-violet-400 block mb-2">Auto-Generated Review Questions:</span>
                        <div className="space-y-2">
                          {selectedReportMeeting.aiSummary.generatedQuiz.map((q, i) => (
                            <div key={i} className="bg-surface-900 p-3 rounded-xl border border-surface-800">
                              <span className="font-semibold text-surface-200 block">{i + 1}. {q.question}</span>
                              <div className="mt-1 text-[11px] text-surface-400 space-y-0.5">
                                {q.options.map((opt, oi) => (
                                  <div key={oi} className={oi === q.correctIndex ? 'text-emerald-400 font-semibold' : ''}>
                                    • {opt} {oi === q.correctIndex && '✓ (Correct)'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-surface-400">
                    Click the button above to have REAL_i AI synthesize the live lecture topics and create an automated quiz.
                  </p>
                )}
              </div>

              {/* Attendance Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-surface-300 uppercase tracking-wider">
                    Participant Attendance Table
                  </h4>
                  <button
                    onClick={() => handleExportCSV(selectedReportMeeting)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>

                {reportLoading ? (
                  <div className="p-8 text-center text-surface-400">Loading attendance data...</div>
                ) : !selectedReportMeeting.attendance || selectedReportMeeting.attendance.length === 0 ? (
                  <div className="p-6 text-center text-surface-500 bg-surface-950 rounded-2xl border border-surface-800 text-xs">
                    No participants recorded yet for this session.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-950">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-900 border-b border-surface-800 text-surface-400 uppercase font-semibold text-[10px]">
                        <tr>
                          <th className="p-3">Participant</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Joined At</th>
                          <th className="p-3">Ratio %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-800/60 text-surface-300">
                        {selectedReportMeeting.attendance.map((a, i) => (
                          <tr key={i} className="hover:bg-surface-900/40">
                            <td className="p-3 font-semibold text-surface-100">{a.name}</td>
                            <td className="p-3 uppercase text-[10px] text-surface-400">{a.role}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                a.status === 'present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-surface-800 text-surface-400'
                              }`}>
                                {a.status}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[11px]">
                              {a.joinTime ? new Date(a.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </td>
                            <td className="p-3 font-mono font-bold text-emerald-400">
                              {a.attendancePercentage || 100}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

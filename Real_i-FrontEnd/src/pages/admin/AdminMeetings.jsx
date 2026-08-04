import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, Plus, Play, Calendar, Clock, Search, 
  Users, MoreVertical, X, CheckCircle, Radio, BarChart, Edit3, Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api, getCourses } from '@/services/api';
import Select from '@/components/common/Select';

export default function AdminMeetings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [roomName, setRoomName] = useState('');
  const [duration, setDuration] = useState(60);
  const [scheduleType, setScheduleType] = useState('immediate');
  const [scheduledFor, setScheduledFor] = useState('');
  
  // New Enterprise Fields
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [lobbyEnabled, setLobbyEnabled] = useState(false);
  const [autoRecord, setAutoRecord] = useState(false);
  const [courses, setCourses] = useState([]);
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
      const response = await api.get('/meetings');
      if (response.success) {
        setMeetings(response.meetings);
      }
    } catch (err) {
      console.error('Failed to fetch meetings', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRoomName = () => {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REAL_i-${randomStr}`;
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalRoomName = roomName || generateRoomName();
      // Prefix with REAL_i- if user typed custom but didn't include it
      const formattedRoomName = finalRoomName.startsWith('REAL_i-') ? finalRoomName : `REAL_i-${finalRoomName}`;
      
      const body = {
        title,
        roomName: formattedRoomName,
        expectedDurationMinutes: parseInt(duration, 10),
        status: scheduleType === 'immediate' ? 'live' : 'scheduled',
        scheduledFor: scheduleType === 'scheduled' && scheduledFor ? scheduledFor : undefined,
        description,
        courseId: courseId || undefined,
        lobbyEnabled,
        autoRecord
      };
      
      let response;
      if (editingMeetingId) {
        response = await api.put(`/meetings/${editingMeetingId}`, body);
      } else {
        response = await api.post('/meetings', body);
      }
      
      if (response.success) {
        setShowCreateModal(false);
        setTitle('');
        setRoomName('');
        setDuration(60);
        setScheduleType('immediate');
        setScheduledFor('');
        setDescription('');
        setCourseId('');
        setLobbyEnabled(false);
        setAutoRecord(false);
        setEditingMeetingId(null);
        fetchMeetings();

        if (scheduleType === 'immediate') {
          navigate(`/admin/live?roomName=${encodeURIComponent(formattedRoomName)}`);
        }
      }
    } catch (err) {
      console.error('Failed to create/update meeting', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (meeting) => {
    setEditingMeetingId(meeting._id);
    setTitle(meeting.title || '');
    setRoomName(meeting.roomName ? meeting.roomName.replace(/^REAL_i-/, '') : '');
    setDuration(meeting.expectedDurationMinutes || 60);
    setDescription(meeting.description || '');
    setCourseId(meeting.courseId || '');
    setLobbyEnabled(!!meeting.lobbyEnabled);
    setAutoRecord(!!meeting.autoRecord);
    setScheduleType(meeting.status === 'scheduled' ? 'scheduled' : 'immediate');
    
    if (meeting.scheduledFor) {
      // Format date for datetime-local input
      const date = new Date(meeting.scheduledFor);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      setScheduledFor(date.toISOString().slice(0, 16));
    } else {
      setScheduledFor('');
    }
    
    setShowCreateModal(true);
  };

  const handleDelete = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) return;
    try {
      const response = await api.delete(`/meetings/${meetingId}`);
      if (response.success) {
        setMeetings(prev => prev.filter(m => m._id !== meetingId));
      }
    } catch (err) {
      console.error('Failed to delete meeting', err);
      alert('Failed to delete the session. Please try again.');
    }
  };

  const handleLaunchMeeting = async (meeting) => {
    if (meeting.status === 'scheduled') {
      try {
        await api.put(`/meetings/${meeting._id}/launch`);
      } catch (err) {
        console.error('Failed to launch meeting', err);
      }
    }
    // Navigate to the live page with the room name
    navigate(`/admin/live?roomName=${encodeURIComponent(meeting.roomName)}`);
  };

  const viewReport = (meeting) => {
    alert(`Analytics report for "${meeting.title}" will be generated soon. This will include attendance tracking, engagement metrics, and session recordings.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Live Classes & Meetings</h1>
          <p className="text-sm text-surface-400">Manage, schedule, and launch your virtual classrooms</p>
        </div>
        <button 
          onClick={() => {
            setEditingMeetingId(null);
            setTitle('');
            setRoomName('');
            setDuration(60);
            setScheduleType('immediate');
            setScheduledFor('');
            setDescription('');
            setCourseId('');
            setLobbyEnabled(false);
            setAutoRecord(false);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Schedule Session</span>
        </button>
      </div>

      {/* Meetings List */}
      <div className="glass-card rounded-2xl bg-surface-900/60 border border-surface-700/50 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-surface-700/50 bg-surface-900/30">
          <h2 className="font-bold text-surface-50">All Sessions</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input 
              type="text" 
              placeholder="Search meetings..." 
              className="pl-9 pr-4 py-2 bg-surface-950/50 border border-surface-700/50 rounded-lg text-sm focus:outline-none focus:border-primary-500/50 text-surface-50 w-64 transition-colors"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-surface-400">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 mx-auto bg-surface-800 rounded-full flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-surface-500" />
            </div>
            <h3 className="text-xl font-bold text-surface-50 mb-2">No meetings yet</h3>
            <p className="text-surface-400 mb-6">Schedule your first live session to get started with live interactions.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-surface-800 hover:bg-surface-700 text-surface-50 border border-surface-600 rounded-lg font-medium transition-colors"
            >
              Create Meeting
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-950/30 border-b border-surface-700/50 text-xs uppercase tracking-wider text-surface-400">
                  <th className="p-5 font-bold">Session Title</th>
                  <th className="p-5 font-bold">Room Name</th>
                  <th className="p-5 font-bold">Status</th>
                  <th className="p-5 font-bold">Date</th>
                  <th className="p-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {meetings.map(meeting => (
                  <tr key={meeting._id} className="hover:bg-surface-800/40 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-[4px] flex items-center justify-center border ${
                          meeting.status === 'live' ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30' : 
                          meeting.status === 'scheduled' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' : 
                          'bg-surface-800 text-surface-400 border-surface-700'
                        }`}>
                          {meeting.status === 'live' ? <Radio className="w-5 h-5 animate-pulse" /> : <Video className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-bold text-surface-50 text-base">{meeting.title}</div>
                          <div className="text-xs text-surface-400 flex items-center gap-1.5 mt-1">
                            <Clock className="w-3 h-3" /> {meeting.expectedDurationMinutes} mins
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-surface-950 border border-surface-800 text-surface-300 shadow-inner">
                        {meeting.roomName}
                      </span>
                    </td>
                    <td className="p-5">
                      {meeting.status === 'live' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-bold bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
                          Live Now
                        </span>
                      )}
                      {meeting.status === 'scheduled' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20">
                          <Calendar className="w-3.5 h-3.5" />
                          Scheduled
                        </span>
                      )}
                      {meeting.status === 'ended' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-800 text-surface-400 border border-surface-700">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-sm text-surface-400 font-medium">
                      {new Date(meeting.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {meeting.status === 'scheduled' && (
                          <>
                            <button 
                              onClick={() => handleLaunchMeeting(meeting)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/90 hover:bg-primary-500 text-surface-50 rounded-lg text-sm font-bold transition-colors shadow-lg"
                            >
                              <Play className="w-4 h-4" />
                              Launch
                            </button>
                            <button
                              onClick={() => handleEdit(meeting)}
                              className="p-2 text-surface-400 hover:text-primary-400 rounded-lg hover:bg-primary-500/10 transition-colors"
                              title="Edit Session"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {meeting.status === 'live' && (
                          <button 
                            onClick={() => handleLaunchMeeting(meeting)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-transparent text-[#22c55e] border border-[#22c55e] hover:bg-[#22c55e]/10 rounded-[4px] text-sm font-bold transition-colors animate-pulse-soft"
                          >
                            <Play className="w-4 h-4" />
                            Join Live
                          </button>
                        )}
                        {meeting.status === 'ended' && (
                          <button 
                            onClick={() => viewReport(meeting)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-50 border border-surface-700 rounded-lg text-sm font-bold transition-colors shadow-sm"
                          >
                            <BarChart className="w-4 h-4 text-primary-400" />
                            View Report
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(meeting._id)}
                          className="p-2 text-surface-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors ml-2"
                          title="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-surface-700/50 transform transition-all">
            <div className="flex items-center justify-between p-5 border-b border-surface-800 bg-surface-950/30 shrink-0">
              <h3 className="text-xl font-bold text-surface-50">
                {editingMeetingId ? 'Edit Session' : 'Schedule New Session'}
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-surface-400 hover:text-surface-50 rounded-full hover:bg-surface-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateMeeting} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-sm font-bold text-surface-300 mb-2">
                  Session Title <span className="text-primary-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Advanced AI Integration Workshop"
                  className="w-full px-4 py-3 bg-surface-950 border border-surface-700 rounded-xl focus:outline-none focus:border-primary-500 text-surface-50 placeholder-surface-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-surface-300 mb-2">
                  Agenda / Description <span className="text-surface-500 font-normal">(Optional)</span>
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will this session cover?"
                  rows={2}
                  className="w-full px-4 py-3 bg-surface-950 border border-surface-700 rounded-xl focus:outline-none focus:border-primary-500 text-surface-50 placeholder-surface-500 transition-colors resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-surface-300 mb-2">
                  Link to Course <span className="text-surface-500 font-normal">(Optional)</span>
                </label>
                <Select
                  value={courseId}
                  onChange={setCourseId}
                  className="w-full"
                  placeholder="Select a course..."
                  options={[
                    { value: '', label: 'None (Standalone Session)' },
                    ...courses.map(c => ({ value: c.id || c._id, label: c.title }))
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-surface-300 mb-2">
                  Custom Room URL <span className="text-surface-500 font-normal">(Optional)</span>
                </label>
                <div className="flex group focus-within:border-primary-500">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-surface-700 bg-surface-800 text-surface-400 text-sm font-mono transition-colors group-focus-within:border-primary-500 group-focus-within:bg-surface-900 group-focus-within:text-surface-300">
                    REAL_i-
                  </span>
                  <input 
                    type="text" 
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value.replace(/\s+/g, '-'))}
                    placeholder="Auto-generated"
                    className="flex-1 px-4 py-3 bg-surface-950 border border-surface-700 rounded-r-xl focus:outline-none focus:border-primary-500 text-surface-50 placeholder-surface-600 transition-colors"
                  />
                </div>
                <p className="mt-1.5 text-xs text-surface-500">Only letters, numbers, and dashes allowed.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-surface-300 mb-2">
                    Timing
                  </label>
                  <Select
                    value={scheduleType}
                    onChange={setScheduleType}
                    className="w-full"
                    options={[
                      { value: 'immediate', label: 'Start Immediately' },
                      { value: 'scheduled', label: 'Schedule for Later' }
                    ]}
                  />
                </div>
                {scheduleType === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-bold text-surface-300 mb-2">
                      Start Date & Time
                    </label>
                    <input 
                      type="datetime-local" 
                      required={scheduleType === 'scheduled'}
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="w-full px-4 py-[11px] bg-surface-950 border border-surface-700 rounded-xl focus:outline-none focus:border-primary-500 text-surface-50 transition-colors"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-surface-300 mb-2">
                  Expected Duration
                </label>
                <Select
                  value={duration}
                  onChange={setDuration}
                  className="w-full"
                  options={[
                    { value: '30', label: '30 Minutes' },
                    { value: '45', label: '45 Minutes' },
                    { value: '60', label: '60 Minutes (1 Hour)' },
                    { value: '90', label: '90 Minutes (1.5 Hours)' },
                    { value: '120', label: '120 Minutes (2 Hours)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div 
                  onClick={() => setLobbyEnabled(!lobbyEnabled)}
                  className="flex items-center justify-between p-4 rounded-xl border border-surface-700 bg-surface-950/50 hover:border-primary-500/30 transition-colors cursor-pointer group"
                >
                  <div>
                    <div className="text-sm font-bold text-surface-50 mb-0.5">Enable Lobby</div>
                    <div className="text-xs text-surface-500">Admit attendees manually</div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={lobbyEnabled}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      lobbyEnabled ? 'bg-primary-500' : 'bg-surface-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        lobbyEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div 
                  onClick={() => setAutoRecord(!autoRecord)}
                  className="flex items-center justify-between p-4 rounded-xl border border-surface-700 bg-surface-950/50 hover:border-primary-500/30 transition-colors cursor-pointer group"
                >
                  <div>
                    <div className="text-sm font-bold text-surface-50 mb-0.5">Auto-Record</div>
                    <div className="text-xs text-surface-500">Record when host joins</div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoRecord}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      autoRecord ? 'bg-primary-500' : 'bg-surface-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        autoRecord ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-surface-800 hover:bg-surface-700 text-surface-50 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      {editingMeetingId ? 'Save Changes' : 'Create Session'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, Plus, Play, Calendar, Clock, Search, 
  Users, MoreVertical, X, CheckCircle, Radio
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/api/meetings');
      if (response.data.success) {
        setMeetings(response.data.meetings);
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
      
      const response = await api.post('/api/meetings', {
        title,
        roomName: formattedRoomName,
        expectedDurationMinutes: parseInt(duration, 10)
      });
      
      if (response.data.success) {
        setShowCreateModal(false);
        setTitle('');
        setRoomName('');
        setDuration(60);
        fetchMeetings();
      }
    } catch (err) {
      console.error('Failed to create meeting', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaunchMeeting = async (meeting) => {
    if (meeting.status === 'scheduled') {
      try {
        await api.put(`/api/meetings/${meeting._id}/launch`);
      } catch (err) {
        console.error('Failed to launch meeting', err);
      }
    }
    // Navigate to the live page with the room name
    navigate(`/admin/live?roomName=${encodeURIComponent(meeting.roomName)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Classes & Meetings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage, schedule, and launch your virtual classrooms</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>New Meeting</span>
        </button>
      </div>

      {/* Meetings List */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 dark:text-white">All Sessions</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search meetings..." 
              className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No meetings yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first virtual classroom to get started.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-lg font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
            >
              Create Meeting
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-dark-border text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="p-4 font-medium">Session Title</th>
                  <th className="p-4 font-medium">Room Name</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {meetings.map(meeting => (
                  <tr key={meeting._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          meeting.status === 'live' ? 'bg-red-100 text-red-600 dark:bg-red-900/20' : 
                          meeting.status === 'scheduled' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20' : 
                          'bg-gray-100 text-gray-500 dark:bg-gray-800'
                        }`}>
                          {meeting.status === 'live' ? <Radio className="w-5 h-5 animate-pulse" /> : <Video className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{meeting.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {meeting.expectedDurationMinutes} mins
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {meeting.roomName}
                      </span>
                    </td>
                    <td className="p-4">
                      {meeting.status === 'live' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                          Live Now
                        </span>
                      )}
                      {meeting.status === 'scheduled' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                          <Calendar className="w-3 h-3" />
                          Scheduled
                        </span>
                      )}
                      {meeting.status === 'ended' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(meeting.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {(meeting.status === 'scheduled' || meeting.status === 'live') ? (
                        <button 
                          onClick={() => handleLaunchMeeting(meeting)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                          <Play className="w-4 h-4" />
                          {meeting.status === 'live' ? 'Join Live' : 'Launch'}
                        </button>
                      ) : (
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule New Session</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateMeeting} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Session Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Advanced AI Integration Workshop"
                  className="w-full px-4 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custom Room URL (Optional)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                    REAL_i-
                  </span>
                  <input 
                    type="text" 
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value.replace(/\s+/g, '-'))}
                    placeholder="Leave empty for auto-generation"
                    className="flex-1 px-4 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Only letters, numbers, and dashes allowed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expected Duration (Minutes)
                </label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                >
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes (1 Hour)</option>
                  <option value="90">90 Minutes (1.5 Hours)</option>
                  <option value="120">120 Minutes (2 Hours)</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Create Session
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

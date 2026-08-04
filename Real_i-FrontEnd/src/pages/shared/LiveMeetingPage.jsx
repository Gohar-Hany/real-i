import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Video, Shield, Users, Copy, Check, ExternalLink, RefreshCw, 
  Sparkles, Monitor, MessageSquare, Hand, PenTool, CheckCircle2,
  Lock, Settings, Info, Radio, Zap, Globe, Layers, Eye, MicOff,
  UserCheck, UserX, Download, Clock, Play, Square, UserPlus, AlertCircle,
  FileSpreadsheet, X, Search, ChevronRight, User, Key, HelpCircle, BarChart2,
  Send, Percent
} from 'lucide-react';

const QUICK_ROOM_PRESETS = [
  'REAL_i-Physics-101',
  'REAL_i-AI-Workshop',
  'REAL_i-Math-Seminar'
];

const DEFAULT_POLL_PRESETS = [
  {
    question: "Do you understand the core WebRTC SFU concept explained so far?",
    options: ["Yes, 100% clear!", "Need another quick example", "A bit confusing", "Haven't followed yet"]
  },
  {
    question: "Which feature should we test next in the virtual classroom?",
    options: ["Excalidraw Whiteboard", "Screen Sharing Demo", "Breakout Rooms", "AI Audio Subtitles"]
  }
];

export default function LiveMeetingPage() {
  const { user } = useAuth();
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);

  // ── STRICT AUTHENTICATION & AUTHORIZATION BINDING ─────────
  const isAdmin = user?.role === 'admin';
  const isInstructor = isAdmin;

  const [searchParams] = useSearchParams();
  const initialRoom = searchParams.get('roomName') || 'REAL_i-Demo-Classroom';

  // Room state
  const [roomNameInput, setRoomNameInput] = useState(initialRoom);
  const [activeRoom, setActiveRoom] = useState(initialRoom);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);

  // Moderator & Meeting Controls State
  const [isLobbyEnabled, setIsLobbyEnabled] = useState(false);
  const [pendingKnockers, setPendingKnockers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showAttendanceDrawer, setShowAttendanceDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Live Attendance State
  const [attendanceList, setAttendanceList] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');

  // ── IN-CLASS LIVE POLLS OVERLAY STATE ───────────────────────
  const [activePoll, setActivePoll] = useState(null); // { pollId, question, options: [{optionId, text, votes}], timerSeconds }
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [pollQuestionInput, setPollQuestionInput] = useState('');
  const [pollOptionsInput, setPollOptionsInput] = useState(['', '', '', '']);
  const [pollTimerSeconds, setPollTimerSeconds] = useState(45);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [pollTimeRemaining, setPollTimeRemaining] = useState(0);

  // Toast Helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Jitsi External API Script dynamically
  useEffect(() => {
    const scriptId = 'jitsi-external-api-script';
    
    if (window.JitsiMeetExternalAPI) {
      setJitsiLoaded(true);
      return;
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => {
        setJitsiLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Jitsi API script');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    }
  }, []);

  // Initialize Jitsi meeting
  useEffect(() => {
    if (!jitsiLoaded || !jitsiContainerRef.current) return;

    setIsLoading(true);
    setPendingKnockers([]);

    // Clean up previous instance
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }

    const domain = 'meet.jit.si';
    const localUserName = user?.name 
      ? `${user.name} (${isAdmin ? 'Instructor' : 'Student'})`
      : isAdmin ? 'Instructor (REAL_i Admin)' : 'Student Participant';

    // Seed local user into attendance list
    const initialLocalUser = {
      id: 'local-user',
      name: localUserName,
      role: isAdmin ? 'instructor' : 'student',
      joinTime: new Date().toLocaleTimeString(),
      joinTimestamp: Date.now(),
      leaveTime: null,
      durationSeconds: 0,
      attendancePercentage: 100,
      status: 'present'
    };
    setAttendanceList([initialLocalUser]);

    const instructorToolbar = [
      'microphone', 'camera', 'closedcaptions', 'desktop', 'embedmeeting',
      'fullscreen', 'hangup', 'chat', 'raisehand',
      'videoquality', 'filmstrip', 'tileview', 'whiteboard',
      'recording', 'participants-pane', 'sharetiles'
    ];

    const studentToolbar = [
      'microphone', 'camera', 'closedcaptions', 'fullscreen',
      'hangup', 'chat', 'raisehand', 'tileview', 'whiteboard'
    ];

    const options = {
      roomName: activeRoom,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: localUserName,
        email: user?.email || 'demo@reali.com'
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        enableWelcomePage: false,
        toolbarButtons: isAdmin ? instructorToolbar : studentToolbar,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#090d16',
        TOOLBAR_ALWAYS_VISIBLE: true,
        MOBILE_APP_PROMO: false
      }
    };

    try {
      const api = new window.JitsiMeetExternalAPI(domain, options);
      apiRef.current = api;

      api.addEventListener('videoConferenceJoined', () => {
        setIsLoading(false);
      });

      api.addEventListener('participantJoined', (participant) => {
        const pName = participant.displayName || `Student (${participant.id.substring(0, 4)})`;
        setAttendanceList(prev => {
          const exists = prev.find(p => p.id === participant.id);
          if (exists) {
            return prev.map(p => p.id === participant.id ? { ...p, status: 'present', leaveTime: null } : p);
          }
          return [...prev, {
            id: participant.id,
            name: pName,
            role: 'student',
            joinTime: new Date().toLocaleTimeString(),
            joinTimestamp: Date.now(),
            leaveTime: null,
            durationSeconds: 0,
            attendancePercentage: 100,
            status: 'present'
          }];
        });
        triggerToast(`Student joined: ${pName}`);
      });

      api.addEventListener('participantLeft', (participant) => {
        setAttendanceList(prev => prev.map(p => {
          if (p.id === participant.id) {
            const duration = p.joinTimestamp ? Math.round((Date.now() - p.joinTimestamp) / 1000) : 0;
            return {
              ...p,
              status: 'left',
              leaveTime: new Date().toLocaleTimeString(),
              durationSeconds: duration
            };
          }
          return p;
        }));
      });

      if (isAdmin) {
        api.addEventListener('knockingParticipant', (data) => {
          setPendingKnockers(prev => {
            if (prev.find(k => k.id === data.id)) return prev;
            return [...prev, { id: data.id, name: data.name || 'Student Waiting' }];
          });
          triggerToast(`Lobby alert: ${data.name || 'Student'} is waiting for approval`);
        });
      }

      api.addEventListener('recordingStatusChanged', (data) => {
        setIsRecording(data.on);
      });

      const timer = setTimeout(() => setIsLoading(false), 1800);

      return () => clearTimeout(timer);
    } catch (err) {
      console.error('Error initializing Jitsi Meet:', err);
      setIsLoading(false);
    }
  }, [jitsiLoaded, activeRoom, isAdmin, user]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, []);

  // Update session durations & attendance % periodically + auto-sync to MongoDB
  useEffect(() => {
    const expectedSessionSeconds = 60 * 60; // 60 mins default session

    const interval = setInterval(() => {
      setAttendanceList(prev => {
        const updated = prev.map(p => {
          if (p.status === 'present' && p.joinTimestamp) {
            const secs = Math.round((Date.now() - p.joinTimestamp) / 1000);
            const percentage = Math.min(100, Math.round((secs / expectedSessionSeconds) * 100));
            return {
              ...p,
              durationSeconds: secs,
              attendancePercentage: percentage
            };
          }
          return p;
        });

        // Background Auto-sync to MongoDB
        try {
          fetch('/api/v1/meetings/attendance/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomName: activeRoom,
              attendanceList: updated
            })
          }).catch(() => {});
        } catch (e) {}

        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeRoom]);

  // Poll timer countdown effect
  useEffect(() => {
    if (!activePoll || pollTimeRemaining <= 0) return;
    const timer = setInterval(() => {
      setPollTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activePoll, pollTimeRemaining]);

  // ── MODERATOR ACTIONS ──────────────────────────────────────

  const handleMuteEveryone = () => {
    if (!isAdmin) return;
    if (apiRef.current) {
      apiRef.current.executeCommand('muteEveryone');
      triggerToast('Muted audio for all participants in the room');
    }
  };

  const handleToggleLobby = () => {
    if (!isAdmin) return;
    if (apiRef.current) {
      const nextState = !isLobbyEnabled;
      apiRef.current.executeCommand('toggleLobby', nextState);
      setIsLobbyEnabled(nextState);
      triggerToast(nextState ? 'Lobby Waiting Room ENABLED' : 'Lobby Waiting Room DISABLED');
    }
  };

  const handleApproveAccess = (knockerId) => {
    if (!isAdmin) return;
    if (apiRef.current) {
      apiRef.current.executeCommand('approveAccess', knockerId);
      setPendingKnockers(prev => prev.filter(k => k.id !== knockerId));
      triggerToast('Student approved into meeting room');
    }
  };

  const handleDenyAccess = (knockerId) => {
    if (!isAdmin) return;
    if (apiRef.current) {
      apiRef.current.executeCommand('denyAccess', knockerId);
      setPendingKnockers(prev => prev.filter(k => k.id !== knockerId));
      triggerToast('Student entry request denied');
    }
  };

  const handleToggleRecording = () => {
    if (!isAdmin) return;
    if (apiRef.current) {
      if (!isRecording) {
        apiRef.current.executeCommand('startRecording', { mode: 'file' });
        triggerToast('Lecture recording started');
      } else {
        apiRef.current.executeCommand('stopRecording', 'file');
        triggerToast('Lecture recording stopped');
      }
    }
  };

  const handleKickParticipant = (participantId) => {
    if (!isAdmin) return;
    if (apiRef.current) {
      apiRef.current.executeCommand('kickParticipant', participantId);
      triggerToast('Participant removed from session');
    }
  };

  // ── LIVE POLL ACTIONS ──────────────────────────────────────

  const handleCreatePollSubmit = (e) => {
    e.preventDefault();
    const validOptions = pollOptionsInput.filter(o => o.trim() !== '');
    if (!pollQuestionInput.trim() || validOptions.length < 2) {
      triggerToast('Please provide a question and at least 2 options');
      return;
    }

    const createdPoll = {
      pollId: `poll-${Date.now()}`,
      question: pollQuestionInput,
      options: validOptions.map((text, i) => ({ optionId: `opt-${i + 1}`, text, votes: 0 })),
      timerSeconds: pollTimerSeconds
    };

    setActivePoll(createdPoll);
    setPollTimeRemaining(pollTimerSeconds);
    setHasVoted(false);
    setSelectedOptionId(null);
    setShowCreatePollModal(false);
    triggerToast('Live In-Class Poll broadcasted to all students!');
  };

  const handleSelectPresetPoll = (preset) => {
    setPollQuestionInput(preset.question);
    setPollOptionsInput(preset.options);
  };

  const handleStudentVote = (optionId) => {
    if (hasVoted || !activePoll) return;
    setSelectedOptionId(optionId);
    setHasVoted(true);

    setActivePoll(prev => ({
      ...prev,
      options: prev.options.map(o => o.optionId === optionId ? { ...o, votes: o.votes + 1 } : o)
    }));

    triggerToast('Your response has been submitted!');
  };

  const handleClosePoll = () => {
    setActivePoll(null);
    triggerToast('Live Poll session ended');
  };

  // ── ROOM ACTIONS ──────────────────────────────────────────

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const formatted = roomNameInput.trim().replace(/\s+/g, '-');
    if (formatted) {
      setActiveRoom(formatted);
    }
  };

  const handlePresetSelect = (preset) => {
    setRoomNameInput(preset);
    setActiveRoom(preset);
  };

  const handleCopyLink = () => {
    const directJitsiUrl = `https://meet.jit.si/${activeRoom}`;
    navigator.clipboard.writeText(directJitsiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatSeconds = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handleExportCSV = () => {
    const headers = ['Participant Name', 'Role', 'Status', 'Join Time', 'Leave Time', 'Duration', 'Attendance %'];
    const rows = attendanceList.map(a => [
      `"${a.name}"`,
      a.role,
      a.status,
      a.joinTime || 'N/A',
      a.leaveTime || 'N/A',
      `"${formatSeconds(a.durationSeconds)}"`,
      `"${a.attendancePercentage}%"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${activeRoom}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Attendance report exported to CSV!');
  };

  const filteredAttendance = attendanceList.filter(a => 
    a.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const presentCount = attendanceList.filter(a => a.status === 'present').length;
  const totalPollVotes = activePoll ? activePoll.options.reduce((sum, o) => sum + o.votes, 0) : 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-900/95 text-surface-100 border border-primary-500/40 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-lg animate-bounce">
          <Sparkles size={16} className="text-primary-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-900 via-surface-900/90 to-primary-950/40 border border-surface-800/80 p-6 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-12 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE CLASSROOM SESSION
              </span>
              {isRecording && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                  <Square size={10} className="fill-rose-400" />
                  RECORDING IN PROGRESS
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs text-surface-300 bg-surface-800/70 px-3 py-1 rounded-full border border-surface-700/50">
                <Users size={13} className="text-primary-400" />
                {presentCount} Active Attendees
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gradient font-heading tracking-tight">
              Virtual Classroom & Attendance Engine
            </h1>
            <p className="text-sm text-surface-400 mt-1 max-w-2xl leading-relaxed">
              Enterprise WebRTC suite with automated attendance tracking, instructor moderator controls, and cloud lecture recording.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Attendance Drawer Trigger Button */}
            <button
              onClick={() => setShowAttendanceDrawer(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary-600/20 hover:bg-primary-600/30 text-primary-300 border border-primary-500/40 transition-all hover:scale-[1.02] shadow-md active:scale-95"
            >
              <FileSpreadsheet size={16} />
              <span>Attendance Log ({attendanceList.length})</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-surface-800/80 hover:bg-surface-700 text-surface-100 border border-surface-700/80 transition-all hover:scale-[1.02] shadow-md active:scale-95"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── INSTRUCTOR MODERATOR CONTROL CENTER (ADMIN ONLY) ── */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-surface-900 via-surface-900/95 to-surface-900 border border-primary-500/30 p-4 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-primary-400 uppercase tracking-wider">
              <Shield size={16} className="text-amber-400" />
              <span>Instructor Moderator Control Center</span>
            </div>
            <span className="text-xs text-surface-400">
              Session Moderator: <strong className="text-surface-200">{user?.name || 'Instructor'}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Action: Launch Live Poll */}
            <button
              onClick={() => setShowCreatePollModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40 transition-all active:scale-95 shadow-sm"
            >
              <HelpCircle size={15} />
              <span>Launch Live Poll</span>
            </button>

            {/* Action 1: Mute Everyone */}
            <button
              onClick={handleMuteEveryone}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 transition-all active:scale-95 shadow-sm"
              title="Mute audio for all participants in the meeting"
            >
              <MicOff size={15} />
              <span>Mute Everyone</span>
            </button>

            {/* Action 2: Lobby Waiting Room Toggle */}
            <button
              onClick={handleToggleLobby}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 shadow-sm ${
                isLobbyEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-surface-800/80 hover:bg-surface-700 text-surface-300 border-surface-700'
              }`}
            >
              <Lock size={15} />
              <span>Lobby Waiting Room: {isLobbyEnabled ? 'ENABLED' : 'DISABLED'}</span>
            </button>

            {/* Action 3: Cloud Lecture Recording Toggle */}
            <button
              onClick={handleToggleRecording}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 shadow-sm ${
                isRecording
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                  : 'bg-surface-800/80 hover:bg-surface-700 text-surface-300 border-surface-700'
              }`}
            >
              <Radio size={15} />
              <span>{isRecording ? 'Stop Recording' : 'Start Lecture Recording'}</span>
            </button>

            {/* Action 4: Export Attendance CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-all active:scale-95 shadow-sm"
            >
              <Download size={15} />
              <span>Export Attendance CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Lobby Approval Request Banner (ADMIN ONLY) */}
      {isAdmin && pendingKnockers.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <UserPlus size={20} className="text-amber-400" />
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                {pendingKnockers.length} Student(s) Waiting in Lobby
              </h4>
              <p className="text-xs text-surface-300">
                Approve or deny access for students requesting entry to this live lecture.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingKnockers.map(knocker => (
              <div key={knocker.id} className="flex items-center gap-2 bg-surface-900 px-3 py-1.5 rounded-xl border border-surface-700">
                <span className="text-xs font-medium text-surface-200">{knocker.name}</span>
                <button
                  onClick={() => handleApproveAccess(knocker.id)}
                  className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  title="Approve student entry"
                >
                  <UserCheck size={14} />
                </button>
                <button
                  onClick={() => handleDenyAccess(knocker.id)}
                  className="p-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                  title="Deny student entry"
                >
                  <UserX size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Bar: Room Switcher & Auth Identity Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Room Switch Form */}
        <div className="md:col-span-8 flex flex-col justify-between bg-surface-900/80 backdrop-blur-md p-3 rounded-2xl border border-surface-800 shadow-lg space-y-3">
          <form onSubmit={handleJoinRoom} className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2 text-surface-400 shrink-0">
              <Video size={18} className="text-primary-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-300">Room Name:</span>
            </div>
            <input
              type="text"
              value={roomNameInput}
              onChange={(e) => setRoomNameInput(e.target.value)}
              placeholder="Enter room name..."
              className="flex-1 bg-surface-950/90 border border-surface-800 rounded-xl px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-all shadow-md shadow-primary-950/30 shrink-0 flex items-center gap-1.5 active:scale-95"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>Update Room</span>
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-surface-400 font-medium">Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ROOM_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetSelect(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                    activeRoom === preset
                      ? 'bg-primary-500/20 text-primary-300 border-primary-500/40'
                      : 'bg-surface-950 text-surface-400 border-surface-800 hover:text-surface-200 hover:border-surface-700'
                  }`}
                >
                  {preset.replace('REAL_i-', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STRICT AUTHENTICATED IDENTITY & AUTHORIZATION PANEL */}
        <div className="md:col-span-4 flex flex-col justify-between bg-surface-900/80 backdrop-blur-md p-3 rounded-2xl border border-surface-800 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-surface-300">
              <Key size={15} className="text-primary-400" />
              <span>Authenticated Role:</span>
            </div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
              isAdmin 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}>
              {isAdmin ? <Shield size={12} /> : <User size={12} />}
              {isAdmin ? 'Instructor / Admin' : 'Student'}
            </span>
          </div>

          <div className="bg-surface-950 p-2.5 rounded-xl border border-surface-800 mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <span className="block text-xs font-semibold text-surface-200 leading-tight">
                  {user?.name || 'User Session'}
                </span>
                <span className="text-[10px] text-surface-400">
                  {user?.email || 'authenticated'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
              <Lock size={11} />
              <span>RBAC Enforced</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN JITSI CONTAINER + LIVE POLL OVERLAY ── */}
      <div className="relative rounded-2xl overflow-hidden bg-surface-950 border border-surface-800/90 shadow-2xl h-[72vh] min-h-[520px]">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-950/95 backdrop-blur-md transition-opacity duration-300">
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-14 h-14 rounded-full border-3 border-primary-500/30 border-t-primary-500 animate-spin" />
              <Video size={22} className="absolute text-primary-400 animate-pulse" />
            </div>
            <p className="text-base font-semibold text-surface-200">
              Initializing Virtual Classroom...
            </p>
            <p className="text-xs text-surface-400 mt-1 font-mono">
              Room: <span className="text-primary-400 font-semibold">{activeRoom}</span>
            </p>
          </div>
        )}

        {/* ── IN-CLASS LIVE POLL OVERLAY (STUDENT & INSTRUCTOR VIEW) ── */}
        {activePoll && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-md bg-surface-900/95 backdrop-blur-xl border border-violet-500/40 p-5 rounded-2xl shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-violet-500/20 text-violet-300">
                  <HelpCircle size={16} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                  In-Class Live Poll
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-950 border border-surface-800 text-xs font-mono text-amber-400">
                  <Clock size={12} />
                  <span>00:{pollTimeRemaining < 10 ? '0' : ''}{pollTimeRemaining}s</span>
                </div>
                {isAdmin && (
                  <button
                    onClick={handleClosePoll}
                    className="text-surface-400 hover:text-surface-200"
                    title="Close Poll"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <h3 className="text-sm font-bold text-surface-100 mb-3 leading-snug">
              {activePoll.question}
            </h3>

            {/* Poll Options */}
            <div className="space-y-2">
              {activePoll.options.map(option => {
                const votePercentage = totalPollVotes > 0 ? Math.round((option.votes / totalPollVotes) * 100) : 0;
                const isSelected = selectedOptionId === option.optionId;

                return (
                  <button
                    key={option.optionId}
                    disabled={hasVoted}
                    onClick={() => handleStudentVote(option.optionId)}
                    className={`w-full relative overflow-hidden text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-primary-500/20 text-primary-300 border-primary-500/60 shadow-md'
                        : 'bg-surface-950 text-surface-200 border-surface-800 hover:border-surface-700'
                    }`}
                  >
                    {/* Vote Percentage Progress Bar Background */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-primary-500/15 transition-all duration-500"
                      style={{ width: `${votePercentage}%` }}
                    />

                    <div className="relative z-10 flex items-center justify-between">
                      <span>{option.text}</span>
                      <div className="flex items-center gap-2">
                        {hasVoted && (
                          <span className="text-[11px] font-mono font-bold text-surface-400">
                            {votePercentage}% ({option.votes})
                          </span>
                        )}
                        {isSelected && <CheckCircle2 size={14} className="text-primary-400" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-surface-400 border-t border-surface-800/60">
              <span>{totalPollVotes} Response(s) Received</span>
              <span>{hasVoted ? '✓ Answer Submitted' : 'Click an option to vote'}</span>
            </div>
          </div>
        )}

        {/* Jitsi External Iframe Target */}
        <div ref={jitsiContainerRef} className="w-full h-full" />
      </div>

      {/* ── CREATE POLL MODAL (INSTRUCTOR ONLY) ── */}
      {showCreatePollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle size={20} className="text-violet-400" />
                <h3 className="text-lg font-bold text-surface-100 font-heading">
                  Create In-Class Live Poll
                </h3>
              </div>
              <button
                onClick={() => setShowCreatePollModal(false)}
                className="text-surface-400 hover:text-surface-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Poll Presets */}
            <div className="space-y-1.5">
              <span className="text-xs text-surface-400 font-medium">Quick Question Templates:</span>
              <div className="flex flex-col gap-1.5">
                {DEFAULT_POLL_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectPresetPoll(preset)}
                    className="text-left text-xs p-2 rounded-lg bg-surface-950 hover:bg-surface-800 text-surface-300 border border-surface-800 hover:border-surface-700 transition-colors"
                  >
                    💡 {preset.question}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreatePollSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">
                  Poll Question:
                </label>
                <input
                  type="text"
                  required
                  value={pollQuestionInput}
                  onChange={(e) => setPollQuestionInput(e.target.value)}
                  placeholder="Enter your question for the class..."
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-sm text-surface-100 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-surface-300 uppercase">
                  Options (At least 2):
                </label>
                {pollOptionsInput.map((optText, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={optText}
                    onChange={(e) => {
                      const copy = [...pollOptionsInput];
                      copy[idx] = e.target.value;
                      setPollOptionsInput(copy);
                    }}
                    placeholder={`Option ${idx + 1}...`}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-1.5 text-xs text-surface-100 focus:outline-none focus:border-primary-500"
                  />
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">
                  Countdown Timer (Seconds):
                </label>
                <select
                  value={pollTimerSeconds}
                  onChange={(e) => setPollTimerSeconds(Number(e.target.value))}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-200 focus:outline-none focus:border-primary-500"
                >
                  <option value={30}>30 Seconds</option>
                  <option value={45}>45 Seconds</option>
                  <option value={60}>60 Seconds</option>
                  <option value={90}>90 Seconds</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-surface-800">
                <button
                  type="button"
                  onClick={() => setShowCreatePollModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-surface-400 hover:text-surface-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all shadow-md"
                >
                  <Send size={14} />
                  <span>Broadcast Poll Live</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LIVE ATTENDANCE DRAWER / MODAL ── */}
      {showAttendanceDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-surface-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-surface-900 border-l border-surface-800 h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-surface-800">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={20} className="text-primary-400" />
                  <h3 className="text-lg font-bold text-surface-100 font-heading">
                    Live Session Attendance Report
                  </h3>
                </div>
                <button
                  onClick={() => setShowAttendanceDrawer(false)}
                  className="p-1 rounded-lg text-surface-400 hover:bg-surface-800 hover:text-surface-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Attendance Summary Cards */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="bg-surface-950 p-3 rounded-xl border border-surface-800 text-center">
                  <span className="text-xs text-surface-400 block font-medium">Total Attendees</span>
                  <span className="text-xl font-bold text-surface-100 font-mono mt-0.5 block">{attendanceList.length}</span>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-center">
                  <span className="text-xs text-emerald-400 block font-medium">Active Present</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">{presentCount}</span>
                </div>
                <div className="bg-surface-950 p-3 rounded-xl border border-surface-800 text-center">
                  <span className="text-xs text-surface-400 block font-medium">Left Session</span>
                  <span className="text-xl font-bold text-surface-400 font-mono mt-0.5 block">{attendanceList.length - presentCount}</span>
                </div>
              </div>

              {/* Search Filter Input */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-3 text-surface-500" />
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl pl-9 pr-4 py-2 text-sm text-surface-200 focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Attendance Table */}
              <div className="overflow-hidden rounded-xl border border-surface-800 bg-surface-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-900 border-b border-surface-800 text-surface-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Joined At</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Ratio %</th>
                      {isAdmin && <th className="p-3 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-800/60">
                    {filteredAttendance.map((student) => (
                      <tr key={student.id} className="hover:bg-surface-900/50 transition-colors">
                        <td className="p-3 font-medium text-surface-200 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-xs uppercase">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-semibold">{student.name}</span>
                            <span className="text-[10px] text-surface-500 uppercase">{student.role}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            student.status === 'present'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-surface-800 text-surface-400 border-surface-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'present' ? 'bg-emerald-400 animate-pulse' : 'bg-surface-500'}`} />
                            {student.status === 'present' ? 'Present' : 'Left'}
                          </span>
                        </td>
                        <td className="p-3 text-surface-300 font-mono">{student.joinTime}</td>
                        <td className="p-3 text-primary-400 font-mono font-semibold">{formatSeconds(student.durationSeconds)}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">
                          {student.attendancePercentage || 100}%
                        </td>
                        {isAdmin && (
                          <td className="p-3 text-right">
                            {student.status === 'present' && student.id !== 'local-user' && (
                              <button
                                onClick={() => handleKickParticipant(student.id)}
                                className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[10px] border border-rose-500/20"
                                title="Remove participant from session"
                              >
                                Kick
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Action Footer */}
            <div className="pt-4 border-t border-surface-800 flex items-center justify-between">
              <span className="text-xs text-surface-400">
                Session: <strong className="text-primary-400">{activeRoom}</strong>
              </span>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md"
              >
                <Download size={14} />
                <span>Export CSV Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Feature 1 */}
        <div className="bg-surface-900/60 p-4 rounded-xl border border-surface-800/80 flex items-start gap-3 hover:border-surface-700 transition-colors">
          <div className="p-2.5 rounded-lg bg-primary-500/10 text-primary-400 shrink-0">
            <Percent size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-200">MongoDB Auto-Sync %</h3>
            <p className="text-xs text-surface-400 mt-1 leading-relaxed">
              Auto-calculates attendance percentage & persists logs into MongoDB database.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="bg-surface-900/60 p-4 rounded-xl border border-surface-800/80 flex items-start gap-3 hover:border-surface-700 transition-colors">
          <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-400 shrink-0">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-200">In-Class Live Poll Overlay</h3>
            <p className="text-xs text-surface-400 mt-1 leading-relaxed">
              Broadcast interactive multiple-choice questions live over the video screen.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="bg-surface-900/60 p-4 rounded-xl border border-surface-800/80 flex items-start gap-3 hover:border-surface-700 transition-colors">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
            <MicOff size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-200">Mute All Controls</h3>
            <p className="text-xs text-surface-400 mt-1 leading-relaxed">
              Instant instructor override to mute audio for all active attendees.
            </p>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="bg-surface-900/60 p-4 rounded-xl border border-surface-800/80 flex items-start gap-3 hover:border-surface-700 transition-colors">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Download size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-200">CSV Report Export</h3>
            <p className="text-xs text-surface-400 mt-1 leading-relaxed">
              Download formal lecture attendance spreadsheets in one click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Video, Shield, Users, Copy, Check, ExternalLink, RefreshCw, 
  Sparkles, Monitor, MessageSquare, Hand, PenTool, CheckCircle2,
  Lock, Settings, Info, Radio, Zap, Globe, Layers, Eye, MicOff,
  UserCheck, UserX, Download, Clock, Play, Square, UserPlus, AlertCircle,
  FileSpreadsheet, X, Search, ChevronRight, User, Key, HelpCircle, BarChart2,
  Send, Percent, AlertTriangle, BookOpen, ArrowLeft
} from 'lucide-react';
import { 
  authorizeMeetingJoin, endMeeting, generateMeetingSummary, 
  syncMeetingAttendance, createMeetingPoll, voteMeetingPoll, closeMeetingPoll 
} from '@/services/api';

const DEFAULT_POLL_PRESETS = [
  {
    question: "Do you understand the core architecture pattern discussed in today's masterclass?",
    options: ["Yes, 100% crystal clear!", "Need another quick practical example", "A bit confusing, will review notes", "Haven't followed yet"]
  },
  {
    question: "Which component should we implement next during the live interactive lab?",
    options: ["Gatekeeper Authorization Tokens", "Recurrence Engine & Calendar Sync", "Real-Time AI Cognitive Synthesis", "Live WebRTC Screen Annotation"]
  }
];

export default function LiveMeetingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);

  const meetingIdParam = searchParams.get('meetingId');
  const roomSlugParam = searchParams.get('roomSlug');
  const legacyRoomName = searchParams.get('roomName');

  // Authorization & Gatekeeper State
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking', 'authorized', 'forbidden', 'waiting_host', 'error'
  const [authErrorMsg, setAuthErrorMsg] = useState('');
  const [authorizedData, setAuthorizedData] = useState(null);

  // Classroom State
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);

  // Moderator & Meeting Controls State
  const [isLobbyEnabled, setIsLobbyEnabled] = useState(false);
  const [pendingKnockers, setPendingKnockers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showAttendanceDrawer, setShowAttendanceDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Attendance & Duration State
  const [attendanceList, setAttendanceList] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');

  // In-Class Live Polls State
  const [activePoll, setActivePoll] = useState(null);
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
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── 1. GATEKEEPER AUTHORIZATION ON LOAD ───────────────────────
  useEffect(() => {
    let isMounted = true;

    const performAuthorization = async () => {
      setAuthStatus('checking');
      try {
        const cleanMeetingId = (meetingIdParam && meetingIdParam !== 'undefined' && meetingIdParam !== 'null') ? meetingIdParam : undefined;
        const cleanRoomSlug = (roomSlugParam && roomSlugParam !== 'undefined' && roomSlugParam !== 'null') ? roomSlugParam : undefined;
        const cleanRoomName = (legacyRoomName && legacyRoomName !== 'undefined' && legacyRoomName !== 'null') ? legacyRoomName : undefined;

        const payload = {
          meetingId: cleanMeetingId,
          roomSlug: cleanRoomSlug,
          roomName: cleanRoomName
        };

        const res = await authorizeMeetingJoin(payload);

        if (!isMounted) return;

        if (res.success && res.authorized) {
          setAuthorizedData(res);
          setIsLobbyEnabled(!!res.meeting?.lobbyEnabled);
          setAuthStatus('authorized');
        } else {
          setAuthStatus(res.waitingForHost ? 'waiting_host' : 'forbidden');
          setAuthErrorMsg(res.message || 'Access restricted.');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Authorization failed:', err);
        setAuthStatus('forbidden');
        setAuthErrorMsg(err.message || 'You are not authorized to access this virtual classroom.');
      }
    };

    performAuthorization();

    return () => {
      isMounted = false;
    };
  }, [meetingIdParam, roomSlugParam, legacyRoomName]);

  // ── 2. LOAD JITSI EXTERNAL API SCRIPT ────────────────────────
  useEffect(() => {
    if (authStatus !== 'authorized') return;

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
      script.onload = () => setJitsiLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Jitsi API script');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    }
  }, [authStatus]);

  // ── 3. INITIALIZE WEBRTC MEETING SESSION ──────────────────────
  useEffect(() => {
    if (authStatus !== 'authorized' || !jitsiLoaded || !jitsiContainerRef.current || !authorizedData) return;

    setIsLoading(true);
    setPendingKnockers([]);

    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }

    const isHost = authorizedData.isHost;
    const meetingInfo = authorizedData.meeting;
    const verifiedUser = authorizedData.user;
    const roomSlug = meetingInfo.roomSlug || meetingInfo.roomName || `reali_cls_${(meetingInfo.id || 'live').slice(-8)}`;

    const displayName = `${verifiedUser.name || 'User'} (${isHost ? 'Instructor' : 'Student'})`;

    // Seed local user into attendance roster
    const localRecord = {
      id: verifiedUser.id || 'local-user',
      name: verifiedUser.name || 'Self',
      email: verifiedUser.email,
      role: isHost ? 'instructor' : 'student',
      joinTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      joinTimestamp: Date.now(),
      leaveTime: null,
      durationSeconds: 0,
      attendancePercentage: 100,
      status: 'present'
    };
    setAttendanceList([localRecord]);

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
      roomName: roomSlug,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName,
        email: verifiedUser.email || 'student@reali.com'
      },
      configOverwrite: {
        startWithAudioMuted: meetingInfo.security?.muteOnEntry !== false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        enableWelcomePage: false,
        toolbarButtons: isHost ? instructorToolbar : studentToolbar,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#070D22',
        TOOLBAR_ALWAYS_VISIBLE: true,
        MOBILE_APP_PROMO: false
      }
    };

    let safetyTimer;

    try {
      const api = new window.JitsiMeetExternalAPI('meet.jit.si', options);
      apiRef.current = api;

      // Gracefully dismiss loading overlay as soon as iframe attaches (1.2s max)
      safetyTimer = setTimeout(() => {
        setIsLoading(false);
      }, 1200);

      api.addEventListener('videoConferenceJoined', () => {
        if (safetyTimer) clearTimeout(safetyTimer);
        setIsLoading(false);
      });

      api.addEventListener('cameraError', () => {
        if (safetyTimer) clearTimeout(safetyTimer);
        setIsLoading(false);
      });

      api.addEventListener('micError', () => {
        if (safetyTimer) clearTimeout(safetyTimer);
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
            joinTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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
            const durationSec = p.joinTimestamp ? Math.round((Date.now() - p.joinTimestamp) / 1000) : p.durationSeconds;
            return {
              ...p,
              status: 'left',
              leaveTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              durationSeconds: durationSec
            };
          }
          return p;
        }));
        triggerToast(`Participant left session`);
      });

      api.addEventListener('knockingParticipant', (knocker) => {
        if (isHost) {
          setPendingKnockers(prev => [...prev, { id: knocker.id, name: knocker.name || 'Waiting Student' }]);
          triggerToast(`Student waiting in lobby: ${knocker.name}`);
        }
      });

    } catch (err) {
      console.error('Error initializing WebRTC:', err);
      setIsLoading(false);
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [authStatus, jitsiLoaded, authorizedData]);

  // ── 4. AUTO-SYNC ATTENDANCE TO MONGODB ────────────────────────
  useEffect(() => {
    if (!authorizedData || !authorizedData.isHost) return;

    const interval = setInterval(() => {
      setAttendanceList(prev => {
        const updated = prev.map(p => {
          if (p.status === 'present' && p.joinTimestamp) {
            const currentDuration = Math.round((Date.now() - p.joinTimestamp) / 1000);
            return { ...p, durationSeconds: currentDuration };
          }
          return p;
        });

        // Sync with backend
        const identifier = authorizedData.meeting.roomSlug || authorizedData.meeting.roomName;
        syncMeetingAttendance({
          roomSlug: identifier,
          attendanceList: updated,
          expectedDurationMinutes: authorizedData.meeting.expectedDurationMinutes || 60
        }).catch(e => console.warn('Attendance auto-sync warning:', e.message));

        return updated;
      });
    }, 10000); // sync every 10s

    return () => clearInterval(interval);
  }, [authorizedData]);

  // ── 5. LIVE POLL COUNTDOWN TIMER ─────────────────────────────
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

  // Copy Link Handler
  const handleCopyLink = () => {
    const meetingId = authorizedData?.meeting?.id;
    const roomSlug = authorizedData?.meeting?.roomSlug;
    const shareUrl = `${window.location.origin}/student/live?meetingId=${encodeURIComponent(meetingId)}&roomSlug=${encodeURIComponent(roomSlug)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    triggerToast('Secure classroom link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Moderator: Mute Everyone
  const handleMuteEveryone = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('muteEveryone', 'audio');
      triggerToast('🔇 Muted audio for all participants.');
    }
  };

  // Moderator: Toggle Lobby
  const handleToggleLobby = () => {
    const nextState = !isLobbyEnabled;
    setIsLobbyEnabled(nextState);
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleLobby', nextState);
    }
    triggerToast(`Lobby waiting room ${nextState ? 'ENABLED' : 'DISABLED'}.`);
  };

  // Moderator: End Class & Trigger AI Summary
  const handleEndClass = async () => {
    if (!window.confirm('Are you sure you want to end this live session for all attendees?')) return;
    try {
      const meetingId = authorizedData?.meeting?.id;
      if (meetingId) {
        await endMeeting(meetingId);
        triggerToast('Session concluded. Generating AI Lecture Summary...');
        await generateMeetingSummary(meetingId);
      }
      navigate('/admin/meetings');
    } catch (err) {
      console.error('Error ending class:', err);
      navigate('/admin/meetings');
    }
  };

  // Poll: Broadcast New Poll
  const handleCreatePollSubmit = async (e) => {
    e.preventDefault();
    const cleanOptions = pollOptionsInput.filter(opt => opt.trim() !== '');
    if (cleanOptions.length < 2) {
      alert('Please provide at least 2 answer choices.');
      return;
    }

    try {
      const identifier = authorizedData.meeting.roomSlug || authorizedData.meeting.roomName;
      const res = await createMeetingPoll({
        roomSlug: identifier,
        question: pollQuestionInput,
        options: cleanOptions,
        timerSeconds: pollTimerSeconds
      });

      if (res.success && res.poll) {
        setActivePoll(res.poll);
        setPollTimeRemaining(res.poll.timerSeconds || 45);
        setHasVoted(false);
        setSelectedOptionId(null);
        setShowCreatePollModal(false);
        setPollQuestionInput('');
        setPollOptionsInput(['', '', '', '']);
        triggerToast('In-class Live Poll broadcasted!');
      }
    } catch (err) {
      console.error('Failed to create poll:', err);
      alert('Failed to broadcast live poll.');
    }
  };

  // Poll: Student Vote
  const handleStudentVote = async (optionId) => {
    if (hasVoted || !activePoll) return;
    try {
      setSelectedOptionId(optionId);
      setHasVoted(true);

      const identifier = authorizedData.meeting.roomSlug || authorizedData.meeting.roomName;
      const res = await voteMeetingPoll({
        roomSlug: identifier,
        pollId: activePoll.pollId,
        optionId,
        userName: user?.name
      });

      if (res.success && res.poll) {
        setActivePoll(res.poll);
        triggerToast('Your response has been registered!');
      }
    } catch (err) {
      console.error('Failed to record vote:', err);
      alert(err.message || 'Failed to submit vote.');
    }
  };

  // Format Seconds
  const formatSeconds = (sec = 0) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // ── RENDER ACCESS RESTRICTION / GATEKEEPER LOCK SCREENS ─────
  if (authStatus === 'checking') {
    return (
      <div className="h-[75vh] flex flex-col items-center justify-center gap-4 text-surface-300 animate-fade-in">
        <div className="w-12 h-12 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        <div className="text-center">
          <h3 className="text-base font-bold text-surface-100">Verifying Security Credentials...</h3>
          <p className="text-xs text-surface-400 mt-1">Validating course enrollment & gatekeeper token authorization.</p>
        </div>
      </div>
    );
  }

  if (authStatus === 'forbidden') {
    return (
      <div className="h-[75vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full bg-surface-900/90 border border-rose-500/30 p-8 rounded-3xl text-center space-y-5 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center border border-rose-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-surface-50 font-heading">Access Restricted</h2>
            <p className="text-xs text-surface-300 mt-2 leading-relaxed">
              {authErrorMsg || 'You are not enrolled in the required course cohort to access this virtual classroom session.'}
            </p>
          </div>

          <div className="p-3 bg-surface-950 rounded-2xl border border-surface-800 text-[11px] text-surface-400 font-mono">
            Error Code: 403_COURSE_ENROLLMENT_GUARD
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/student/courses"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-surface-950 font-bold text-xs transition-all shadow-md"
            >
              Browse Course Catalog
            </Link>
            <Link
              to="/student/dashboard"
              className="w-full py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 font-semibold text-xs transition-colors"
            >
              Return to Student Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (authStatus === 'waiting_host') {
    return (
      <div className="h-[75vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full bg-surface-900/90 border border-amber-500/30 p-8 rounded-3xl text-center space-y-5 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20 animate-pulse">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-surface-50 font-heading">Waiting for Instructor</h2>
            <p className="text-xs text-surface-300 mt-2 leading-relaxed">
              This classroom is locked until your instructor officially launches the session.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-surface-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Check if Session Started</span>
            </button>
            <Link
              to="/student/dashboard"
              className="w-full py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 font-semibold text-xs transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isHost = authorizedData?.isHost;
  const meetingInfo = authorizedData?.meeting;
  const presentCount = attendanceList.filter(a => a.status === 'present').length;
  const totalPollVotes = activePoll ? activePoll.options.reduce((sum, o) => sum + o.votes, 0) : 0;

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-surface-900/95 border border-primary-500/40 text-surface-100 text-xs px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-slide-down font-medium">
          <Sparkles className="w-4 h-4 text-primary-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Session Info & Security Status */}
      <div className="bg-surface-900/80 backdrop-blur-xl border border-surface-700/60 p-4 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <Video className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-surface-50 font-heading">
                  {meetingInfo?.title || 'Live Virtual Classroom'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Stream
                </span>
              </div>
              <p className="text-xs text-surface-400 mt-0.5">
                {meetingInfo?.courseName ? (
                  <span className="text-primary-400 font-semibold">{meetingInfo.courseName} • </span>
                ) : null}
                Role: <strong className="text-surface-200 capitalize">{isHost ? 'Instructor / Moderator' : 'Enrolled Student'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowAttendanceDrawer(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface-800 hover:bg-surface-700 text-surface-200 border border-surface-700 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-primary-400" />
            <span>Attendance Log ({attendanceList.length})</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface-800 hover:bg-surface-700 text-surface-200 border border-surface-700 transition-all shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Invite Link'}</span>
          </button>

          {isHost && (
            <button
              onClick={handleEndClass}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600/90 hover:bg-rose-500 text-white transition-all shadow-sm"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>End Lecture</span>
            </button>
          )}
        </div>
      </div>

      {/* ── INSTRUCTOR MODERATOR CONTROL CENTER (INSTRUCTOR ONLY) ── */}
      {isHost && (
        <div className="bg-gradient-to-r from-surface-900 via-surface-900/95 to-surface-900 border border-primary-500/30 p-4 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-primary-400 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-primary-400" />
              <span>Instructor Moderator Command Center</span>
            </div>
            <span className="text-xs text-surface-400 font-mono">
              Active Slug: <strong className="text-emerald-400">{meetingInfo?.roomSlug?.slice(0, 16)}...</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => setShowCreatePollModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40 transition-all shadow-sm"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Broadcast Live Poll</span>
            </button>

            <button
              onClick={handleMuteEveryone}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 transition-all shadow-sm"
            >
              <MicOff className="w-4 h-4" />
              <span>Mute All</span>
            </button>

            <button
              onClick={handleToggleLobby}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isLobbyEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-surface-800 hover:bg-surface-700 text-surface-300 border-surface-700'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Lobby Waiting Room: {isLobbyEnabled ? 'ENABLED' : 'DISABLED'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN WEBRTC CONTAINER + LIVE POLL OVERLAY ── */}
      <div className="relative rounded-3xl overflow-hidden bg-surface-950 border border-surface-800 shadow-2xl h-[72vh] min-h-[520px]">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center bg-surface-950/90 backdrop-blur-md transition-opacity duration-300">
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-14 h-14 rounded-full border-3 border-primary-500/30 border-t-primary-500 animate-spin" />
              <Video className="w-6 h-6 absolute text-primary-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-surface-200 font-heading">
              Connecting to Secure WebRTC Classroom...
            </p>
            <p className="text-xs text-surface-400 mt-1 font-mono">
              Course: <span className="text-primary-400 font-semibold">{meetingInfo?.courseName || 'REAL_i Live'}</span>
            </p>
          </div>
        )}

        {/* ── IN-CLASS LIVE POLL OVERLAY (STUDENT & INSTRUCTOR) ── */}
        {activePoll && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-md bg-surface-900/95 backdrop-blur-xl border border-violet-500/40 p-5 rounded-3xl shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-violet-500/20 text-violet-300">
                  <HelpCircle className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                  In-Class Live Poll
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-950 border border-surface-800 text-xs font-mono text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>00:{pollTimeRemaining < 10 ? '0' : ''}{pollTimeRemaining}s</span>
                </div>
                {isHost && (
                  <button
                    onClick={() => setActivePoll(null)}
                    className="text-surface-400 hover:text-surface-200"
                    title="Close Poll"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <h3 className="text-sm font-bold text-surface-100 mb-3 leading-snug font-heading">
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
                    disabled={hasVoted || isHost}
                    onClick={() => handleStudentVote(option.optionId)}
                    className={`w-full relative overflow-hidden text-left p-3 rounded-2xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-primary-500/20 text-primary-300 border-primary-500/60 shadow-md'
                        : 'bg-surface-950 text-surface-200 border-surface-800 hover:border-surface-700'
                    }`}
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-primary-500/15 transition-all duration-500"
                      style={{ width: `${votePercentage}%` }}
                    />

                    <div className="relative z-10 flex items-center justify-between">
                      <span>{option.text}</span>
                      <div className="flex items-center gap-2 font-mono">
                        {(hasVoted || isHost) && (
                          <span className="text-[11px] font-bold text-surface-400">
                            {votePercentage}% ({option.votes})
                          </span>
                        )}
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-400" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-surface-400 border-t border-surface-800/60">
              <span>{totalPollVotes} Response(s) Received</span>
              <span>{hasVoted ? '✓ Answer Submitted' : isHost ? 'Broadcasting live' : 'Click an option to vote'}</span>
            </div>
          </div>
        )}

        {/* Jitsi Target Iframe Container */}
        <div ref={jitsiContainerRef} className="w-full h-full" />
      </div>

      {/* ── CREATE POLL MODAL (INSTRUCTOR ONLY) ── */}
      {showCreatePollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-surface-900 border border-surface-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-violet-400" />
                <h3 className="text-lg font-bold text-surface-100 font-heading">
                  Create In-Class Live Poll
                </h3>
              </div>
              <button
                onClick={() => setShowCreatePollModal(false)}
                className="text-surface-400 hover:text-surface-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <span className="text-xs text-surface-400 font-medium">Quick Question Templates:</span>
              <div className="flex flex-col gap-1.5">
                {DEFAULT_POLL_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setPollQuestionInput(preset.question);
                      setPollOptionsInput([...preset.options]);
                    }}
                    className="text-left text-xs p-2.5 rounded-xl bg-surface-950 hover:bg-surface-800 text-surface-300 border border-surface-800 transition-colors"
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
                  placeholder="Enter question for the active class..."
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
                  Timer Countdown (Seconds):
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
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Poll</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LIVE ATTENDANCE DRAWER ── */}
      {showAttendanceDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-surface-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-surface-900 border-l border-surface-800 h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-surface-800">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary-400" />
                  <h3 className="text-lg font-bold text-surface-100 font-heading">
                    Live Session Attendance Log
                  </h3>
                </div>
                <button
                  onClick={() => setShowAttendanceDrawer(false)}
                  className="p-1 rounded-lg text-surface-400 hover:bg-surface-800 hover:text-surface-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="bg-surface-950 p-3 rounded-2xl border border-surface-800 text-center">
                  <span className="text-xs text-surface-400 block font-medium">Total Attendees</span>
                  <span className="text-xl font-bold text-surface-100 font-mono mt-0.5 block">{attendanceList.length}</span>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-center">
                  <span className="text-xs text-emerald-400 block font-medium">Present Now</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">{presentCount}</span>
                </div>
                <div className="bg-surface-950 p-3 rounded-2xl border border-surface-800 text-center">
                  <span className="text-xs text-surface-400 block font-medium">Left Session</span>
                  <span className="text-xl font-bold text-surface-400 font-mono mt-0.5 block">{attendanceList.length - presentCount}</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-900 border-b border-surface-800 text-surface-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-3">Participant</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Joined At</th>
                      <th className="p-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-800/60 text-surface-300">
                    {attendanceList.map((student, i) => (
                      <tr key={i} className="hover:bg-surface-900/50">
                        <td className="p-3 font-medium text-surface-200">
                          <span className="block font-semibold">{student.name}</span>
                          <span className="text-[10px] text-surface-400 uppercase">{student.role}</span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            student.status === 'present'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-surface-800 text-surface-400'
                          }`}>
                            {student.status === 'present' ? 'Present' : 'Left'}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{student.joinTime}</td>
                        <td className="p-3 font-mono font-semibold text-primary-400">
                          {formatSeconds(student.durationSeconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-800 flex items-center justify-between">
              <span className="text-xs text-surface-400 font-mono">
                Room: <strong className="text-primary-400">{meetingInfo?.roomSlug?.slice(0, 16)}...</strong>
              </span>
              <button
                onClick={() => setShowAttendanceDrawer(false)}
                className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-semibold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

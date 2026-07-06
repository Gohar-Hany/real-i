import { useState, useEffect, useRef, useMemo } from 'react';
import './PageLoader.css';

/* ── System boot log lines ── */
const BOOT_SEQUENCE = [
  { text: 'SYS.KERNEL      → Initializing neural core...', delay: 0 },
  { text: 'MEM.ALLOC       → Allocating 1024TB cognitive matrix', delay: 150 },
  { text: 'NET.PROTOCOL    → Establishing secure lattice link', delay: 300 },
  { text: 'AUTH.LAYER      → Quantum encryption handshake', delay: 450 },
  { text: 'RENDER.ENGINE   → Loading UI compositor v4.2', delay: 600 },
  { text: 'AI.MODULE       → Neural weights synchronized', delay: 750 },
  { text: 'CORE.READY      → All systems nominal ✓', delay: 900 },
];

/* ── Pre-generate particles at module level (no re-renders) ── */
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  duration: Math.random() * 4 + 4,
  delay: Math.random() * 5,
  opacity: Math.random() * 0.3 + 0.1,
}));

export default function PageLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [phase, setPhase] = useState('boot'); // boot → ready
  const logEndRef = useRef(null);

  /* ── Progress engine (60ms tick — smooth but efficient) ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (onComplete) {
          const speed = prev < 40 ? 4.5 : prev < 80 ? 3.5 : 2.0;
          const jitter = Math.random() * 1.5;
          const next = prev + speed + jitter;
          if (next >= 100) {
            clearInterval(interval);
            setPhase('ready');
            setTimeout(() => onComplete(), 300);
            return 100;
          }
          return next;
        } else {
          const increment = Math.max(0.3, (100 - prev) * 0.12);
          return Math.min(prev + increment, 99);
        }
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onComplete]);

  /* ── Boot log typewriter ── */
  useEffect(() => {
    const timers = BOOT_SEQUENCE.map((log) =>
      setTimeout(() => {
        setVisibleLogs(prev => [...prev, log.text]);
      }, log.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  /* ── Auto-scroll logs ── */
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLogs]);

  const pct = Math.floor(progress);

  return (
    <div className="loader-root">
      {/* ── Background layers (GPU-composited, lightweight) ── */}
      <div className="loader-bg-grid" />
      <div className="loader-bg-radial" />

      {/* ── Floating particles (10 only, transform-only animation) ── */}
      <div className="loader-particles">
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="loader-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ── Orbital rings (transform-only, GPU layers) ── */}
      <div className="loader-orbit-container">
        <div className="loader-orbit loader-orbit-1" />
        <div className="loader-orbit loader-orbit-2" />
        <div className="loader-orbit-dot loader-orbit-dot-1" />
        <div className="loader-orbit-dot loader-orbit-dot-2" />
      </div>

      {/* ── Main content ── */}
      <div className="loader-content">
        {/* Logo */}
        <div className={`loader-logo-wrap ${phase === 'ready' ? 'loader-logo-ready' : ''}`}>
          <div className="loader-logo-ring" />
          <div className="loader-logo-ring loader-logo-ring-2" />
          <div className="loader-logo-inner">
            <img
              src="/logo.png"
              alt="REAL_i"
              className="loader-logo-img"
            />
          </div>
        </div>

        {/* Brand text */}
        <div className="loader-brand">
          <span className="loader-brand-letter" style={{ animationDelay: '0.1s' }}>R</span>
          <span className="loader-brand-letter" style={{ animationDelay: '0.15s' }}>E</span>
          <span className="loader-brand-letter" style={{ animationDelay: '0.2s' }}>A</span>
          <span className="loader-brand-letter" style={{ animationDelay: '0.25s' }}>L</span>
          <span className="loader-brand-dot">.</span>
          <span className="loader-brand-i" style={{ animationDelay: '0.35s' }}>i</span>
        </div>

        {/* Status line */}
        <div className="loader-status-line">
          <span className="loader-status-tag">SYS.STATE</span>
          <span className={`loader-status-value ${phase === 'ready' ? 'loader-status-online' : ''}`}>
            {phase === 'ready' ? '● SYSTEMS ONLINE' : '◌ INITIALIZING...'}
          </span>
        </div>

        {/* Progress section */}
        <div className="loader-progress-section">
          <div className="loader-progress-header">
            <span className="loader-progress-label">BOOT SEQUENCE</span>
            <span className="loader-progress-pct">{pct}%</span>
          </div>

          {/* Progress bar */}
          <div className="loader-progress-track">
            <div className="loader-progress-fill" style={{ width: `${progress}%` }}>
              <div className="loader-progress-shimmer" />
            </div>
            {/* Tick marks */}
            <div className="loader-progress-ticks">
              {[25, 50, 75].map(t => (
                <div key={t} className="loader-progress-tick" style={{ left: `${t}%` }} />
              ))}
            </div>
          </div>

          {/* Sub-modules */}
          <div className="loader-modules">
            {[
              { label: 'Neural Engine', threshold: 25 },
              { label: 'Core Protocols', threshold: 50 },
              { label: 'Encryption Layer', threshold: 75 },
              { label: 'UI Compositor', threshold: 95 },
            ].map((mod) => (
              <div key={mod.label} className="loader-module-row">
                <span className="loader-module-name">{mod.label}</span>
                <span className={`loader-module-status ${pct >= mod.threshold ? 'loader-module-ok' : ''}`}>
                  {pct >= mod.threshold ? '■ ONLINE' : '□ PENDING'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Terminal log */}
        <div className="loader-terminal">
          <div className="loader-terminal-header">
            <div className="loader-terminal-dots">
              <span className="loader-tdot loader-tdot-r" />
              <span className="loader-tdot loader-tdot-y" />
              <span className="loader-tdot loader-tdot-g" />
            </div>
            <span className="loader-terminal-title">system.boot.log</span>
          </div>
          <div className="loader-terminal-body">
            {visibleLogs.map((log, i) => (
              <div key={i} className="loader-log-line">
                <span className="loader-log-prefix">&gt;</span>
                <span className="loader-log-text">{log}</span>
              </div>
            ))}
            <div ref={logEndRef} />
            {phase !== 'ready' && <span className="loader-cursor">█</span>}
          </div>
        </div>
      </div>

      {/* ── Corner decorations ── */}
      <div className="loader-corner loader-corner-tl" />
      <div className="loader-corner loader-corner-tr" />
      <div className="loader-corner loader-corner-bl" />
      <div className="loader-corner loader-corner-br" />
    </div>
  );
}

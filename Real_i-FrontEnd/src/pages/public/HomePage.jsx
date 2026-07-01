import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Brain, BookOpen, MessageSquare, Trophy, ArrowRight,
  Sparkles, Play, Users, GraduationCap, Star,
  ChevronRight, Zap, Shield, Target, CheckCircle,
  Bot, UserCircle,
} from 'lucide-react';
import { PLATFORM_STATS, FEATURES, TESTIMONIALS, HOW_IT_WORKS } from '@/data/mockData';
import { Helmet } from 'react-helmet-async';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP = { Brain, BookOpen, MessageSquare, Trophy };

export default function HomePage() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const statsRef = useRef(null);
  const agentsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Hero Entrance: Glitch-in ──
      const heroTl = gsap.timeline({ delay: 0.3 });
      
      heroTl.to(".hero-title", { opacity: 1, duration: 0.1 })
            .fromTo(".glitch-char", 
              { opacity: 0, y: 30, scale: 1.1, filter: "blur(8px)" },
              { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.2, stagger: 0.08, ease: "expo.out" }
            )
            .to(".hero-subtitle", { opacity: 1, duration: 0.1 }, "-=0.8")
            .fromTo(".glitch-word",
              { opacity: 0, y: 20, filter: "blur(4px)" },
              { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, stagger: 0.05, ease: "expo.out" },
              "-=0.8"
            )
            .fromTo(".hero-action",
              { opacity: 0, y: 15 },
              { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "expo.out" },
              "-=0.5"
            );

      // ── Subtle Background Motion (Parallax) ──
      const parallaxContainer = document.querySelector('.hero-parallax');
      window.handleMouseMove = (e) => {
          if(parallaxContainer) {
              const x = (e.clientX / window.innerWidth - 0.5) * 20;
              const y = (e.clientY / window.innerHeight - 0.5) * 20;
              gsap.to(parallaxContainer, { x: x, y: y, duration: 1.5, ease: "power2.out" });
          }
      };
      document.addEventListener("mousemove", window.handleMouseMove);

      // ── Features Section — Cinematic Staggered Reveal ──
      ScrollTrigger.create({
        trigger: featuresRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          // Header slide-in
          tl.from('.features-header', {
            opacity: 0, x: -60, duration: 0.8, ease: 'power3.out',
          })
          // Cards stagger from bottom
          .from('.feature-card', {
            opacity: 0, y: 80, scale: 0.9,
            duration: 1, stagger: 0.15, ease: 'expo.out',
          }, '-=0.4')
          // SVG ring animation
          .to('.feature-ring', {
            strokeDashoffset: 44,
            duration: 1.2, stagger: 0.1, ease: 'power2.out',
          }, '-=0.6');
        },
      });

      // ── How It Works — Timeline Reveal ──
      ScrollTrigger.create({
        trigger: howItWorksRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          // Header
          tl.from('.hiw-header', {
            opacity: 0, x: -60, duration: 0.8, ease: 'power3.out',
          })
          // Steps stagger in
          .from('.how-step', {
            opacity: 0, y: 60, scale: 0.95,
            duration: 0.8, stagger: 0.2, ease: 'expo.out',
          }, '-=0.3')
          // Timeline progress line grows
          .to('.hiw-progress-line', {
            width: '100%',
            duration: 1.5, ease: 'power2.inOut',
          }, '-=1');
        },
      });

      // ── Stats Counter Animation ──
      gsap.utils.toArray('.stat-number').forEach((el) => {
        const target = parseInt(el.dataset.target);
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.to(el, {
              duration: 2,
              ease: 'power2.out',
              onUpdate: function () {
                el.textContent = Math.ceil(this.progress() * target).toLocaleString();
              },
            });
          },
        });
      });

      // ── Agents Section ──
      ScrollTrigger.create({
        trigger: agentsRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.from('.agent-card', {
            opacity: 0, y: 60, scale: 0.95, duration: 0.8,
            stagger: 0.2, ease: 'back.out(1.4)'
          });
        }
      });

      // ── CTA Section ──
      ScrollTrigger.create({
        trigger: ctaRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.from(ctaRef.current, {
            opacity: 0, y: 40, duration: 0.8, ease: 'power3.out',
          });
        },
      });

      // ── Section Titles ──
      ScrollTrigger.batch('.section-title', {
        onEnter: (elements) => {
          gsap.from(elements, {
            opacity: 0, y: 30, duration: 0.6, ease: 'power2.out',
          });
        },
        start: 'top 85%',
        once: true,
      });
    });

    return () => {
      document.removeEventListener("mousemove", window.handleMouseMove);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>REAL.i | Advanced Cognitive Platform</title>
        <meta name="description" content="Enter the next generation of intelligent learning with REAL.i. Experience AI-driven education in a premium cyber-industrial environment." />
      </Helmet>
      <div className="min-h-screen bg-surface-950 overflow-hidden">
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-surface-950">
        {/* Multi-layered Background */}
        {/* Layer 1: Base Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        {/* Layer 2: Abstract Nodes/Connections (Cinematic Depth) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Node 1 */}
          <div className="absolute top-[20%] right-[15%] w-32 h-32 border border-primary-500/20 rounded-full animate-spin-slow">
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(212,175,55,1)] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-0 left-1/2 w-[1px] h-4 bg-primary-500/50 -translate-x-1/2" />
            <div className="absolute bottom-0 left-1/2 w-[1px] h-4 bg-primary-500/50 -translate-x-1/2" />
            <div className="absolute left-0 top-1/2 w-4 h-[1px] bg-primary-500/50 -translate-y-1/2" />
            <div className="absolute right-0 top-1/2 w-4 h-[1px] bg-primary-500/50 -translate-y-1/2" />
          </div>
          {/* Node 2 */}
          <div className="absolute bottom-[30%] right-[30%] w-64 h-64 border border-white/5 rounded-full">
            <div className="absolute top-1/4 right-0 w-2 h-2 bg-primary-400 rounded-full shadow-[0_0_15px_rgba(212,175,55,1)]" />
            <div className="absolute bottom-1/4 left-1/4 w-[1px] h-32 bg-gradient-to-t from-primary-500/30 to-transparent rotate-45 origin-bottom" />
          </div>
          {/* Diagnostic markers */}
          <div className="absolute top-[15%] left-[5%] font-mono text-[10px] text-primary-500/40 tracking-widest hidden md:block">SYS.CORE.INIT // 0x7A4F</div>
          <div className="absolute bottom-[10%] right-[10%] font-mono text-[10px] text-primary-500/40 tracking-widest hidden md:block">MEM_ALLOC_OK -&gt; 1024TB</div>
          <div className="absolute top-[40%] right-[5%] hidden md:flex flex-col gap-1">
            <div className="w-8 h-[2px] bg-primary-500/20" />
            <div className="w-4 h-[2px] bg-primary-500/40" />
            <div className="w-6 h-[2px] bg-primary-500/30" />
          </div>
        </div>
        {/* Layer 3: Radial Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-surface-950/60 to-surface-950 z-0 pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hero-parallax">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text Column (Left aligned) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="flex items-center gap-3 mb-6 opacity-0 hero-action">
                <span className="w-12 h-[2px] bg-primary-500" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary-500">System Online</span>
              </div>
              <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl text-surface-100 mb-6 tracking-tight opacity-0 hero-title font-bold uppercase">
                <span className="inline-block glitch-char">R</span>
                <span className="inline-block glitch-char">E</span>
                <span className="inline-block glitch-char">A</span>
                <span className="inline-block glitch-char">L</span>.
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-500 to-primary-700 inline-block glitch-char drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">i</span>
              </h1>
              <p className="font-heading text-2xl md:text-3xl lg:text-4xl text-surface-400 mb-10 max-w-2xl opacity-0 hero-subtitle tracking-tight leading-tight">
                <span className="inline-block glitch-word">Real</span> <span className="inline-block glitch-word">Intelligence</span> <span className="inline-block glitch-word">isn't</span> <span className="inline-block glitch-word">predicted.</span> <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 inline-block glitch-word font-semibold">It's</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 inline-block glitch-word font-semibold">built.</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6 opacity-0 hero-action w-full sm:w-auto">
                <Link
                  to="/login?register=true"
                  className="relative group bg-surface-950 border border-primary-500/50 text-primary-400 px-8 py-4 font-mono uppercase font-bold tracking-widest overflow-hidden transition-all duration-300 hover:border-primary-500 hover:text-surface-950 w-full sm:w-auto flex items-center justify-center gap-3"
                >
                  <span className="absolute inset-0 bg-primary-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                  <span className="absolute inset-0 shadow-[0_0_20px_rgba(212,175,55,0.4)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
                  <span className="relative z-10">Start Learning</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/courses"
                  className="relative group bg-transparent border border-white/10 text-surface-400 px-8 py-4 font-mono uppercase font-bold tracking-widest transition-all duration-300 hover:border-white/30 hover:text-surface-100 w-full sm:w-auto flex items-center justify-center gap-3"
                >
                  <span className="relative z-10">Explore Courses</span>
                  <Play size={20} className="relative z-10" />
                </Link>
              </div>
            </div>
            
            {/* Abstract Visual/Data Column (Right) */}
            <div className="hidden lg:flex lg:col-span-5 relative h-full items-center justify-center opacity-0 hero-action">
              {/* High-tech abstract representation */}
              <div className="relative w-full aspect-square max-w-md">
                {/* Connecting lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <line stroke="rgba(212,175,55,0.2)" strokeWidth="0.5" x1="20" x2="80" y1="20" y2="80" />
                  <line stroke="rgba(212,175,55,0.2)" strokeWidth="0.5" x1="80" x2="20" y1="20" y2="80" />
                  <line stroke="rgba(255,255,255,0.1)" strokeDasharray="2,2" strokeWidth="0.5" x1="50" x2="50" y1="10" y2="90" />
                  <circle cx="50" cy="50" fill="none" r="30" stroke="rgba(212,175,55,0.3)" strokeWidth="0.5" />
                  <circle cx="50" cy="50" fill="none" r="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="1,4" strokeWidth="0.5" />
                </svg>
                {/* Floating Glass Data Panels */}
                <div className="absolute top-[10%] left-[10%] glass-card p-4 border border-primary-500/30 w-32 animate-float">
                  <div className="text-[10px] font-mono text-primary-500/70 mb-1">DATA.STREAM_01</div>
                  <div className="h-1 bg-primary-500/20 w-full overflow-hidden">
                    <div className="h-full bg-primary-500 w-2/3" />
                  </div>
                </div>
                <div className="absolute bottom-[20%] right-[5%] glass-card p-4 border border-primary-400/30 w-40 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="text-[10px] font-mono text-primary-400/70 mb-1">NEURAL_NET.ACT</div>
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-primary-400/80" />
                    <div className="w-1 h-4 bg-primary-400/60" />
                    <div className="w-1 h-2 bg-primary-400/40" />
                    <div className="w-1 h-5 bg-primary-400/90" />
                    <div className="w-1 h-3 bg-primary-400/50" />
                  </div>
                </div>
                {/* Central Core */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-surface-950 border border-primary-500 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                  <Brain className="text-primary-500 animate-pulse" size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-8 flex items-center gap-4 opacity-0 animate-pulse hidden md:flex hero-action">
          <ArrowRight className="text-primary-500 rotate-90 animate-bounce" size={16} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-surface-400">Scroll to execute</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES SECTION — Premium Cyber-Industrial Design
          ═══════════════════════════════════════════════════════ */}
      <section ref={featuresRef} className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary-500/3 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-primary-500/30 to-transparent animate-[scan_4s_ease-in-out_infinite]" style={{top: '20%'}} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20">
            <div className="max-w-2xl features-header">
              <div className="inline-flex items-center gap-3 px-5 py-2 mb-6 border border-primary-500/30 bg-surface-950/80 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                <span className="font-mono text-[11px] text-primary-500 uppercase tracking-[0.3em]">SYS.CAPABILITIES // ACTIVE</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-surface-100 mb-6 font-heading uppercase tracking-wide leading-[1.1]">
                Learn Smarter, <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]">Not Harder</span>
              </h2>
              <p className="text-surface-400 text-lg leading-relaxed">
                Our platform combines cutting-edge AI with premium educational content 
                to create an unmatched learning experience.
              </p>
            </div>
            <div className="hidden lg:flex items-end gap-8">
              <div className="text-right">
                <p className="font-mono text-[10px] text-surface-600 uppercase tracking-widest mb-1">Modules</p>
                <p className="font-heading text-5xl font-bold text-surface-800">04</p>
              </div>
              <div className="w-px h-16 bg-surface-800" />
              <div className="text-right">
                <p className="font-mono text-[10px] text-surface-600 uppercase tracking-widest mb-1">Status</p>
                <p className="font-mono text-sm text-primary-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" /> ALL ONLINE
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-surface-800/30 border border-surface-800/50">
            {FEATURES.map((feature, i) => {
              const Icon = ICON_MAP[feature.icon] || Brain;
              const moduleIds = ['AX-01', 'BX-02', 'CX-03', 'DX-04'];
              return (
                <div key={i} className="feature-card group relative bg-surface-950 p-8 lg:p-10 overflow-hidden cursor-pointer transition-colors duration-700 hover:bg-surface-900/50" style={{opacity: 1}}>
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-500/0 group-hover:border-primary-500/60 transition-all duration-500 ease-out" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-500/0 group-hover:border-primary-500/60 transition-all duration-500 ease-out" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary-500/0 group-hover:border-primary-500/60 transition-all duration-500 ease-out" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-500/0 group-hover:border-primary-500/60 transition-all duration-500 ease-out" />
                  <div className="absolute top-4 right-5 font-mono text-[9px] text-surface-700 group-hover:text-primary-500/60 transition-colors duration-500 tracking-widest">MOD.{moduleIds[i]}</div>
                  <div className="absolute -bottom-6 -right-4 font-heading text-[120px] font-bold text-surface-900/50 group-hover:text-primary-500/8 transition-colors duration-700 leading-none select-none pointer-events-none">0{i + 1}</div>

                  <div className="relative w-16 h-16 mb-8">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="1" className="text-surface-800" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="176" strokeDashoffset="176" className="text-primary-500 feature-ring" style={{transition: 'stroke-dashoffset 1s ease-out'}} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon size={26} className="text-surface-500 group-hover:text-primary-400 transition-all duration-500 group-hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]" strokeWidth={1.5} />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-surface-200 group-hover:text-surface-50 mb-3 font-heading uppercase tracking-wider transition-colors duration-500">{feature.title}</h3>
                  <p className="text-sm text-surface-500 group-hover:text-surface-400 leading-relaxed transition-colors duration-500">{feature.description}</p>
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-primary-500 via-primary-400 to-transparent transition-all duration-700 ease-out" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS SECTION
          ═══════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="py-20 relative">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-card rounded-3xl p-10 md:p-14 border border-primary-500/10 shadow-inner-gold">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[
                { icon: Users, value: PLATFORM_STATS.totalStudents, label: 'Active Students', suffix: '+' },
                { icon: BookOpen, value: PLATFORM_STATS.totalCourses, label: 'Expert Courses', suffix: '+' },
                { icon: GraduationCap, value: PLATFORM_STATS.completionRate, label: 'Completion Rate', suffix: '%' },
                { icon: Star, value: PLATFORM_STATS.satisfactionRate, label: 'Satisfaction', suffix: '%' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon size={28} className="text-primary-400 mx-auto mb-3" />
                  <p className="text-3xl md:text-4xl font-extrabold text-surface-100 tabular-nums">
                    <span className="stat-number" data-target={stat.value}>0</span>
                    {stat.suffix}
                  </p>
                  <p className="text-sm text-surface-400 mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS — Cyber Timeline Design
          ═══════════════════════════════════════════════════════ */}
      <section ref={howItWorksRef} className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/3 blur-[200px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl mb-20 hiw-header">
            <div className="inline-flex items-center gap-3 px-5 py-2 mb-6 border border-primary-500/30 bg-surface-950/80 backdrop-blur-sm">
              <span className="font-mono text-[11px] text-primary-500 uppercase tracking-[0.3em]">&gt;_ INIT.PROTOCOL</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-surface-100 mb-6 font-heading uppercase tracking-wide leading-[1.1]">
              Start in <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600">4 Steps</span>
            </h2>
            <p className="text-surface-400 text-lg leading-relaxed">
              From signup to mastery — our streamlined process gets you learning in minutes.
            </p>
          </div>

          <div className="relative">
            {/* Central Timeline Line (desktop) */}
            <div className="hidden lg:block absolute top-[60px] left-0 right-0 h-[1px] z-0">
              <div className="w-full h-full bg-surface-800" />
              <div className="hiw-progress-line absolute top-0 left-0 h-full w-0 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={i} className="how-step group relative">
                  {/* Step Number Node */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-primary-500/20 scale-0 group-hover:scale-150 transition-transform duration-700 blur-md" />
                      <div className="relative w-[72px] h-[72px] border-2 border-surface-700 group-hover:border-primary-500 transition-all duration-500 rounded-full flex items-center justify-center bg-surface-950 z-10">
                        <span className="font-heading text-2xl font-bold text-surface-600 group-hover:text-primary-500 transition-colors duration-500">
                          0{step.step}
                        </span>
                      </div>
                      <div className="hidden lg:block absolute -bottom-[21px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-surface-800 border-2 border-surface-700 group-hover:bg-primary-500 group-hover:border-primary-500 group-hover:shadow-[0_0_12px_rgba(212,175,55,0.6)] transition-all duration-500 z-20" />
                    </div>
                    <div className="lg:hidden flex-1 h-[1px] bg-surface-800 relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary-500/50 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="relative bg-surface-950 border border-surface-800/50 group-hover:border-primary-500/30 p-7 transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary-500/0 group-hover:border-primary-500/50 transition-all duration-500" />
                    <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/3 transition-all duration-700" />
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold text-surface-200 group-hover:text-surface-50 mb-3 font-heading uppercase tracking-wider transition-colors duration-500">
                        {step.title}
                      </h3>
                      <p className="text-sm text-surface-500 group-hover:text-surface-400 leading-relaxed transition-colors duration-500">
                        {step.description}
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-primary-500 to-transparent transition-all duration-700 ease-out" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          AI AGENTS SHOWCASE
          ═══════════════════════════════════════════════════════ */}
      <section ref={agentsRef} className="py-24 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 section-title">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-light text-xs font-medium text-primary-400 mb-4">
              <Bot size={12} />
              AI Agents
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-100 mb-4">
              Meet Your <span className="text-gradient">AI Team</span>
            </h2>
            <p className="text-surface-400 text-lg">
              Three specialized AI agents, each designed to help you in a unique way.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[600px]">
            {/* Admin Agent (Large Span) */}
            <div className="lg:col-span-8 glass-card rounded-3xl relative overflow-hidden group scanline-overlay agent-card min-h-[450px] lg:min-h-0 h-full" style={{opacity: 1}}>
              <div className="absolute inset-0 bg-surface-900/60 group-hover:bg-surface-900/20 transition-colors duration-500 z-10" />
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzgzOR4u6w0Sxdjjv_NUxG9UiXJeey13upASnvrEsQCuAl6Kg8xOwZvbxZUBS2PHK5678KNwKRprWsg89vmVXem1ONo9vfKHjqBEorNDL3620By2CQMNW73rxYJGMRNJVkAZH8Qfj56iBvGo9i_iFZfgWQ3OBzIvu-J5p_3M-r5c9rXpTzdNK8tiOH-6-vV4fCVdZKmkvvOl4EQWCkc37nEzh7Ad1vK7yV_q0W-xuG_GaNTYOnKvp-5aLS2qYeauwbLGwcgGoE1AA"
                alt="Admin Agent"
                loading="lazy"
                width="800"
                height="600"
                className="absolute inset-0 w-full h-full object-cover object-top opacity-50 group-hover:opacity-100 transition-opacity duration-700 grayscale group-hover:grayscale-0 mix-blend-luminosity"
              />
              <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full bg-gradient-to-t from-surface-950 via-surface-950/80 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span className="text-xs font-mono text-surface-400 uppercase tracking-widest">Class: Overseer</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-surface-100 mb-4 group-hover:text-primary-400 transition-colors duration-300">
                  Admin Agent
                </h3>
                <p className="text-base text-surface-300 max-w-xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 leading-relaxed">
                  A powerful management assistant that helps instructors create quizzes, set guidelines, and monitor student performance through natural language commands.
                </p>
              </div>
              {/* Decorative Frame */}
              <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-primary-500/50 z-20 transition-all duration-500 group-hover:border-primary-400 group-hover:scale-110" />
              <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-primary-500/50 z-20 transition-all duration-500 group-hover:border-primary-400 group-hover:scale-110" />
            </div>

            {/* Side Column for smaller agents */}
            <div className="lg:col-span-4 flex flex-col gap-6 h-full">
              {/* Student Agent */}
              <div className="flex-1 glass-card rounded-3xl relative overflow-hidden group scanline-overlay agent-card min-h-[350px] lg:min-h-0" style={{ opacity: 1 }}>
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJdTkDIHsoWoKj6cpNMZItpvLtHcuCoUodDXzCBcTBdB-hjSufY8s5xO85OGu42BGg0mtFW_68HomCxLvo4sk5QeRWX00ew8q3hNaWnJjwd0-DjtG3l0wdvYHvu4v9k3un6Auj-dMlGfMcJueFmtr50h7Or2-3jnejoX2KC-iMNebGdSQcRsdajmDLcfYy3A1Y4mMYLWv7rCgkP0fAgL35QX0jpAOvjEphfknW3HF_CiBB7z-LRaHbOse5fDFMuqc_FzSbKCu8Ads"
                  alt="Student Agent"
                  loading="lazy"
                  width="400"
                  height="300"
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-40 group-hover:opacity-70 transition-opacity duration-500 mix-blend-overlay"
                />
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-20 bg-gradient-to-t from-surface-950/95 via-surface-950/60 to-transparent">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    <span className="text-xs font-mono text-surface-400 uppercase tracking-widest">Class: Peer</span>
                  </div>
                  <h3 className="text-2xl font-bold text-surface-100 mb-2 group-hover:text-primary-400 transition-colors">
                    Student Agent
                  </h3>
                  <p className="text-sm text-surface-300 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 line-clamp-3">
                    An intelligent tutor trained on your exact course materials. Ask it anything about your lectures, and get accurate, grounded answers.
                  </p>
                </div>
              </div>

              {/* Friend Agent */}
              <div className="flex-1 glass-card rounded-3xl relative overflow-hidden group scanline-overlay agent-card min-h-[350px] lg:min-h-0" style={{ opacity: 1 }}>
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvn5zETFFGGfNSBUv-cKH2TnSBa8kojciUpRKXhlORLR7u4_dz7lyMh9b4p8AL_ndylREyTOXpiUDZDOGX746zoTkdc1W3lqTNoi0hHyhXf6YxmBNQyWOuC6pzLcbngbfj_aoLClIXJu43eWsATj4mPne4p3T5gj96DWnnX-j_Uq0eXjQ5-rfyqXtlvtgJAVBl5_czDGBwyFTd3EJWidcdy8_STWvjDTup2I_eKlTgGf9nqR8uZYun2bwUb1eNlYW58TepPXvlYT0"
                  alt="Friend Agent"
                  loading="lazy"
                  width="400"
                  height="300"
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-40 group-hover:opacity-70 transition-opacity duration-500 mix-blend-overlay"
                />
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-20 bg-gradient-to-t from-surface-950/95 via-surface-950/60 to-transparent">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-2 h-2 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                    <span className="text-xs font-mono text-surface-400 uppercase tracking-widest">Class: Support</span>
                  </div>
                  <h3 className="text-2xl font-bold text-surface-100 mb-2 group-hover:text-primary-400 transition-colors">
                    Friend Agent
                  </h3>
                  <p className="text-sm text-surface-300 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 line-clamp-3">
                    A friendly AI companion that helps you navigate the platform, answers general questions, and provides encouragement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS SECTION — Premium Marquee
          ═══════════════════════════════════════════════════════ */}
      <section ref={testimonialsRef} className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-surface-950" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-16">
          <div className="text-center max-w-2xl mx-auto section-title">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-light text-xs font-medium text-primary-400 mb-4 border border-primary-500/20">
              <Star size={12} className="text-primary-500 fill-primary-500" />
              Trusted by Top Performers
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-100 mb-4 font-heading uppercase tracking-wide">
              Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600">Students</span>
            </h2>
          </div>
        </div>

        {/* Marquee Container with fade masks */}
        <div className="relative flex overflow-hidden group w-full">
          {/* Gradient Masks for smooth fade at edges */}
          <div className="absolute top-0 bottom-0 left-0 w-32 md:w-64 bg-gradient-to-r from-surface-950 to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-32 md:w-64 bg-gradient-to-l from-surface-950 to-transparent z-20 pointer-events-none" />

          {/* Marquee Track — using animate-[marquee_40s_linear_infinite] */}
          <div className="flex gap-6 min-w-max animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused] px-3">
            {/* We duplicate the array to ensure continuous seamless looping. 
                Using 4 sets ensures it covers ultra-wide screens. */}
            {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div 
                key={i} 
                className="w-[280px] sm:w-[340px] flex-shrink-0 relative bg-surface-900/40 backdrop-blur-md rounded-xl p-6 sm:p-7 border border-surface-800/60 hover:border-primary-500/30 transition-all duration-500 hover:-translate-y-1 overflow-hidden group"
              >
                {/* Accent Line */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Watermark Quote */}
                <div className="absolute -top-6 -right-2 text-[120px] font-serif leading-none text-surface-800/30 pointer-events-none select-none group-hover:text-primary-500/10 transition-colors duration-500">
                  "
                </div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-1 mb-5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={12} className="text-primary-500 fill-primary-500" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-surface-300 text-[14px] leading-[1.7] mb-6 italic flex-1 font-light">
                    {t.content}
                  </p>
                  
                  {/* Author Info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-surface-800/40 mt-auto">
                    <div className="w-9 h-9 rounded-full bg-surface-800 border border-primary-500/20 flex items-center justify-center text-primary-400 text-sm font-bold font-heading shadow-[0_0_10px_rgba(212,175,55,0.1)] group-hover:border-primary-500/50 transition-colors duration-500">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-surface-100">{t.name}</p>
                      <p className="text-[10px] text-primary-500/70 uppercase tracking-wider mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA SECTION
          ═══════════════════════════════════════════════════════ */}
      <section ref={ctaRef} className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden glass border border-primary-500/20 shadow-glow-lg group">
            {/* Animated Glow Background */}
            <div className="absolute inset-0 bg-surface-900/60" />
            <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            <div className="absolute -top-1/2 -left-1/2 w-[150%] h-[150%] bg-primary-500/5 blur-[120px] rounded-full group-hover:bg-primary-500/10 transition-colors duration-700" />
            <div className="absolute -bottom-1/2 -right-1/2 w-[150%] h-[150%] bg-primary-500/5 blur-[120px] rounded-full group-hover:bg-primary-500/10 transition-colors duration-700" />
            
            <div className="relative z-10 text-center px-8 py-16 sm:py-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-50 mb-4 tracking-tight">
                Ready to Build Real Intelligence?
              </h2>
              <p className="text-surface-300 text-lg max-w-xl mx-auto mb-8">
                Join thousands of students already learning smarter with AI. 
                Start your journey today — completely free.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/login?register=true"
                  className="btn-cyber-solid group"
                >
                  Get Started Free
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/courses"
                  className="btn-cyber group"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-center mt-12 text-sm text-surface-600 tracking-[0.15em] uppercase font-heading">
          Real Intelligence isn't predicted. It's built.
        </p>
      </section>
    </div>
    </>
  );
}

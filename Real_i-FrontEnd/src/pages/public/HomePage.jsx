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

      // ── Features Section ──
      ScrollTrigger.batch('.feature-card', {
        onEnter: (elements) => {
          gsap.from(elements, {
            opacity: 0, y: 50, duration: 0.7,
            stagger: 0.15, ease: 'power2.out',
          });
        },
        start: 'top 85%',
        once: true,
      });

      // ── How It Works ──
      ScrollTrigger.batch('.how-step', {
        onEnter: (elements) => {
          gsap.from(elements, {
            opacity: 0, x: -40, duration: 0.6,
            stagger: 0.2, ease: 'power2.out',
          });
        },
        start: 'top 85%',
        once: true,
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
      ScrollTrigger.batch('.agent-card', {
        onEnter: (elements) => {
          gsap.from(elements, {
            opacity: 0, y: 60, scale: 0.95, duration: 0.8,
            stagger: 0.2, ease: 'back.out(1.4)',
          });
        },
        start: 'top 85%',
        once: true,
      });

      // ── Testimonials ──
      ScrollTrigger.batch('.testimonial-card', {
        onEnter: (elements) => {
          gsap.from(elements, {
            opacity: 0, y: 40, duration: 0.6,
            stagger: 0.15, ease: 'power2.out',
          });
        },
        start: 'top 85%',
        once: true,
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
      <div className="min-h-screen bg-surface-950 overflow-hidden pt-20">
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
          FEATURES SECTION
          ═══════════════════════════════════════════════════════ */}
      <section ref={featuresRef} className="py-24 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="section-title">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-light text-xs font-medium text-primary-400 mb-4">
                <Sparkles size={12} />
                Why REAL.i
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-100 mb-4">
                Learn Smarter, <span className="text-gradient">Not Harder</span>
              </h2>
              <p className="text-surface-400 text-lg">
                Our platform combines cutting-edge AI with premium educational content 
                to create an unmatched learning experience.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = ICON_MAP[feature.icon] || Brain;
              return (
                <div
                  key={i}
                  className="feature-card group glass-card rounded-2xl p-7 hover:border-primary-500/20 transition-all duration-500 hover-lift"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/10 flex items-center justify-center mb-5 group-hover:bg-primary-500/20 group-hover:shadow-glow-sm transition-all duration-500">
                    <Icon size={26} className="text-primary-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-lg font-bold text-surface-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-surface-400 leading-relaxed">
                    {feature.description}
                  </p>
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
          HOW IT WORKS SECTION
          ═══════════════════════════════════════════════════════ */}
      <section ref={howItWorksRef} className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 section-title">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-light text-xs font-medium text-primary-400 mb-4">
              <Target size={12} />
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-100 mb-4">
              Start in <span className="text-gradient">4 Simple Steps</span>
            </h2>
            <p className="text-surface-400 text-lg">
              From signup to mastery — our streamlined process gets you learning in minutes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="how-step relative group">
                <div className="glass-card rounded-2xl p-7 h-full hover:border-primary-500/15 transition-all duration-500 hover-lift">
                  {/* Step Number */}
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-surface-950 font-extrabold text-lg mb-5 shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-surface-100 mb-2">{step.title}</h3>
                  <p className="text-sm text-surface-400 leading-relaxed">{step.description}</p>
                </div>
                {/* Connector Arrow (hidden on last + mobile) */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ChevronRight size={20} className="text-primary-500/40" />
                  </div>
                )}
              </div>
            ))}
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
            {/* Admin Agent (Large Span) */}
            <div className="lg:col-span-8 glass-card rounded-3xl relative overflow-hidden group scanline-overlay agent-card">
              <div className="absolute inset-0 bg-surface-900/60 group-hover:bg-transparent transition-colors duration-500 z-10" />
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzgzOR4u6w0Sxdjjv_NUxG9UiXJeey13upASnvrEsQCuAl6Kg8xOwZvbxZUBS2PHK5678KNwKRprWsg89vmVXem1ONo9vfKHjqBEorNDL3620By2CQMNW73rxYJGMRNJVkAZH8Qfj56iBvGo9i_iFZfgWQ3OBzIvu-J5p_3M-r5c9rXpTzdNK8tiOH-6-vV4fCVdZKmkvvOl4EQWCkc37nEzh7Ad1vK7yV_q0W-xuG_GaNTYOnKvp-5aLS2qYeauwbLGwcgGoE1AA"
                alt="Admin Agent"
                loading="lazy"
                width="800"
                height="600"
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity duration-700 grayscale group-hover:grayscale-0 mix-blend-luminosity"
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
              <div className="flex-1 glass-card rounded-3xl relative overflow-hidden group scanline-overlay agent-card" style={{ transitionDelay: '150ms' }}>
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJdTkDIHsoWoKj6cpNMZItpvLtHcuCoUodDXzCBcTBdB-hjSufY8s5xO85OGu42BGg0mtFW_68HomCxLvo4sk5QeRWX00ew8q3hNaWnJjwd0-DjtG3l0wdvYHvu4v9k3un6Auj-dMlGfMcJueFmtr50h7Or2-3jnejoX2KC-iMNebGdSQcRsdajmDLcfYy3A1Y4mMYLWv7rCgkP0fAgL35QX0jpAOvjEphfknW3HF_CiBB7z-LRaHbOse5fDFMuqc_FzSbKCu8Ads"
                  alt="Student Agent"
                  loading="lazy"
                  width="400"
                  height="300"
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-opacity duration-500 mix-blend-overlay"
                />
                <div className="absolute inset-0 p-8 flex flex-col justify-end z-20 bg-gradient-to-t from-surface-950/90 to-transparent">
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
              <div className="flex-1 glass-card rounded-3xl relative overflow-hidden group scanline-overlay agent-card" style={{ transitionDelay: '300ms' }}>
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvn5zETFFGGfNSBUv-cKH2TnSBa8kojciUpRKXhlORLR7u4_dz7lyMh9b4p8AL_ndylREyTOXpiUDZDOGX746zoTkdc1W3lqTNoi0hHyhXf6YxmBNQyWOuC6pzLcbngbfj_aoLClIXJu43eWsATj4mPne4p3T5gj96DWnnX-j_Uq0eXjQ5-rfyqXtlvtgJAVBl5_czDGBwyFTd3EJWidcdy8_STWvjDTup2I_eKlTgGf9nqR8uZYun2bwUb1eNlYW58TepPXvlYT0"
                  alt="Friend Agent"
                  loading="lazy"
                  width="400"
                  height="300"
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-opacity duration-500 mix-blend-overlay"
                />
                <div className="absolute inset-0 p-8 flex flex-col justify-end z-20 bg-gradient-to-t from-surface-950/90 to-transparent">
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
          TESTIMONIALS SECTION
          ═══════════════════════════════════════════════════════ */}
      <section ref={testimonialsRef} className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 section-title">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-light text-xs font-medium text-primary-400 mb-4">
              <Star size={12} />
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-100 mb-4">
              Loved by <span className="text-gradient">Students</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card glass-card rounded-2xl p-8 hover:border-primary-500/15 transition-all duration-500 hover-lift">
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} className="text-primary-400 fill-primary-400" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-surface-300 text-sm leading-relaxed mb-6 italic">
                  "{t.content}"
                </p>
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-surface-950 text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-100">{t.name}</p>
                    <p className="text-xs text-surface-500">{t.role}</p>
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
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 gradient-primary opacity-90" />
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            
            <div className="relative z-10 text-center px-8 py-16 sm:py-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-950 mb-4">
                Ready to Build Real Intelligence?
              </h2>
              <p className="text-surface-950/70 text-lg max-w-xl mx-auto mb-8">
                Join thousands of students already learning smarter with AI. 
                Start your journey today — completely free.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/login?register=true"
                  className="flex items-center gap-2 px-8 py-4 rounded-full bg-surface-950 text-primary-400 font-bold text-base hover:bg-surface-900 transition-all duration-300 active:scale-95 shadow-lg"
                >
                  Get Started Free
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/courses"
                  className="flex items-center gap-2 px-8 py-4 rounded-full border-2 border-surface-950/30 text-surface-950 font-semibold text-base hover:bg-surface-950/10 transition-all duration-300"
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

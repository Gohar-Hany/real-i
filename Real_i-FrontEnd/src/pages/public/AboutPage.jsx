import { useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, Shield, BrainCircuit, Users, Terminal } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Helmet } from 'react-helmet-async';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Safe GSAP animations for sections
      gsap.utils.toArray('.animate-on-scroll').forEach(section => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
          },
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power3.out"
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <Helmet>
        <title>Real_i | The Mission Archive</title>
        <meta name="description" content="Discover the mission of Real_i. Merging cognitive engineering with educational technology to build an AI-native learning ecosystem." />
      </Helmet>
      
      <div ref={containerRef} className="min-h-screen bg-surface-950 selection:bg-primary-500/30">
        
        {/* ── Hero Section ── */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
          
          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto animate-on-scroll">
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="font-mono text-[10px] text-primary-400 uppercase tracking-[0.3em]">SYS.MISSION_01 // EST.2024</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-surface-100 font-heading tracking-tight mb-8 leading-none">
              THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">Real_i</span> MISSION
            </h1>
            
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-surface-300 leading-relaxed">
              Designing the cognitive bedrock for the next century. We bridge the gap between biological intuition and synthetic precision through industrial-grade neural architectures.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="#architecture" className="btn-cyber-solid w-full sm:w-auto px-8">
                Explore Systems
              </a>
              <a href="#values" className="btn-cyber w-full sm:w-auto px-8">
                Core Directives
              </a>
            </div>
          </div>
        </section>

        {/* ── Core Values Section ── */}
        <section id="values" className="py-24 px-4 md:px-8 max-w-7xl mx-auto animate-on-scroll">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-surface-100 uppercase tracking-wide mb-4">
                Intelligence That <span className="text-primary-500">Works</span>
              </h2>
              <p className="text-surface-400 leading-relaxed">
                We don't build theoretical models. We forge practical, robust systems designed to withstand the entropy of the real world.
              </p>
            </div>
            <div className="font-mono text-xs text-primary-500 uppercase tracking-widest px-4 py-2 border border-primary-500/30 bg-primary-500/5">
              Operational Core v.2.4
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: "MOD.01", icon: CheckCircle2, title: "Reality First", desc: "Prioritizing tangible results over abstract theories. Our intelligence is tested against real-world chaos to ensure robust performance.", status: "STABLE", color: "text-emerald-400", border: "group-hover:border-emerald-500/50" },
              { id: "MOD.02", icon: Shield, title: "Fail & Adapt", desc: "In high-stakes environments, failure is data. We engineer recursive learning loops that transform friction into aerodynamic efficiency.", status: "EVOLVING", color: "text-amber-400", border: "group-hover:border-amber-500/50" },
              { id: "MOD.03", icon: BrainCircuit, title: "System Thinking", desc: "No module exists in isolation. Every algorithm, sensor, and operator is treated as part of a single, unified cognitive entity.", status: "SYNCED", color: "text-blue-400", border: "group-hover:border-blue-500/50" }
            ].map((val, i) => (
              <div key={i} className={`glass-card p-8 relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 border border-surface-800/50 ${val.border}`}>
                <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-surface-600 group-hover:text-surface-400 transition-colors">
                  {val.id}
                </div>
                
                <div className={`w-12 h-12 rounded-lg bg-surface-900 border border-surface-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ${val.color}`}>
                  <val.icon size={24} />
                </div>
                
                <h3 className="text-xl font-bold text-surface-100 mb-4 group-hover:text-primary-400 transition-colors">{val.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed mb-8">{val.desc}</p>
                
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-surface-800 to-transparent group-hover:via-primary-500/50 transition-all duration-500" />
                
                <div className={`font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 ${val.color}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  STATUS: {val.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Our Architecture Section ── */}
        <section id="architecture" className="relative py-24 bg-surface-900/30 border-y border-surface-800/50 animate-on-scroll overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          
          <div className="relative z-10 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Left Image Side */}
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/5] sm:aspect-square relative glass-card p-4 sm:p-8">
                {/* Cyber accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-500" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-500" />
                
                <div className="w-full h-full relative overflow-hidden bg-surface-950 group">
                  <img 
                    src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80"
                    alt="Neural Architecture"
                    loading="lazy"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 mix-blend-screen"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-transparent" />
                </div>
              </div>
              
              {/* Floating Meta Card */}
              <div className="absolute -bottom-6 -right-6 sm:-bottom-10 sm:-right-10 glass-card p-6 w-64 shadow-2xl border border-primary-500/30 z-20 backdrop-blur-xl bg-surface-950/80">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal size={14} className="text-primary-500" />
                  <p className="font-mono text-[10px] text-primary-500 uppercase tracking-widest">Sys.Telemetry</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center font-mono text-[10px]">
                    <span className="text-surface-500">LATENCY</span> 
                    <span className="text-emerald-400 font-bold">2.4ms</span>
                  </div>
                  <div className="flex justify-between items-center font-mono text-[10px]">
                    <span className="text-surface-500">THROUGHPUT</span> 
                    <span className="text-surface-100">1.2M REQ/S</span>
                  </div>
                  <div className="flex justify-between items-center font-mono text-[10px]">
                    <span className="text-surface-500">UPTIME</span> 
                    <span className="text-surface-100">99.999%</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-surface-800/50">
                  <div className="h-1 w-full bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 w-[98%] shadow-glow-sm" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Content Side */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-800/50 border border-surface-700 rounded-md mb-6">
                <BrainCircuit size={14} className="text-primary-500" />
                <span className="font-mono text-[10px] text-surface-300 uppercase tracking-widest">Architecture</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-surface-100 uppercase mb-6 leading-tight">
                Neural <br/><span className="text-primary-500">Engineering</span>
              </h2>
              
              <p className="text-base text-surface-400 mb-10 leading-relaxed max-w-xl">
                We don't just build AI; we forge technical ecosystems. Our proprietary "Cognitive Lattice" methodology integrates deep learning with deterministic industrial protocols to create systems that are both creative and unfailing.
              </p>
              
              <div className="space-y-8">
                {[
                  { id: "01", title: "Recursive Synthesis", desc: "Real-time feedback loops that refine model weights based on physical environment telemetry." },
                  { id: "02", title: "Hardened Kernels", desc: "Operating at the OS level to ensure zero-latency execution in critical infrastructure." },
                  { id: "03", title: "Quantum-Ready Encryption", desc: "Securing the most sensitive intellectual assets with post-quantum lattice-based protocols." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-primary-500 text-lg font-bold group-hover:text-primary-400 transition-colors">{item.id}</span>
                      {i !== 2 && <div className="w-px h-full bg-surface-800 mt-2 group-hover:bg-primary-500/30 transition-colors" />}
                    </div>
                    <div className="pb-6">
                      <h4 className="text-lg font-bold text-surface-100 uppercase tracking-wide mb-2 group-hover:text-primary-400 transition-colors">{item.title}</h4>
                      <p className="text-sm text-surface-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </section>

        {/* ── System Architects ── */}
        <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto animate-on-scroll">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-surface-100 uppercase tracking-wide mb-4">
                System <span className="text-primary-500">Architects</span>
              </h2>
              <p className="font-mono text-xs text-surface-400 uppercase tracking-[0.2em]">Active Node Directory // Cohort 01</p>
            </div>
            <a href="/contact" className="hidden md:inline-flex items-center gap-2 text-sm text-primary-500 hover:text-primary-400 transition-colors font-mono uppercase tracking-wider">
              Join the Cohort <ArrowRight size={16} />
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { uid: "884-AX", name: "Elias Thorne", role: "Lead Architect", tags: ["TensorFlow", "Quantum"], img: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&q=80" },
              { uid: "219-ZY", name: "Dr. Sarah Vane", role: "Integration Dir", tags: ["Core Logic", "Aero"], img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80" },
              { uid: "442-KL", name: "Marcus Chen", role: "Kernel Engineer", tags: ["Silicon", "Low Latency"], img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80" },
              { uid: "901-OP", name: "Elena Rossi", role: "HMI Designer", tags: ["Lattice UI", "Cognitive"], img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80" }
            ].map((architect, i) => (
              <div key={i} className="group relative">
                {/* ID Badge Styling */}
                <div className="glass-card p-4 border border-surface-800/50 hover:border-primary-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-[9px] text-surface-500">ID: {architect.uid}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  
                  <div className="relative aspect-[4/5] mb-4 overflow-hidden rounded-sm bg-surface-900 border border-surface-800">
                    <div className="absolute inset-0 bg-primary-500/10 mix-blend-overlay z-10 group-hover:bg-transparent transition-colors duration-500" />
                    <img 
                      src={architect.img} 
                      alt={architect.name}
                      loading="lazy"
                      className="w-full h-full object-cover filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                    />
                    {/* Scanline effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-20 pointer-events-none opacity-50" />
                  </div>
                  
                  <div className="space-y-1 mb-4">
                    <h4 className="text-lg font-bold text-surface-100 uppercase tracking-wide truncate">{architect.name}</h4>
                    <p className="font-mono text-[10px] text-primary-400 uppercase tracking-wider truncate">{architect.role}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {architect.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-surface-900/50 border border-surface-800 font-mono text-[9px] text-surface-400 uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <a href="/contact" className="inline-flex items-center gap-2 text-sm text-primary-500 font-mono uppercase tracking-wider">
              Join the Cohort <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="py-24 px-4 relative overflow-hidden animate-on-scroll border-t border-surface-800/50">
          <div className="absolute inset-0 bg-primary-500/5 bg-grid-pattern opacity-30" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary-500/5 blur-[80px] rounded-[100%] pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto glass-card p-10 md:p-16 text-center border border-primary-500/20 shadow-glow-lg">
            <div className="w-16 h-16 mx-auto bg-surface-900 border border-surface-700 flex items-center justify-center mb-8 rounded-2xl rotate-3">
              <Terminal size={24} className="text-primary-500 -rotate-3" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-surface-100 uppercase mb-6 tracking-tight">
              Ready to <span className="text-primary-500">Interface?</span>
            </h2>
            
            <p className="text-base md:text-lg text-surface-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              We are selectively expanding the Real_i cohort. Join the frontline of cognitive engineering and define the future of technical intelligence.
            </p>
            
            <div className="flex flex-col items-center">
              <a href="/contact" className="btn-cyber-solid group px-10 py-4 text-sm mb-6 w-full sm:w-auto">
                <span className="relative z-10 flex items-center justify-center gap-3 w-full">
                  Initialize Connect Protocol
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-surface-900 border border-surface-800 rounded-md">
                <Shield size={12} className="text-surface-500" />
                <p className="font-mono text-[9px] text-surface-400 uppercase tracking-widest">
                  Access Level: Level 1 Clearance Required
                </p>
              </div>
            </div>
          </div>
        </section>
        
      </div>
    </>
  );
}

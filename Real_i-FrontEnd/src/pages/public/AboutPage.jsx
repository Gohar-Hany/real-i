import { useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, Shield, BrainCircuit, Users } from 'lucide-react';
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
        <title>REAL.i | The Mission Archive</title>
        <meta name="description" content="Discover the mission of REAL.i. Merging cognitive engineering with educational technology to build an AI-native learning ecosystem." />
      </Helmet>
      <div ref={containerRef} className="min-h-screen bg-surface-950 pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-grid-pattern">
        {/* Decorative Grid/Scanline */}
        <div className="absolute inset-0 bg-surface-950/80"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-on-scroll">
          <p className="font-mono text-xs text-primary-500 mb-4 tracking-[0.4em] uppercase">SYS.MISSION_01 // EST.2024</p>
          <h1 className="text-5xl md:text-7xl font-bold text-primary-500 font-heading tracking-wider mb-8 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            THE REAL.I MISSION
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-surface-300 leading-relaxed font-arabic">
            Designing the cognitive bedrock for the next century. We bridge the gap between biological intuition and synthetic precision through industrial-grade neural architectures.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-primary-500 px-8 py-4 text-surface-950 font-mono font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              Explore Systems
            </button>
            <button className="border border-primary-500 px-8 py-4 text-primary-500 font-mono font-bold text-sm uppercase tracking-widest hover:bg-primary-500/10 transition-all">
              Technical Specs
            </button>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto animate-on-scroll">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-bold font-heading text-primary-500 uppercase tracking-wider">Intelligence That Works</h2>
            <p className="font-mono text-xs text-surface-400 mt-2 uppercase tracking-widest">Operational Core Principles v.2.4</p>
          </div>
          <div className="h-px bg-surface-800 flex-grow mx-8 hidden md:block"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { id: "MOD.01", icon: CheckCircle2, title: "Reality First", desc: "We prioritize tangible results over theoretical models. Our intelligence is tested against the entropy of the real world, ensuring robust performance in chaotic environments.", status: "STABLE" },
            { id: "MOD.02", icon: Shield, title: "Fail & Adapt", desc: "In high-stakes environments, failure is data. We engineer systems that possess recursive learning loops, transforming friction into aerodynamic efficiency.", status: "EVOLVING" },
            { id: "MOD.03", icon: BrainCircuit, title: "System Thinking", desc: "No module exists in isolation. Our approach treats every algorithm, sensor, and operator as part of a single, unified cognitive entity.", status: "SYNCED" }
          ].map((val, i) => (
            <div key={i} className="glass-card p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-surface-600">
                {val.id}
              </div>
              <val.icon className="text-primary-500 mb-6 w-10 h-10" />
              <h3 className="text-xl font-bold text-surface-100 mb-4">{val.title}</h3>
              <p className="text-surface-400 font-arabic text-sm leading-relaxed">{val.desc}</p>
              <div className="mt-8 font-mono text-[10px] text-primary-500 uppercase tracking-widest">
                &gt;&gt; STATUS: {val.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Architecture Section */}
      <section className="bg-surface-900/50 py-24 animate-on-scroll">
        <div className="px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="aspect-square glass-card relative p-8 flex items-center justify-center">
              {/* Cyber accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-500" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-500" />
              
              <div className="w-full h-full grayscale opacity-80 hover:grayscale-0 transition-all duration-700 overflow-hidden">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5KfwxsmhpPuGfzeDSkbS0bxIAs8sMIkcoNGe_EKANAuxukN3jQ_o1MGr_9uZbANBTWQWRNDe6j_gkHhCAeFXF2pj_I3bSCrgJOJUGOGG4PSHmFKuZU9K_81a0bAaVXFVzTf7LdoI8kyDEMgMA5hrmnycmSmQaKHpOlScH0aQ65dqOXwJBOHM5SFDVgfrGmISf1qc31V88xG0yB9MWYcuUJNfqvGxEDkKqwLQ3_7S7Oe9Vstfw7n61"
                  alt="Neural Architecture"
                  loading="lazy"
                  className="w-full h-full object-cover mix-blend-luminosity"
                />
              </div>
            </div>
            
            {/* Metadata Overlay */}
            <div className="absolute -bottom-8 -right-8 glass-card p-6 w-64 hidden md:block shadow-2xl border-l-2 border-primary-500">
              <p className="font-mono text-[10px] text-primary-500 mb-4 uppercase tracking-widest">Core.Architecture_Metadata</p>
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[9px]"><span className="text-surface-500">LATENCY:</span> <span className="text-surface-100">2.4ms</span></div>
                <div className="flex justify-between font-mono text-[9px]"><span className="text-surface-500">CONCURRENCY:</span> <span className="text-surface-100">1M+ REQ/S</span></div>
                <div className="flex justify-between font-mono text-[9px]"><span className="text-surface-500">RELIABILITY:</span> <span className="text-surface-100">99.999%</span></div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-4xl font-bold font-heading text-primary-500 uppercase mb-6 leading-tight">Neural Engineering Approach</h2>
            <p className="text-lg text-surface-300 mb-10 leading-relaxed font-arabic">
              We don't just build AI; we forge technical ecosystems. Our proprietary "Cognitive Lattice" methodology integrates deep learning with deterministic industrial protocols to create systems that are both creative and unfailing.
            </p>
            <ul className="space-y-8">
              {[
                { id: "01", title: "Recursive Synthesis", desc: "Real-time feedback loops that refine model weights based on physical environment telemetry." },
                { id: "02", title: "Hardened Kernels", desc: "Operating at the OS level to ensure zero-latency execution in critical infrastructure." },
                { id: "03", title: "Quantum-Ready Encryption", desc: "Securing the most sensitive intellectual assets with post-quantum lattice-based protocols." }
              ].map((item, i) => (
                <li key={i} className="flex gap-6 group">
                  <span className="font-mono text-primary-500 text-xl font-bold group-hover:scale-110 transition-transform">{item.id}</span>
                  <div>
                    <h4 className="text-lg font-bold text-surface-100 uppercase tracking-wide mb-1">{item.title}</h4>
                    <p className="text-sm text-surface-400 font-arabic">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* System Architects */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto animate-on-scroll">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold font-heading text-primary-500 uppercase tracking-wider">System Architects</h2>
          <p className="font-mono text-xs text-surface-400 mt-3 uppercase tracking-[0.2em]">Active Node Directory // Cohort 01</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { uid: "884-AX-09", name: "Elias Thorne", role: "LEAD_NEURAL_ARCHITECT", tags: ["Tensor Flow", "Quantum Sec"], img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDq-cdLyn0SBIH8-gEB1dXojQIM5EqazXSCiZEelj0MAGc7I-1rcdvm7g5p53stn1tDZjyPxhh1RUgYyFvCMPUb2abuVLM_aJs17fKk-4-pf1uMG7cpjxlDxBLYtDcJ2m2zIhbtn1D_F12P-lcToeifDCn-EEEjXGYutcEAKJhsW8YVTb_RQBBgSxdM-l24iYLN93Bpgwjf4qvhJK_kr7i3BXFZYFEQSJkY3nbR558b0v4yCPI_WiXk" },
            { uid: "219-ZY-42", name: "Dr. Sarah Vane", role: "DIR_SYSTEM_INTEGRATION", tags: ["Core Logic", "Aerospace"], img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiny5RPsN9N338Jtq6FyVqEo_xqYaDVcjKGOYT8QgVKKIqtWTkFNKrXoIgQr6Y2_sVAn2vkc1-2l1HUyDoV86PVBzrU8PFNJXGzT1ml9HEmPFrDWE5vD9cbyBaqPvbdVO76Uu4lQTQC8eqqicYGG4qyQhKMFYkOboo1avuvrlTtwlc9GEfzD1asHjbg8yarQK6ZcDYWYJrtuuxqb0Dfkfi2MApxnlqgTjzwekGYcVJ_V_fuXtz2dma" },
            { uid: "442-KL-11", name: "Marcus Chen", role: "HARDWARE_KERNEL_ENG", tags: ["Silicon", "Low Latency"], img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbkvSPUS0kdYYkGzipFA48p-z1bsikywAmXmg_ZEiP0PV2lC3ni2p83nc4TI6U3K61hLzUINqYVmNTxqTK5U8Y0KX0wFbize8m31k4z6BJUzVv10080DQymmVugmj-I73zFT32iOWvc1nEWYiAU236LMCfESXO_4USrXVN-JTqKKPwr7YSgF89QaP8KEfABhLGG4swQ9A13Nsl0WUbND-rrwGQIeDxUcuSoAK4oMJfB3erTIqUex8z" },
            { uid: "901-OP-77", name: "Elena Rossi", role: "PRINCIPAL_HMI_DESIGNER", tags: ["Lattice UI", "Cognitive"], img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDL2NvbAa6n56kl8-Jclr7WVogVxgYqzGP3aYrZHqB6lFxDQGAQp-TTQZc2kfaTKBipt-FW_FOn-e4VpHMSy2GZiS6B23tJe85no0jlTMSgoCLAV78IlD1DJAgH0-CHugKBqaj-Z4cJJjzQTCCiJK8EXhML_1EEbHSirsrI0dLy49Sfkh-1P1ukAjPil095hSTa6Sgw-PaITOcfhN52bIaJkIh1ltJHO3CngE9-bFmC0cdAg1gYCnpb" }
          ].map((architect, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative aspect-[4/5] mb-5 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 border border-surface-800 group-hover:border-primary-500/50">
                <img 
                  src={architect.img} 
                  alt={architect.name}
                  loading="lazy"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/logo.jpeg'; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 mix-blend-luminosity" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/20 to-transparent opacity-90"></div>
                <div className="absolute bottom-4 left-4">
                  <p className="font-mono text-[10px] text-primary-500">UID: {architect.uid}</p>
                </div>
              </div>
              <h4 className="text-xl font-bold text-surface-100 uppercase mb-1 tracking-wide">{architect.name}</h4>
              <p className="font-mono text-[10px] text-surface-500 mb-4">{architect.role}</p>
              <div className="flex gap-2">
                {architect.tags.map(tag => (
                  <div key={tag} className="px-2 py-1 bg-surface-900 border border-surface-800 font-mono text-[9px] text-surface-400 uppercase">
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden animate-on-scroll">
        <div className="absolute inset-0 bg-primary-500/5 bg-grid-pattern opacity-50"></div>
        <div className="relative z-10 max-w-4xl mx-auto glass-card p-12 md:p-16 text-center border-t border-primary-500/50">
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-primary-500 uppercase mb-6 drop-shadow-md">Ready to Interface?</h2>
          <p className="text-lg text-surface-300 mb-10 max-w-2xl mx-auto font-arabic leading-relaxed">
            We are selectively expanding the REAL.i cohort. Join the frontline of cognitive engineering and define the future of technical intelligence.
          </p>
          <div className="flex flex-col items-center">
            <button className="group relative px-12 py-5 bg-primary-500 text-surface-950 font-mono font-bold text-sm md:text-lg uppercase tracking-widest overflow-hidden hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all">
              <span className="relative z-10 flex items-center gap-2">
                <Users size={20} />
                JOIN THE COHORT
                <ArrowRight size={20} />
              </span>
            </button>
            <div className="mt-8 flex items-center gap-4 text-surface-500 font-mono text-[10px] uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
              Terminal Active _ Waiting for Input
            </div>
            </div>
          </div>
      </section>
    </div>
    </>
  );
}

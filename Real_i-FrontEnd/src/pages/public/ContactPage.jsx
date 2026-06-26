import { useEffect, useRef, useState } from 'react';
import { Mail, MapPin, Globe, Terminal, Send, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useToast } from '@/components/common/Toast';

gsap.registerPlugin(ScrollTrigger);

export default function ContactPage() {
  const containerRef = useRef(null);
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast.success('Message transmitted successfully. Awaiting response.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-surface-950 pt-20">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-on-scroll">
          <p className="font-mono text-xs text-primary-500 mb-4 tracking-[0.4em] uppercase">SYS.COMMS // SECURE_CHANNEL</p>
          <h1 className="text-5xl md:text-7xl font-bold text-primary-500 font-heading tracking-wider mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            ESTABLISH CONNECTION
          </h1>
          <p className="text-lg text-surface-300 max-w-2xl mx-auto font-arabic leading-relaxed">
            Initialize a secure transmission to our cognitive engineering division. Our architects are on standby to process your inquiry.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column - Info */}
          <div className="lg:col-span-5 space-y-8 animate-on-scroll">
            <div className="glass-card p-8 relative overflow-hidden group border-t-2 border-primary-500/50">
              <h3 className="text-2xl font-bold text-surface-100 font-heading tracking-wide mb-8 uppercase">Node Information</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4 group/item">
                  <div className="w-10 h-10 rounded-lg bg-surface-900 border border-surface-800 flex items-center justify-center text-primary-500 group-hover/item:border-primary-500/50 group-hover/item:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-surface-500 uppercase tracking-widest mb-1">Primary Routing</p>
                    <p className="text-surface-100 font-mono">comms@real.ai</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group/item">
                  <div className="w-10 h-10 rounded-lg bg-surface-900 border border-surface-800 flex items-center justify-center text-primary-500 group-hover/item:border-primary-500/50 group-hover/item:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all">
                    <Globe size={20} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-surface-500 uppercase tracking-widest mb-1">Global Network</p>
                    <p className="text-surface-100 font-mono">+1 (800) REAL-SYS</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group/item">
                  <div className="w-10 h-10 rounded-lg bg-surface-900 border border-surface-800 flex items-center justify-center text-primary-500 group-hover/item:border-primary-500/50 group-hover/item:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-surface-500 uppercase tracking-widest mb-1">Physical Sector</p>
                    <p className="text-surface-100 font-mono text-sm leading-relaxed">
                      Level 42, Nexus Tower<br />
                      Cybernetics District<br />
                      Neo-Dubai, UAE
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terminal Status */}
            <div className="glass-card p-6 bg-surface-950 border border-surface-800 font-mono text-xs text-surface-400">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface-800">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-primary-500" />
                  <span className="text-primary-500 uppercase">System Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="uppercase tracking-widest text-[10px]">Online</span>
                </div>
              </div>
              <div className="space-y-2 opacity-80">
                <p>&gt;<span className="text-surface-600"> ping server.real.ai</span></p>
                <p className="text-green-500">64 bytes from 104.21.4.15: icmp_seq=1 ttl=56 time=2.4 ms</p>
                <p>&gt;<span className="text-surface-600"> check_comms_uplink</span></p>
                <p className="text-green-500">Uplink stable. Encryption: AES-256-GCM.</p>
                <p className="animate-pulse">_</p>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-7 animate-on-scroll">
            <div className="glass-card p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[50px] rounded-full"></div>
              
              <h3 className="text-2xl font-bold text-surface-100 font-heading tracking-wide mb-2 uppercase">Transmit Message</h3>
              <p className="font-mono text-[10px] text-surface-500 uppercase tracking-widest mb-8">All fields are monitored securely.</p>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-surface-400 uppercase tracking-widest">Operator Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-surface-900 border border-surface-800 rounded-lg px-4 py-3 text-surface-100 font-mono text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-surface-400 uppercase tracking-widest">Return Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-surface-900 border border-surface-800 rounded-lg px-4 py-3 text-surface-100 font-mono text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                      placeholder="sys@domain.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-surface-400 uppercase tracking-widest">Transmission Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-surface-900 border border-surface-800 rounded-lg px-4 py-3 text-surface-100 font-mono text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                    placeholder="Enter subject code"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-surface-400 uppercase tracking-widest">Payload</label>
                  <textarea
                    name="message"
                    required
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-surface-900 border border-surface-800 rounded-lg px-4 py-3 text-surface-100 font-mono text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all resize-none"
                    placeholder="Enter your message here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-500 text-surface-950 font-mono font-bold text-sm uppercase tracking-widest py-4 px-6 rounded-lg hover:bg-primary-400 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Transmitting...
                    </>
                  ) : (
                    <>
                      Execute Transmission
                      <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

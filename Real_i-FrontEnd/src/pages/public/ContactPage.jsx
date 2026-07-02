import { useEffect, useRef, useState } from 'react';
import { Mail, MapPin, Globe, Terminal, Send, Loader2, CheckCircle2, MessageSquare, ArrowRight, Clock } from 'lucide-react';
import Select from '@/components/common/Select';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useToast } from '@/components/common/Toast';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';

gsap.registerPlugin(ScrollTrigger);

const SUBJECT_OPTIONS = [
  'General Inquiry',
  'Technical Support',
  'Partnership Opportunity',
  'Bug Report',
  'Feature Request',
  'Course Feedback',
  'Other',
];

export default function ContactPage() {
  const containerRef = useRef(null);
  const toast = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Pre-fill from auth context
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.contact-hero-content', {
        opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', delay: 0.2,
      });
      gsap.from('.contact-info-panel', {
        opacity: 0, x: -30, duration: 0.7, ease: 'power3.out', delay: 0.4,
      });
      gsap.from('.contact-form-panel', {
        opacity: 0, x: 30, duration: 0.7, ease: 'power3.out', delay: 0.5,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case 'name': return value.trim().length < 2 ? 'Name must be at least 2 characters' : '';
      case 'email': return !/^\S+@\S+\.\S+$/.test(value) ? 'Please enter a valid email' : '';
      case 'subject': return value.trim().length < 3 ? 'Please select or enter a subject' : '';
      case 'message': return value.trim().length < 10 ? `${10 - value.trim().length} more characters needed` : '';
      default: return '';
    }
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    setTouched({ name: true, email: true, subject: true, message: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Message transmitted successfully!');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Live validation for touched fields
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error || undefined }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error || undefined }));
  };

  const handleSendAnother = () => {
    setIsSubmitted(false);
    setErrors({});
    setTouched({});
    setFormData({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
  };

  const messageLength = formData.message.trim().length;

  return (
    <>
      <Helmet>
        <title>REAL.i | Contact Us</title>
        <meta name="description" content="Get in touch with the REAL.i team. We'd love to hear from you." />
      </Helmet>

      <div ref={containerRef} className="min-h-screen bg-surface-950">
        {/* ── Hero Section ── */}
        <section className="relative pt-32 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 contact-hero-content">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-[2px] bg-primary-500" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary-500">Contact Us</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading text-primary-500 uppercase tracking-wider mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              Get In Touch
            </h1>
            <p className="text-lg text-surface-300 max-w-2xl font-arabic leading-relaxed">
              Have a question, feedback, or partnership idea? We'd love to hear from you.
              Our team typically responds within 24 hours.
            </p>
          </div>
        </section>

        {/* ── Main Content ── */}
        <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* ── Left Column — Contact Info ── */}
            <div className="lg:col-span-4 space-y-6 contact-info-panel">
              {/* Contact Cards */}
              <div className="glass-card p-6 border border-surface-800/50 space-y-6">
                <h3 className="text-lg font-bold text-surface-100 font-heading tracking-wide uppercase flex items-center gap-2">
                  <MessageSquare size={18} className="text-primary-500" />
                  Contact Information
                </h3>

                {[
                  { icon: Mail, label: 'Email', value: 'contact@real-i.ai', sublabel: 'Primary contact' },
                  { icon: Globe, label: 'Phone', value: '+20 (100) 123-4567', sublabel: 'Sun–Thu, 9am–6pm' },
                  { icon: MapPin, label: 'Location', value: 'Cairo, Egypt', sublabel: 'Innovation Hub' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4 group/item">
                    <div className="w-10 h-10 shrink-0 bg-surface-900 border border-surface-800 flex items-center justify-center text-primary-500 group-hover/item:border-primary-500/50 group-hover/item:shadow-[0_0_12px_rgba(212,175,55,0.15)] transition-all duration-300">
                      <item.icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] text-surface-500 uppercase tracking-widest mb-0.5">{item.sublabel}</p>
                      <p className="text-surface-100 text-sm font-medium truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Time */}
              <div className="glass-card p-6 border border-surface-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <Clock size={16} className="text-primary-500" />
                  <span className="font-mono text-xs text-surface-400 uppercase tracking-wider">Avg. Response Time</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-surface-100">~4</span>
                  <span className="text-surface-400 text-sm">hours</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest">Team Online</span>
                </div>
              </div>

              {/* Terminal Status */}
              <div className="glass-card p-5 border border-surface-800/50 font-mono text-xs text-surface-400">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-800/50">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-primary-500" />
                    <span className="text-primary-500 uppercase tracking-wider">System Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="uppercase tracking-widest text-[10px]">Online</span>
                  </div>
                </div>
                <div className="space-y-1.5 opacity-80">
                  <p>&gt;<span className="text-surface-500"> ping server.real-i.ai</span></p>
                  <p className="text-emerald-400">64 bytes: icmp_seq=1 ttl=56 time=2.4ms</p>
                  <p>&gt;<span className="text-surface-500"> check_comms_uplink</span></p>
                  <p className="text-emerald-400">Uplink stable. Encryption: AES-256.</p>
                  <p className="animate-pulse text-primary-500">█</p>
                </div>
              </div>
            </div>

            {/* ── Right Column — Form ── */}
            <div className="lg:col-span-8 contact-form-panel">
              <div className="glass-card p-8 sm:p-10 border border-surface-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 blur-[60px] rounded-full pointer-events-none" />

                {isSubmitted ? (
                  /* ── Success State ── */
                  <div className="relative z-10 text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 size={40} className="text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-surface-100 font-heading uppercase tracking-wide mb-3">
                      Message Sent!
                    </h3>
                    <p className="text-surface-400 max-w-md mx-auto mb-8 leading-relaxed">
                      Thank you for reaching out. We've received your message and will get back to you within 24 hours.
                    </p>
                    <button
                      onClick={handleSendAnother}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-surface-900 border border-surface-700 text-surface-200 font-mono text-xs uppercase tracking-widest hover:border-primary-500/50 hover:text-primary-400 transition-all duration-300"
                    >
                      Send Another Message
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  /* ── Form ── */
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-surface-100 font-heading tracking-wide mb-1 uppercase">
                      Send a Message
                    </h3>
                    <p className="text-sm text-surface-500 mb-8">
                      Fill out the form below and we'll get back to you shortly.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Name */}
                        <div className="space-y-1.5">
                          <label htmlFor="contact-name" className="block font-mono text-xs font-medium text-surface-400 uppercase tracking-wider">
                            Your Name <span className="text-primary-500">*</span>
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full bg-surface-900/80 border ${touched.name && errors.name ? 'border-red-500/70 focus:border-red-500' : 'border-surface-800 focus:border-primary-500/70'} px-4 py-3 text-surface-100 text-sm outline-none focus:ring-1 ${touched.name && errors.name ? 'focus:ring-red-500/30' : 'focus:ring-primary-500/20'} transition-all duration-200 placeholder:text-surface-600`}
                            placeholder="Ahmed Hassan"
                          />
                          {touched.name && errors.name && (
                            <p className="text-red-400 text-xs font-mono mt-1">{errors.name}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <label htmlFor="contact-email" className="block font-mono text-xs font-medium text-surface-400 uppercase tracking-wider">
                            Email Address <span className="text-primary-500">*</span>
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full bg-surface-900/80 border ${touched.email && errors.email ? 'border-red-500/70 focus:border-red-500' : 'border-surface-800 focus:border-primary-500/70'} px-4 py-3 text-surface-100 text-sm outline-none focus:ring-1 ${touched.email && errors.email ? 'focus:ring-red-500/30' : 'focus:ring-primary-500/20'} transition-all duration-200 placeholder:text-surface-600`}
                            placeholder="ahmed@example.com"
                          />
                          {touched.email && errors.email && (
                            <p className="text-red-400 text-xs font-mono mt-1">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-1.5">
                        <label htmlFor="contact-subject" className="block font-mono text-xs font-medium text-surface-400 uppercase tracking-wider">
                          Subject <span className="text-primary-500">*</span>
                        </label>
                        <Select
                          value={formData.subject}
                          onChange={(val) => {
                            setFormData(prev => ({ ...prev, subject: val }));
                            if (touched.subject) {
                              setErrors(prev => ({ ...prev, subject: validateField('subject', val) || undefined }));
                            }
                          }}
                          options={SUBJECT_OPTIONS}
                          placeholder="Select a topic..."
                        />
                        {touched.subject && errors.subject && (
                          <p className="text-red-400 text-xs font-mono mt-1">{errors.subject}</p>
                        )}
                      </div>

                      {/* Message */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="contact-message" className="block font-mono text-xs font-medium text-surface-400 uppercase tracking-wider">
                            Message <span className="text-primary-500">*</span>
                          </label>
                          <span className={`font-mono text-[10px] tracking-wider ${messageLength >= 10 ? 'text-emerald-400' : 'text-surface-500'}`}>
                            {messageLength}/500
                          </span>
                        </div>
                        <textarea
                          id="contact-message"
                          name="message"
                          rows="5"
                          maxLength={500}
                          value={formData.message}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full bg-surface-900/80 border ${touched.message && errors.message ? 'border-red-500/70 focus:border-red-500' : 'border-surface-800 focus:border-primary-500/70'} px-4 py-3 text-surface-100 text-sm outline-none focus:ring-1 ${touched.message && errors.message ? 'focus:ring-red-500/30' : 'focus:ring-primary-500/20'} transition-all duration-200 resize-none placeholder:text-surface-600`}
                          placeholder="Tell us what's on your mind..."
                        />
                        {touched.message && errors.message && (
                          <p className="text-red-400 text-xs font-mono mt-1">{errors.message}</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary-500 text-surface-950 font-mono text-sm font-bold uppercase tracking-widest hover:bg-primary-400 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 mt-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send size={16} />
                          </>
                        )}
                      </button>

                      <p className="text-center text-[11px] text-surface-600 font-mono">
                        By submitting, you agree to our privacy policy. We'll never share your data.
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

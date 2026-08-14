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
        <title>REAL_i | Contact Us</title>
        <meta name="description" content="Get in touch with the REAL_i team. We'd love to hear from you." />
      </Helmet>

      <div ref={containerRef} className="min-h-screen bg-surface-950">
        {/* ── Hero Section ── */}
        <section className="relative pt-32 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 contact-hero-content">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-[2px] bg-primary-500 dark:bg-primary-400 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 font-semibold">Contact Us</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading text-surface-50 dark:text-white uppercase tracking-wider mb-4">
              Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-primary-600 to-amber-700 dark:from-primary-300 dark:via-primary-400 dark:to-primary-500">Touch</span>
            </h1>
            <p className="text-lg text-surface-400 dark:text-surface-300 max-w-2xl font-sans leading-relaxed">
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
              <div className="bg-surface-900 rounded-2xl p-6 border border-surface-600/40 dark:border-surface-800/50 space-y-6 shadow-sm">
                <h3 className="text-lg font-bold text-surface-50 dark:text-surface-100 font-heading tracking-wide uppercase flex items-center gap-2">
                  <MessageSquare size={18} className="text-primary-600 dark:text-primary-400" />
                  Contact Information
                </h3>

                {[
                  { icon: Mail, label: 'Email', value: 'contact@real-i.ai', sublabel: 'Primary contact' },
                  { icon: Globe, label: 'Phone', value: '+20 (100) 123-4567', sublabel: 'Sun–Thu, 9am–6pm' },
                  { icon: MapPin, label: 'Location', value: 'Cairo, Egypt', sublabel: 'Innovation Hub' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4 group/item">
                    <div className="w-10 h-10 shrink-0 bg-surface-800 border border-surface-600/40 dark:border-surface-700 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover/item:border-primary-500/50 group-hover/item:shadow-[0_0_12px_rgba(212,175,55,0.2)] transition-all duration-300 shadow-sm">
                      <item.icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] text-surface-400 uppercase tracking-widest mb-0.5 font-semibold">{item.sublabel}</p>
                      <p className="text-surface-50 dark:text-surface-100 text-sm font-medium truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Time */}
              <div className="bg-surface-900 rounded-2xl p-6 border border-surface-600/40 dark:border-surface-800/50 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Clock size={16} className="text-primary-600 dark:text-primary-400" />
                  <span className="font-mono text-xs text-surface-400 uppercase tracking-wider font-semibold">Avg. Response Time</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-surface-50 dark:text-surface-100 font-heading">~4</span>
                  <span className="text-surface-400 text-sm">hours</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-widest font-bold">Team Online</span>
                </div>
              </div>

              {/* Terminal Status */}
              <div className="bg-surface-900 rounded-2xl p-5 border border-surface-600/40 dark:border-surface-800/50 font-mono text-xs text-surface-400 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-600/30 dark:border-surface-800/50">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-primary-600 dark:text-primary-400" />
                    <span className="text-primary-600 dark:text-primary-400 uppercase tracking-wider font-bold">System Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="uppercase tracking-widest text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Online</span>
                  </div>
                </div>
                <div className="space-y-1.5 opacity-90">
                  <p>&gt;<span className="text-surface-400"> ping server.real-i.ai</span></p>
                  <p className="text-emerald-700 dark:text-emerald-400">64 bytes: icmp_seq=1 ttl=56 time=2.4ms</p>
                  <p>&gt;<span className="text-surface-400"> check_comms_uplink</span></p>
                  <p className="text-emerald-700 dark:text-emerald-400">Uplink stable. Encryption: AES-256.</p>
                  <p className="animate-pulse text-primary-500">█</p>
                </div>
              </div>
            </div>

            {/* ── Right Column — Form ── */}
            <div className="lg:col-span-8 contact-form-panel">
              <div className="bg-surface-900 rounded-2xl p-8 sm:p-10 border border-surface-600/40 dark:border-surface-800/50 shadow-md relative z-50">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 blur-[60px] rounded-full pointer-events-none" />

                {isSubmitted ? (
                  /* ── Success State ── */
                  <div className="relative z-10 text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-surface-50 dark:text-surface-100 font-heading uppercase tracking-wide mb-3">
                      Message Sent!
                    </h3>
                    <p className="text-surface-400 max-w-md mx-auto mb-8 leading-relaxed font-sans">
                      Thank you for reaching out. We've received your message and will get back to you within 24 hours.
                    </p>
                    <button
                      onClick={handleSendAnother}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-surface-800 border border-surface-600/40 dark:border-surface-700 text-surface-50 dark:text-surface-200 font-mono text-xs uppercase tracking-widest hover:border-primary-500 hover:text-primary-500 transition-all duration-300 rounded-xl"
                    >
                      Send Another Message
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  /* ── Form ── */
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-surface-50 dark:text-surface-100 font-heading tracking-wide mb-1 uppercase">
                      Send a Message
                    </h3>
                    <p className="text-sm text-surface-400 mb-8 font-sans">
                      Fill out the form below and we'll get back to you shortly.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Name */}
                        <div className="space-y-1.5">
                          <label htmlFor="contact-name" className="block font-mono text-xs font-semibold text-surface-200 dark:text-surface-300 uppercase tracking-wider">
                            Your Name <span className="text-primary-500">*</span>
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full bg-surface-950 border ${touched.name && errors.name ? 'border-danger-500' : 'border-surface-600/50 dark:border-surface-700/60 focus:border-primary-500'} rounded-xl px-4 py-3 text-surface-50 dark:text-surface-100 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 placeholder:text-surface-400 font-sans`}
                            placeholder="Ahmed Hassan"
                          />
                          {touched.name && errors.name && (
                            <p className="text-danger-text text-xs font-mono mt-1">{errors.name}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <label htmlFor="contact-email" className="block font-mono text-xs font-semibold text-surface-200 dark:text-surface-300 uppercase tracking-wider">
                            Email Address <span className="text-primary-500">*</span>
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full bg-surface-950 border ${touched.email && errors.email ? 'border-danger-500' : 'border-surface-600/50 dark:border-surface-700/60 focus:border-primary-500'} rounded-xl px-4 py-3 text-surface-50 dark:text-surface-100 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 placeholder:text-surface-400 font-sans`}
                            placeholder="ahmed@example.com"
                          />
                          {touched.email && errors.email && (
                            <p className="text-danger-text text-xs font-mono mt-1">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-1.5">
                        <label htmlFor="contact-subject" className="block font-mono text-xs font-semibold text-surface-200 dark:text-surface-300 uppercase tracking-wider">
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
                          <p className="text-danger-text text-xs font-mono mt-1">{errors.subject}</p>
                        )}
                      </div>

                      {/* Message */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="contact-message" className="block font-mono text-xs font-semibold text-surface-200 dark:text-surface-300 uppercase tracking-wider">
                            Message <span className="text-primary-500">*</span>
                          </label>
                          <span className={`font-mono text-[10px] tracking-wider ${messageLength >= 10 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-surface-400'}`}>
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
                          className={`w-full bg-surface-950 border ${touched.message && errors.message ? 'border-danger-500' : 'border-surface-600/50 dark:border-surface-700/60 focus:border-primary-500'} rounded-xl px-4 py-3 text-surface-50 dark:text-surface-100 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 resize-none placeholder:text-surface-400 font-sans`}
                          placeholder="Tell us what's on your mind..."
                        />
                        {touched.message && errors.message && (
                          <p className="text-danger-text text-xs font-mono mt-1">{errors.message}</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-surface-950 font-mono text-sm font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-[1.01] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 mt-2 cursor-pointer shadow-md"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Sending...
                          </>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <Send size={16} />
                          </>
                        )}
                      </button>

                      <p className="text-center text-[11px] text-surface-400 font-sans">
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

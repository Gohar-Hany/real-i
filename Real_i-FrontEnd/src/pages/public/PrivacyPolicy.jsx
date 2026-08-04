import { Helmet } from 'react-helmet-async';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-surface-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Privacy Policy | REAL_i</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 mb-6">
            <Shield size={32} className="text-primary-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-surface-50 mb-4">Privacy Policy</h1>
          <p className="text-surface-400 text-lg">Last updated: July 15, 2026</p>
        </div>

        <div className="glass-card p-8 md:p-12 rounded-3xl border border-surface-700/50 bg-surface-900/60 prose prose-invert prose-primary max-w-none">
          <p className="text-surface-300">
            At <strong>REAL_i</strong>, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform or use our services.
          </p>

          <h2 className="text-2xl font-bold text-surface-50 mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-surface-300">
            We collect information that you provide directly to us when registering for an account, participating in interactive features, or communicating with us. This may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-surface-300 mb-6">
            <li>Personal identification information (Name, email address).</li>
            <li>Academic and performance data generated through quizzes and learning modules.</li>
            <li>Interactions with our AI tutors (chat logs for improving model accuracy).</li>
          </ul>

          <h2 className="text-2xl font-bold text-surface-50 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-surface-300">
            We use the collected information for various purposes, including to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-surface-300 mb-6">
            <li>Provide, maintain, and improve our platform.</li>
            <li>Personalize your learning experience using our AI engine.</li>
            <li>Monitor and analyze usage and trends to enhance user experience.</li>
          </ul>

          <h2 className="text-2xl font-bold text-surface-50 mt-8 mb-4">3. Data Security</h2>
          <p className="text-surface-300 mb-6">
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
          </p>

          <h2 className="text-2xl font-bold text-surface-50 mt-8 mb-4">4. Contact Us</h2>
          <p className="text-surface-300">
            If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:contact@reali.edu" className="text-primary-400 hover:underline">contact@reali.edu</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

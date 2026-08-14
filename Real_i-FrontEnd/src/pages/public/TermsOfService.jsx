import { Helmet } from 'react-helmet-async';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-surface-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Terms of Service | REAL_i</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/30 mb-6 shadow-sm">
            <FileText size={32} className="text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-surface-50 dark:text-surface-100 mb-4 font-heading">Terms of Service</h1>
          <p className="text-surface-400 text-lg">Last updated: July 15, 2026</p>
        </div>

        <div className="bg-surface-900 p-8 md:p-12 rounded-3xl border border-surface-600/40 dark:border-surface-800/50 shadow-md max-w-none space-y-6">
          <p className="text-surface-300 leading-relaxed">
            Welcome to <strong className="text-surface-50 dark:text-surface-100 font-semibold">REAL_i</strong>. By accessing or using our platform, you agree to be bound by these Terms of Service and our Privacy Policy.
          </p>

          <h2 className="text-2xl font-bold text-surface-50 dark:text-surface-100 mt-8 mb-4 font-heading">1. Use of the Platform</h2>
          <p className="text-surface-300 leading-relaxed">
            You must be at least 13 years old to use our services. By using REAL_i, you represent that you meet this requirement. You are responsible for safeguarding your account password and any activities or actions under your account.
          </p>

          <h2 className="text-2xl font-bold text-surface-50 dark:text-surface-100 mt-8 mb-4 font-heading">2. User Content</h2>
          <p className="text-surface-300 leading-relaxed">
            Our platform allows you to interact with AI tutors, submit assignments, and take quizzes. You retain all rights to any content you submit, but by submitting content, you grant us a license to use it to provide and improve the service.
          </p>

          <h2 className="text-2xl font-bold text-surface-50 dark:text-surface-100 mt-8 mb-4 font-heading">3. Code of Conduct</h2>
          <p className="text-surface-300 leading-relaxed">
            You agree not to engage in any prohibited conduct, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-surface-300 mb-6">
            <li>Cheating, attempting to exploit the quiz engine, or using unauthorized automated scripts.</li>
            <li>Harassing, abusing, or harming another person or the AI agents.</li>
            <li>Interfering with the security or performance of the platform.</li>
          </ul>

          <h2 className="text-2xl font-bold text-surface-50 dark:text-surface-100 mt-8 mb-4 font-heading">4. Termination</h2>
          <p className="text-surface-300 leading-relaxed">
            We reserve the right to suspend or terminate your account at any time, for any reason, without notice or liability.
          </p>

          <h2 className="text-2xl font-bold text-surface-50 dark:text-surface-100 mt-8 mb-4 font-heading">5. Contact</h2>
          <p className="text-surface-300 leading-relaxed">
            If you have questions about these Terms, please contact us at: <a href="mailto:contact@reali.edu" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">contact@reali.edu</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

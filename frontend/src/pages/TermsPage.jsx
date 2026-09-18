import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';

const TermsPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('terms');

  useEffect(() => {
    if (location.pathname.includes('privacy')) {
      setActiveTab('privacy');
    } else {
      setActiveTab('terms');
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-[#1F1F1F] flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-[#D1D7DC] px-6 sm:px-12 py-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-black text-[#0056D2] tracking-tight no-underline">
            crescentia
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-1.5 text-xs font-bold text-[#0056D2] hover:underline no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign Up</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10 my-6">
        <div className="bg-white border border-[#D1D7DC] rounded-xl shadow-xs overflow-hidden">
          {/* Hero Banner inside card */}
          <div className="bg-[#F8F9FA] border-b border-[#D1D7DC] p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F1F1F] tracking-tight">
              Legal Information & Policies
            </h1>
            <p className="text-xs sm:text-sm text-[#6A6F73] mt-1">
              Effective: January 1, 2026 • Crescentia Global Learning Platform
            </p>

            {/* Tab switchers */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setActiveTab('terms')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  activeTab === 'terms'
                    ? 'bg-[#0056D2] text-white border-[#0056D2]'
                    : 'bg-white text-[#1F1F1F] border-[#D1D7DC] hover:bg-gray-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Terms of Use</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  activeTab === 'privacy'
                    ? 'bg-[#0056D2] text-white border-[#0056D2]'
                    : 'bg-white text-[#1F1F1F] border-[#D1D7DC] hover:bg-gray-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Privacy Notice</span>
              </button>
            </div>
          </div>

          {/* Legal Content */}
          <div className="p-6 sm:p-10 text-xs sm:text-sm leading-relaxed text-[#333333] space-y-8 text-left">
            {activeTab === 'terms' ? (
              <>
                <section className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#1F1F1F]">
                    1. Acceptance of Terms & General Conditions
                  </h2>
                  <p>
                    By accessing or registering an account on Crescentia (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Use, along with all applicable academic and community guidelines. If you do not agree to these terms, please do not use or access Crescentia.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#1F1F1F]">
                    2. Honor Code & Examination Integrity
                  </h2>
                  <p>
                    Crescentia upholds strict standards of academic honesty to guarantee the validity of certificates issued across our programs. All learners agree to:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-[#555555]">
                    <li>Complete all timed assessments, code reviews, and quizzes personally without unauthorized third-party collaboration.</li>
                    <li>Refrain from publishing or sharing quiz answer keys, exam questions, or internal course materials.</li>
                    <li>Avoid submitting automated or copied code solutions in hands-on laboratories.</li>
                  </ul>
                  <p>
                    Breaches of academic integrity result in immediate invalidation of course completion credentials and permanent forfeiture of certificates.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#1F1F1F]">
                    3. Learner Accounts & Security
                  </h2>
                  <p>
                    When creating an account, you must provide accurate, complete information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities occurring under your profile. Sharing accounts between multiple students is strictly prohibited.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#1F1F1F]">
                    4. Intellectual Property & Material Rights
                  </h2>
                  <p>
                    All videos, lesson plans, software exercises, downloadable slide decks, and exam questions remain the exclusive intellectual property of Crescentia and its respective instructional authors. You receive a limited, revocable, non-exclusive license to consume course content solely for your own personal educational development.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#1F1F1F]">
                    5. Verifiable Certificates of Achievement
                  </h2>
                  <p>
                    Certificates are awarded to learners who successfully finish all lesson modules and achieve passing scores on designated assessments. Each certificate contains a unique cryptographic validation ID suitable for display on professional platforms such as LinkedIn.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#1F1F1F]">
                    6. Community Conduct & Discussion Guidelines
                  </h2>
                  <p>
                    Discussion forums, peer notes, and Q&A interactions must remain constructive and supportive. Hate speech, commercial solicitation, harassment, and abusive behavior will result in prompt moderation and possible account revocation.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#1F1F1F]">
                    7. Modifications & Inquiries
                  </h2>
                  <p>
                    We reserve the right to revise these Terms periodically. Continued use of the platform after adjustments constitutes acceptance of the modified Terms. Questions may be addressed to <span className="font-semibold text-[#0056D2]">legal@crescentia.edu</span>.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#1F1F1F]">
                    1. Information We Collect
                  </h2>
                  <p>
                    To personalize and record your learning progress, we collect:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-[#555555]">
                    <li><strong>Registration Details:</strong> Full name, verified email address, and encrypted credentials.</li>
                    <li><strong>Academic Metrics:</strong> Lesson completion timestamps, video watch progress, assessment answers, and achievement streaks.</li>
                    <li><strong>Device Diagnostics:</strong> Browser environment, IP telemetry, and session logs for security and fraud prevention.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#1F1F1F]">
                    2. Utilization of Learner Data
                  </h2>
                  <p>
                    Your data is strictly applied to deliver learning services:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-[#555555]">
                    <li>Tracking enrolled course modules and restoring playback positions.</li>
                    <li>Generating verifiable certificates of completion linked to your identity.</li>
                    <li>Informing you of critical account alerts, instructor answers, and new course releases.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#1F1F1F]">
                    3. No Third-Party Data Monetization
                  </h2>
                  <p>
                    We do not sell, rent, or commercialize your personal data to marketing brokers or third parties. Information is only transferred to essential technical infrastructure providers (e.g. MongoDB Atlas, Vercel) strictly under confidentiality requirements.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#1F1F1F]">
                    4. Security & Cryptographic Protection
                  </h2>
                  <p>
                    We apply industry-grade bcrypt hashing for all credentials and enforce HTTPS/TLS encryption across all network transfers.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#1F1F1F]">
                    5. User Rights & Account Management
                  </h2>
                  <p>
                    You retain the right to review your data, change profile details, or request permanent deletion of your account and study transcripts by writing to <span className="font-semibold text-[#0056D2]">privacy@crescentia.edu</span>.
                  </p>
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#6A6F73] border-t border-[#D1D7DC] bg-white">
        © {new Date().getFullYear()} Crescentia Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default TermsPage;

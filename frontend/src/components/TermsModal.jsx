import { useState } from 'react';
import { X, ShieldCheck, FileText, Check } from 'lucide-react';

const TermsModal = ({ isOpen, onClose, initialTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#D1D7DC] overflow-hidden flex flex-col max-h-[85vh] text-left"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E0E0E0] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center">
              {activeTab === 'terms' ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F1F1F]">
                {activeTab === 'terms' ? 'Terms of Use' : 'Privacy Notice'}
              </h2>
              <p className="text-xs text-[#6A6F73]">
                Last updated: January 2026 • Crescentia Online Learning
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6A6F73] hover:text-[#1F1F1F] hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E0E0E0] bg-[#F8F9FA] px-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer bg-transparent ${
              activeTab === 'terms'
                ? 'border-[#0056D2] text-[#0056D2]'
                : 'border-transparent text-[#6A6F73] hover:text-[#1F1F1F]'
            }`}
          >
            Terms of Use
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer bg-transparent ${
              activeTab === 'privacy'
                ? 'border-[#0056D2] text-[#0056D2]'
                : 'border-transparent text-[#6A6F73] hover:text-[#1F1F1F]'
            }`}
          >
            Privacy Notice
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-6 py-5 overflow-y-auto text-xs text-[#333333] space-y-5 leading-relaxed flex-1">
          {activeTab === 'terms' ? (
            <>
              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1F1F1F]">1. Acceptance of Terms</h3>
                <p>
                  By creating an account, accessing, or using the Crescentia platform (&quot;Service&quot;), you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1F1F1F]">2. Honor Code & Academic Integrity</h3>
                <p>
                  Crescentia is committed to maintaining high standards of academic and professional integrity. As a student or learner:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#555555]">
                  <li>You must complete all quizzes, exams, and assessments independently without unauthorized assistance.</li>
                  <li>You will not share solutions, assessment questions, or certificate credentials with any third parties.</li>
                  <li>Any detected plagiarism or academic dishonesty may result in the revocation of earned certificates and account suspension.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1F1F1F]">3. User Account & Security</h3>
                <p>
                  You are responsible for safeguarding your login credentials. You agree to notify Crescentia immediately of any unauthorized use of your account. Accounts are non-transferable and may not be shared among multiple individuals.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1F1F1F]">4. License & Intellectual Property</h3>
                <p>
                  All course content, video lectures, coding resources, syllabus structures, and logos are the proprietary property of Crescentia and its respective instructors. You are granted a personal, limited, non-commercial, revocable license to view course materials for individual educational purposes only.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1F1F1F]">5. Certificates of Completion</h3>
                <p>
                  Verifiable digital certificates are awarded upon satisfactory completion of all required modules and achieving passing scores on final course assessments. Crescentia reserves the right to verify learner identity before granting accredited certificates.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1F1F1F]">6. Code of Conduct & Forum Rules</h3>
                <p>
                  Learners participating in Q&A forums, discussion boards, and peer notes must communicate respectfully. Harassment, abusive language, hate speech, and spamming are strictly prohibited and will result in immediate termination of forum privileges.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1F1F1F]">7. Termination of Service</h3>
                <p>
                  Crescentia reserves the right to suspend or terminate accounts that violate these Terms of Use, breach community standards, or engage in malicious activity that threatens platform stability.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1F1F1F]">1. Information We Collect</h3>
                <p>
                  We collect information necessary to provide an optimal learning experience, including:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#555555]">
                  <li><strong>Account Data:</strong> Your name, email address, password hash, and enrollment profile.</li>
                  <li><strong>Learning Progress:</strong> Video playback completion, quiz submission records, assessment scores, and streak data.</li>
                  <li><strong>Technical Telemetry:</strong> Browser type, operating system, and session tokens used for authentication.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1F1F1F]">2. How We Use Your Information</h3>
                <p>
                  Your information is utilized solely to:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#555555]">
                  <li>Manage your course enrollments and track lecture milestones.</li>
                  <li>Issue authentic, verifiable certificates of completion with unique validation IDs.</li>
                  <li>Provide customer support, course announcements, and platform updates.</li>
                  <li>Maintain platform security and prevent unauthorized access.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1F1F1F]">3. Data Sharing & Third Parties</h3>
                <p>
                  Crescentia does not sell, rent, or trade your personal information to third parties. Data is shared only with trusted infrastructure providers (such as database hosting and secure authentication services) under strict confidentiality agreements.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1F1F1F]">4. Data Protection & Security</h3>
                <p>
                  We implement industry-standard encryption protocols (TLS/SSL) for all data in transit and cryptographic hashing for stored user passwords.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1F1F1F]">5. Your Rights & Account Deletion</h3>
                <p>
                  You may update your profile name or change your password at any time from your account settings. You may also request deletion of your account and associated learning records by contacting support@crescentia.edu.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-[#E0E0E0] bg-[#F8F9FA] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#6A6F73]">
            Questions? Contact <span className="font-semibold text-[#1F1F1F]">legal@crescentia.edu</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#0056D2] hover:bg-[#00419E] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border-none shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>I Understand & Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;

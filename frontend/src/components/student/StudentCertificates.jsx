import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Download,
  CheckCircle2,
  Lock,
  ExternalLink,
  ShieldCheck,
  Calendar,
  ArrowRight,
  BookOpen,
  Share2,
  Check
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StudentCertificates = ({ enrollments = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [downloadingId, setDownloadingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (credentialId) => {
    navigator.clipboard.writeText(`${window.location.origin}/certificates#${credentialId}`);
    setCopiedId(credentialId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareLinkedIn = (title, credentialId) => {
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(title)}&organizationName=Crescentia&certUrl=${encodeURIComponent(window.location.origin + '/certificates')}&certId=${encodeURIComponent(credentialId)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const earnedCertificates = enrollments.filter(
    (e) => e.quizScore >= 70
  );

  const pendingCertificates = enrollments.filter(
    (e) => !e.quizScore || e.quizScore < 70
  );

  const handleDownload = async (courseId, title) => {
    try {
      setDownloadingId(courseId);
      const res = await api.get(`/enrollments/${courseId}/certificate`, {
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `crescentia-certificate-${title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Unable to generate certificate PDF. Ensure you passed the assessment with 70%+');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner - Redesigned with Coursera clean aesthetic & high contrast */}
      <div className="bg-white border border-[#D1D7DC] rounded-xl p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Top subtle brand accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0056D2] via-[#2A75E5] to-[#B4690E]" />

        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-[#B4690E]" />
            <span>Crescentia Verified Credentials</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1F1F1F]">
            Your Earned Certificates & Awards
          </h2>

          <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
            Each certificate earned represents proven mastery of course curriculum and successful completion of the final comprehensive assessment. All credentials carry verified authenticity and can be downloaded as official high-resolution PDF documents.
          </p>

          {/* Key trust badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 text-xs text-[#555555] font-medium">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0A8543]" />
              <span>Verifiable Credential ID</span>
            </span>
            <span className="text-[#D1D7DC] hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#0056D2]" />
              <span>Official PDF Export</span>
            </span>
            <span className="text-[#D1D7DC] hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0056D2]" />
              <span>70%+ Passing Grade Required</span>
            </span>
          </div>
        </div>

        {/* Right Stats Widget */}
        <div className="flex items-stretch gap-3 shrink-0 bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl">
          <div className="bg-white border border-[#E2E8F0] rounded-lg px-5 py-3.5 text-center min-w-[105px] shadow-2xs">
            <div className="text-3xl font-black text-[#0056D2]">
              {earnedCertificates.length}
            </div>
            <div className="text-[11px] font-bold text-[#1F1F1F] uppercase tracking-wider mt-0.5">
              Earned
            </div>
            <div className="text-[10px] text-[#0A8543] font-semibold mt-0.5">
              Unlocked
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg px-5 py-3.5 text-center min-w-[105px] shadow-2xs">
            <div className="text-3xl font-black text-[#64748B]">
              {pendingCertificates.length}
            </div>
            <div className="text-[11px] font-bold text-[#1F1F1F] uppercase tracking-wider mt-0.5">
              In Progress
            </div>
            <div className="text-[10px] text-[#555555] font-semibold mt-0.5">
              Ongoing
            </div>
          </div>
        </div>
      </div>

      {/* Earned Certificates Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F1F1F] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0A8543]" />
            <span>Verified Certificates ({earnedCertificates.length})</span>
          </h3>
          <span className="text-xs text-[#555555]">
            Click Download to generate high-resolution official PDF
          </span>
        </div>

        {earnedCertificates.length === 0 ? (
          <div className="bg-white border border-[#D1D7DC] rounded-lg p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F0F2F5] text-[#757575] flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-[#1F1F1F]">
              No certificates unlocked yet
            </div>
            <p className="text-xs text-[#555555] max-w-md mx-auto">
              Watch all curriculum lessons in your enrolled courses and score 70% or higher on the final assessment to earn your official certificate.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {earnedCertificates.map((e) => {
              const course = e.course;
              if (!course) return null;

              const credentialId = `CRS-${course._id.toString().slice(-6).toUpperCase()}-${user?._id.toString().slice(-4).toUpperCase()}`;
              const completionDate = e.quizSubmittedAt || e.updatedAt;

              return (
                <div
                  key={e._id}
                  className="bg-white border-2 border-[#0056D2]/20 hover:border-[#0056D2] rounded-xl p-6 shadow-xs hover:shadow-md transition-all space-y-4 relative overflow-hidden"
                >
                  {/* Decorative Corner Ribbon */}
                  <div className="absolute -right-12 -top-12 w-24 h-24 bg-[#EBF3FF] rotate-45 pointer-events-none" />

                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 relative z-10">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E6F4EA] text-[#0A8543] border border-[#A8DAB5] px-2 py-0.5 rounded inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified & Issued</span>
                      </span>
                      <h4 className="text-base font-bold text-[#1F1F1F] mt-2 leading-snug">
                        {course.title}
                      </h4>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Certificate Attributes */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8F9FA] p-3 rounded-lg border border-[#E0E0E0]">
                    <div>
                      <span className="text-[10px] text-[#6A6F73] block uppercase tracking-wider font-semibold">
                        Recipient
                      </span>
                      <span className="font-bold text-[#1F1F1F]">{user?.name}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#6A6F73] block uppercase tracking-wider font-semibold">
                        Grade Achieved
                      </span>
                      <span className="font-bold text-[#0A8543]">{e.quizScore}% (Passed)</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#6A6F73] block uppercase tracking-wider font-semibold">
                        Date of Issue
                      </span>
                      <span className="text-[#1F1F1F]">
                        {new Date(completionDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#6A6F73] block uppercase tracking-wider font-semibold">
                        Credential ID
                      </span>
                      <span className="font-mono text-[11px] text-[#0056D2] font-semibold">{credentialId}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      onClick={() => handleDownload(course._id, course.title)}
                      disabled={downloadingId === course._id}
                      className="flex-1 py-2.5 px-4 bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloadingId === course._id ? 'Generating PDF...' : 'Download Certificate (PDF)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareLinkedIn(course.title, credentialId)}
                      className="py-2.5 px-3.5 bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      title="Add certificate to LinkedIn Profile"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>LinkedIn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(credentialId)}
                      className="py-2.5 px-3 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1F1F1F] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Copy Verifiable Link"
                    >
                      {copiedId === credentialId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#0A8543]" />
                          <span className="text-[11px] text-[#0A8543] font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* In-Progress Certificates Roadmap */}
      {pendingCertificates.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#D1D7DC]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#555555] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#757575]" />
            <span>In-Progress Certificates ({pendingCertificates.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingCertificates.map((e) => {
              const course = e.course;
              if (!course) return null;

              const progress = e.progressPercent || 0;
              const hasAttempted = Boolean(e.quizSubmittedAt);

              return (
                <div
                  key={e._id}
                  className="bg-white border border-[#D1D7DC] rounded-lg p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0056D2] bg-[#EBF3FF] px-2 py-0.5 rounded">
                        {progress}% Complete
                      </span>
                      <h4 className="text-sm font-bold text-[#1F1F1F] mt-1.5">
                        {course.title}
                      </h4>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[#F0F2F5] text-[#757575] flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="space-y-1.5 text-xs text-[#555555] pt-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          (e.completedVideos?.length || 0) === (course.videos?.length || 1)
                            ? 'text-[#0A8543]'
                            : 'text-[#9E9E9E]'
                        }`}
                      />
                      <span>
                        Watch all video lessons ({e.completedVideos?.length || 0}/{course.videos?.length || 0})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          e.quizScore >= 70 ? 'text-[#0A8543]' : 'text-[#9E9E9E]'
                        }`}
                      />
                      <span>
                        Pass final assessment with 70%+ score{' '}
                        {hasAttempted && `(Current: ${e.quizScore}%)`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="w-full py-2 bg-white border border-[#D1D7DC] hover:border-[#0056D2] text-[#0056D2] text-xs font-bold rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    <span>Continue Working Toward Certificate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;

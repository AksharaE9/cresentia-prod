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
  BookOpen
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StudentCertificates = ({ enrollments = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [downloadingId, setDownloadingId] = useState(null);

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
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-[#0056D2] to-[#002A72] rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-300" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Crescentia Verified Credentials
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Your Earned Certificates & Awards
          </h2>
          <p className="text-xs text-blue-100 max-w-xl">
            Each certificate earned represents proven mastery of course curriculum and successful passing of the final comprehensive assessment. All certificates carry verifiable authenticity.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-4 rounded-lg shrink-0 border border-white/10">
          <div className="text-center">
            <div className="text-3xl font-black text-amber-300">{earnedCertificates.length}</div>
            <div className="text-[11px] text-blue-100 font-semibold">Earned</div>
          </div>
          <div className="h-8 w-[1px] bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-black text-white">{pendingCertificates.length}</div>
            <div className="text-[11px] text-blue-100 font-semibold">In Progress</div>
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
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => handleDownload(course._id, course.title)}
                      disabled={downloadingId === course._id}
                      className="flex-1 py-2.5 px-4 bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloadingId === course._id ? 'Generating PDF...' : 'Download Official Certificate'}</span>
                    </button>

                    <button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="p-2.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1F1F1F] rounded-md transition-colors"
                      title="Review Course"
                    >
                      <ExternalLink className="w-4 h-4" />
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

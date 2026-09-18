import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  ArrowLeft,
  ArrowRight,
  Award,
  Download,
  RotateCcw,
  Check,
  X,
  HelpCircle,
  ShieldCheck,
  FileCheck,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';

const AssessmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core state
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes default
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [honorAgreed, setHonorAgreed] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  // Fetch course and enrollment
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const courseRes = await api.get(`/courses/${id}`);
        setCourse(courseRes.data);

        const enrollmentRes = await api.get('/enrollments');
        const found = enrollmentRes.data.find((e) => e.course?._id === id);

        if (found) {
          setEnrollment(found);
          if (found.quizSubmittedAt) {
            setQuizSubmitted(true);
            setResult({
              score: found.quizScore,
              passed: found.quizScore >= 70
            });
          }
        }
      } catch (err) {
        console.error('Error loading assessment:', err);
        setError(err.response?.data?.message || 'Failed to load assessment data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Submit quiz handler
  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setShowSubmitModal(false);

      const { data } = await api.post(`/enrollments/${id}/quiz`, { answers });

      setResult({
        score: data.score,
        passed: data.passed,
        details: data.details
      });
      setQuizSubmitted(true);

      // Refresh enrollment
      const enrollmentRes = await api.get('/enrollments');
      const found = enrollmentRes.data.find((e) => e.course?._id === id);
      if (found) {
        setEnrollment(found);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert(err.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  }, [id, answers, submitting]);

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || quizSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizSubmitted, timeLeft, handleSubmit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIdx, optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
  };

  const toggleFlagQuestion = (idx) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleDownloadCertificate = async () => {
    try {
      setDownloadingCert(true);
      const response = await api.get(`/enrollments/${id}/certificate`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `crescentia-certificate-${course.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      alert('Failed to download certificate. Please ensure you achieved 70%+ score.');
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleRetake = () => {
    setQuizSubmitted(false);
    setQuizStarted(false);
    setAnswers({});
    setFlaggedQuestions({});
    setCurrentQuestionIndex(0);
    setTimeLeft(900);
    setResult(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="bg-white border border-[#D1D7DC] rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 border-4 border-[#0056D2] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-[#1F1F1F]">Loading course assessment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-red-600">Error Loading Assessment</h2>
          <p className="text-xs text-[#555555]">{error}</p>
          <button
            onClick={() => navigate(`/courses/${id}`)}
            className="w-full py-2.5 rounded-lg bg-[#0056D2] text-white text-xs font-bold hover:bg-[#00419E] transition-colors"
          >
            Return to Course Classroom
          </button>
        </div>
      </div>
    );
  }

  // Not enrolled
  if (!enrollment) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="bg-white border border-[#D1D7DC] rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-[#1F1F1F]">Enrollment Required</h2>
          <p className="text-xs text-[#555555]">
            You must be enrolled in this course to take the final certification assessment.
          </p>
          <button
            onClick={() => navigate(`/courses/${id}`)}
            className="w-full py-2.5 rounded-lg bg-[#0056D2] text-white text-xs font-bold hover:bg-[#00419E] transition-colors"
          >
            Go to Course & Enroll
          </button>
        </div>
      </div>
    );
  }

  // No questions available
  const questions = course?.quizQuestions || [];
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="bg-white border border-[#D1D7DC] rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <FileCheck className="w-12 h-12 text-[#6A6F73] mx-auto" />
          <h2 className="text-lg font-bold text-[#1F1F1F]">Assessment Under Preparation</h2>
          <p className="text-xs text-[#555555]">
            The instructor has not published quiz questions for this curriculum yet.
          </p>
          <button
            onClick={() => navigate(`/courses/${id}`)}
            className="w-full py-2.5 rounded-lg bg-[#0056D2] text-white text-xs font-bold hover:bg-[#00419E] transition-colors"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  // VIEW 1: RESULTS VIEW (After Exam Submission)
  if (quizSubmitted && result) {
    const isPassed = result.passed;

    return (
      <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#1F1F1F] selection:bg-[#EBF3FF] selection:text-[#0056D2] pb-16">
        {/* Top Header */}
        <header className="bg-white border-b border-[#D1D7DC] px-6 sm:px-12 py-4 sticky top-0 z-20">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to={`/courses/${id}`} className="flex items-center gap-2 text-xs font-bold text-[#0056D2] hover:underline">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Course</span>
            </Link>
            <div className="text-sm font-bold text-[#1F1F1F]">
              Assessment Report
            </div>
            <Link to="/dashboard" className="text-xs font-bold text-[#555555] hover:text-[#1F1F1F]">
              Go to Dashboard
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
          {/* Main Result Card */}
          <div className="bg-white border border-[#D1D7DC] rounded-2xl p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
            {/* Top Accent Strip */}
            <div
              className={`absolute top-0 left-0 right-0 h-2 ${
                isPassed ? 'bg-[#0A8543]' : 'bg-red-500'
              }`}
            />

            <div className="max-w-xl mx-auto space-y-4">
              <div
                className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
                  isPassed ? 'bg-[#E6F4EA] text-[#0A8543]' : 'bg-red-50 text-red-600'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-12 h-12" />
                ) : (
                  <X className="w-12 h-12" />
                )}
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F8F9FA] border border-[#D1D7DC]">
                {isPassed ? 'Official Certificate Earned' : 'Assessment Result'}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] tracking-tight">
                {isPassed ? 'Congratulations! You Passed' : 'Keep Practicing & Review'}
              </h1>

              <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                {isPassed
                  ? `You achieved ${result.score}%, successfully exceeding the 70% passing threshold for ${course.title}. Your accredited digital certificate is now available.`
                  : `You scored ${result.score}%. A minimum of 70% is required to earn the verified certificate. You can review the study lessons and retake the assessment.`}
              </p>

              {/* Large Score Metric */}
              <div className="pt-2">
                <div
                  className={`text-6xl font-black tracking-tight ${
                    isPassed ? 'text-[#0A8543]' : 'text-red-600'
                  }`}
                >
                  {result.score}%
                </div>
                <div className="text-xs font-semibold text-[#6A6F73] mt-1">
                  Passing Grade Required: 70%
                </div>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#E0E0E0] text-center">
                <div className="bg-[#F8F9FA] p-3 rounded-lg border border-[#E0E0E0]">
                  <div className="text-xs text-[#6A6F73] font-medium">Total Questions</div>
                  <div className="text-lg font-bold text-[#1F1F1F] mt-0.5">{questions.length}</div>
                </div>
                <div className="bg-[#F8F9FA] p-3 rounded-lg border border-[#E0E0E0]">
                  <div className="text-xs text-[#6A6F73] font-medium">Result Status</div>
                  <div className={`text-lg font-bold mt-0.5 ${isPassed ? 'text-[#0A8543]' : 'text-red-600'}`}>
                    {isPassed ? 'Passed' : 'Not Passed'}
                  </div>
                </div>
                <div className="bg-[#F8F9FA] p-3 rounded-lg border border-[#E0E0E0]">
                  <div className="text-xs text-[#6A6F73] font-medium">Credential Status</div>
                  <div className="text-lg font-bold text-[#0056D2] mt-0.5">
                    {isPassed ? 'Verified' : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
                {isPassed ? (
                  <>
                    <button
                      onClick={handleDownloadCertificate}
                      disabled={downloadingCert}
                      className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#0056D2] hover:bg-[#00419E] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloadingCert ? 'Generating Certificate...' : 'Download Official Certificate (PDF)'}</span>
                    </button>
                    <button
                      onClick={() => navigate('/certificates')}
                      className="w-full sm:w-auto px-5 py-3 rounded-lg bg-white border border-[#D1D7DC] hover:bg-[#F8F9FA] text-[#1F1F1F] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-[#0056D2]" />
                      <span>View in Credentials</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleRetake}
                      className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#0056D2] hover:bg-[#00419E] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake Assessment</span>
                    </button>
                    <button
                      onClick={() => navigate(`/courses/${id}`)}
                      className="w-full sm:w-auto px-5 py-3 rounded-lg bg-white border border-[#D1D7DC] hover:bg-[#F8F9FA] text-[#1F1F1F] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Review Course Lessons</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Question-by-Question Breakdown Card */}
          <div className="bg-white border border-[#D1D7DC] rounded-xl p-6 sm:p-8 shadow-xs space-y-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-[#D1D7DC]">
              <div>
                <h3 className="text-base font-bold text-[#1F1F1F]">Question Breakdown</h3>
                <p className="text-xs text-[#6A6F73]">Review your answers and curriculum explanations.</p>
              </div>
              <span className="text-xs font-bold text-[#555555]">
                {questions.length} Total Questions
              </span>
            </div>

            <div className="space-y-6">
              {questions.map((q, idx) => {
                const userSelected = answers[idx];
                const isCorrect = userSelected === q.correctAnswer;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-[#E0E0E0] bg-[#FDFDFD] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#EBF3FF] text-[#0056D2] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-[#1F1F1F] leading-snug">
                          {q.question}
                        </h4>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${
                          isCorrect
                            ? 'bg-[#E6F4EA] text-[#0A8543]'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Correct</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span>Incorrect</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {q.options.map((opt, oIdx) => {
                        const wasChosen = userSelected === oIdx;
                        const isRightOpt = q.correctAnswer === oIdx;
                        let cardStyle = 'border-[#E0E0E0] bg-white text-[#555555]';

                        if (wasChosen && isRightOpt) {
                          cardStyle = 'border-[#0A8543] bg-[#E6F4EA]/40 text-[#0A8543] font-bold';
                        } else if (wasChosen && !isRightOpt) {
                          cardStyle = 'border-red-400 bg-red-50 text-red-700 font-semibold';
                        } else if (isRightOpt) {
                          cardStyle = 'border-[#0A8543] bg-[#E6F4EA]/20 text-[#0A8543] font-semibold';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`p-3 rounded-lg border text-xs flex items-center justify-between ${cardStyle}`}
                          >
                            <span>{opt}</span>
                            {wasChosen && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/5">
                                Your choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-3 rounded-lg bg-[#F0F2F5] text-xs text-[#555555] leading-relaxed">
                        <strong className="text-[#1F1F1F]">Explanation: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // VIEW 2: PRE-ASSESSMENT START INSTRUCTIONS
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#1F1F1F] selection:bg-[#EBF3FF] selection:text-[#0056D2]">
        <header className="bg-white border-b border-[#D1D7DC] px-6 sm:px-12 py-4 sticky top-0 z-20">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate(`/courses/${id}`)}
              className="flex items-center gap-2 text-xs font-bold text-[#0056D2] hover:underline bg-transparent border-none cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Course</span>
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6A6F73]">
              Course Examination
            </span>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
          <div className="bg-white border border-[#D1D7DC] rounded-2xl p-8 sm:p-12 shadow-sm space-y-8 text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EBF3FF] text-[#0056D2] border border-[#C2DCFF]">
                <Award className="w-3.5 h-3.5" />
                <span>Certification Assessment</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] tracking-tight">
                {course.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                Test your mastery of the concepts, techniques, and best practices covered throughout the course modules. Achieving a passing score of 70% or higher issues your verified certificate.
              </p>
            </div>

            {/* Assessment Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#F8F9FA] border border-[#D1D7DC] rounded-xl p-4 text-center">
                <div className="text-xs text-[#6A6F73] font-bold uppercase tracking-wider">Questions</div>
                <div className="text-2xl font-black text-[#1F1F1F] mt-1">{questions.length}</div>
              </div>
              <div className="bg-[#F8F9FA] border border-[#D1D7DC] rounded-xl p-4 text-center">
                <div className="text-xs text-[#6A6F73] font-bold uppercase tracking-wider">Time Limit</div>
                <div className="text-2xl font-black text-[#0056D2] mt-1">15 Mins</div>
              </div>
              <div className="bg-[#F8F9FA] border border-[#D1D7DC] rounded-xl p-4 text-center">
                <div className="text-xs text-[#6A6F73] font-bold uppercase tracking-wider">Passing Score</div>
                <div className="text-2xl font-black text-[#0A8543] mt-1">70%</div>
              </div>
              <div className="bg-[#F8F9FA] border border-[#D1D7DC] rounded-xl p-4 text-center">
                <div className="text-xs text-[#6A6F73] font-bold uppercase tracking-wider">Attempts</div>
                <div className="text-2xl font-black text-[#1F1F1F] mt-1">
                  {enrollment?.quizAttempts || 0}
                </div>
              </div>
            </div>

            {/* Instructions list */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wider">
                Exam Instructions & Policies
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-[#555555] leading-relaxed list-none p-0">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#0A8543] shrink-0 mt-0.5" />
                  <span>
                    <strong>Timed Execution:</strong> You will have 15 minutes to complete all questions. Once started, the timer cannot be paused.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#0A8543] shrink-0 mt-0.5" />
                  <span>
                    <strong>Question Navigator:</strong> You can navigate between questions freely using the Question Palette and flag questions for review before submitting.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#0A8543] shrink-0 mt-0.5" />
                  <span>
                    <strong>Auto-Submission:</strong> If the timer expires before you submit, your answered questions will be automatically evaluated.
                  </span>
                </li>
              </ul>
            </div>

            {/* Academic Honor Code */}
            <div className="p-4 rounded-xl bg-[#EBF3FF]/60 border border-[#C2DCFF] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0056D2] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Academic Honor Code</span>
              </div>
              <label className="flex items-start gap-2.5 text-xs text-[#1F1F1F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={honorAgreed}
                  onChange={(e) => setHonorAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-[#757575] text-[#0056D2] focus:ring-[#0056D2]"
                />
                <span>
                  I affirm that I will complete this assessment independently, using only authorized curriculum materials, and will not share or duplicate exam questions.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => setQuizStarted(true)}
                disabled={!honorAgreed}
                className="w-full sm:flex-1 py-3.5 rounded-lg bg-[#0056D2] hover:bg-[#00419E] text-white font-bold text-sm transition-colors cursor-pointer border-none shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>Begin Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate(`/courses/${id}`)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-white border border-[#D1D7DC] hover:bg-[#F8F9FA] text-[#1F1F1F] text-sm font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // VIEW 3: ACTIVE EXAM IN PROGRESS
  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const isTimeCritical = timeLeft < 120; // less than 2 mins
  const isTimeWarning = timeLeft < 300; // less than 5 mins

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#1F1F1F] selection:bg-[#EBF3FF] selection:text-[#0056D2] flex flex-col">
      {/* Sticky Exam HUD Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#D1D7DC] shadow-xs px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6A6F73]">
              Assessment in progress
            </div>
            <h1 className="text-sm sm:text-base font-bold text-[#1F1F1F] truncate max-w-xs sm:max-w-md">
              {course.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer Badge */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border font-mono font-bold text-sm tracking-wider ${
                isTimeCritical
                  ? 'bg-red-50 text-red-600 border-red-300 animate-pulse'
                  : isTimeWarning
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-[#EBF3FF] text-[#0056D2] border-[#C2DCFF]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Submit Exam Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 rounded-lg bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold transition-colors cursor-pointer border-none shadow-xs"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </header>

      {/* Main Two-Column Exam Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (8 cols): Question Container */}
          <div className="lg:col-span-8 bg-white border border-[#D1D7DC] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Question Top Meta */}
            <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#0056D2] uppercase tracking-wider">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                {answers[currentQuestionIndex] !== undefined && (
                  <span className="text-[10px] font-bold bg-[#E6F4EA] text-[#0A8543] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Answered
                  </span>
                )}
              </div>

              {/* Flag for Review Toggle */}
              <button
                type="button"
                onClick={() => toggleFlagQuestion(currentQuestionIndex)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                  flaggedQuestions[currentQuestionIndex]
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-white border-[#D1D7DC] text-[#6A6F73] hover:text-[#1F1F1F]'
                }`}
              >
                <Flag
                  className={`w-3.5 h-3.5 ${
                    flaggedQuestions[currentQuestionIndex] ? 'fill-current' : ''
                  }`}
                />
                <span>
                  {flaggedQuestions[currentQuestionIndex] ? 'Flagged for Review' : 'Flag Question'}
                </span>
              </button>
            </div>

            {/* Question Statement */}
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#1F1F1F] leading-relaxed">
                {currentQ.question}
              </h2>
              <p className="text-xs text-[#6A6F73]">
                Select the single best answer from the options below:
              </p>
            </div>

            {/* Question Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((option, oIdx) => {
                const isSelected = answers[currentQuestionIndex] === oIdx;
                return (
                  <div
                    key={oIdx}
                    onClick={() => handleAnswerSelect(currentQuestionIndex, oIdx)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                      isSelected
                        ? 'border-[#0056D2] bg-[#EBF3FF]/60 shadow-xs'
                        : 'border-[#D1D7DC] bg-white hover:border-[#757575] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-[#0056D2] bg-[#0056D2] text-white'
                          : 'border-[#757575] bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isSelected ? 'font-bold text-[#0056D2]' : 'text-[#1F1F1F]'
                      }`}
                    >
                      {option}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Question Navigation Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-[#F0F2F5]">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-4 py-2.5 rounded-lg border border-[#D1D7DC] bg-white hover:bg-[#F8F9FA] text-[#1F1F1F] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs text-[#6A6F73] hidden sm:block">
                {questions.length - answeredCount} questions remaining
              </div>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-5 py-2.5 rounded-lg bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2.5 rounded-lg bg-[#0A8543] hover:bg-[#086a35] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Review & Submit</span>
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column (4 cols): Question Palette & Summary */}
          <div className="lg:col-span-4 space-y-4">
            {/* Palette Card */}
            <div className="bg-white border border-[#D1D7DC] rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                  Question Palette
                </h3>
                <span className="text-xs font-bold text-[#0056D2]">
                  {answeredCount} / {questions.length} Answered
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0056D2] rounded-full transition-all duration-300"
                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Grid of Question Badges */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                {questions.map((_, idx) => {
                  const isCurrent = currentQuestionIndex === idx;
                  const isAnswered = answers[idx] !== undefined;
                  const isFlagged = flaggedQuestions[idx];

                  let btnStyle = 'bg-[#F8F9FA] border-[#D1D7DC] text-[#555555] hover:border-[#757575]';

                  if (isCurrent) {
                    btnStyle = 'ring-2 ring-[#0056D2] border-[#0056D2] font-black text-[#0056D2] bg-white';
                  } else if (isFlagged) {
                    btnStyle = 'bg-amber-100 border-amber-400 text-amber-800 font-bold';
                  } else if (isAnswered) {
                    btnStyle = 'bg-[#0056D2] border-[#0056D2] text-white font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-10 rounded-lg border text-xs flex items-center justify-center relative transition-all cursor-pointer ${btnStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <div className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Palette Legend */}
              <div className="pt-4 border-t border-[#F0F2F5] grid grid-cols-2 gap-2.5 text-[11px] text-[#555555]">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-[#0056D2]" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-[#F8F9FA] border border-[#D1D7DC]" />
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-400" />
                  <span>Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded border-2 border-[#0056D2] bg-white" />
                  <span>Current</span>
                </div>
              </div>

              {/* Final Submit Button inside Palette */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-3 rounded-lg bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold transition-colors cursor-pointer border-none shadow-xs"
                >
                  Submit Assessment ({answeredCount}/{questions.length})
                </button>
              </div>
            </div>

            {/* Support Note */}
            <div className="p-4 rounded-xl bg-white border border-[#D1D7DC] text-xs text-[#6A6F73] space-y-1">
              <div className="font-bold text-[#1F1F1F]">Need assistance?</div>
              <p>Your answers are saved automatically as you make choices. Ensure you submit before the timer reaches 00:00.</p>
            </div>
          </div>

        </div>
      </main>

      {/* Confirmation Modal before Submit */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D1D7DC] max-w-md w-full p-6 sm:p-8 space-y-5 shadow-xl text-left">
            <div className="w-12 h-12 rounded-full bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#1F1F1F]">
                Ready to submit your assessment?
              </h3>
              <p className="text-xs text-[#555555] leading-relaxed">
                You have answered <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> questions.
                {questions.length - answeredCount > 0 && (
                  <span className="block mt-1 text-amber-600 font-semibold">
                    ⚠️ You have {questions.length - answeredCount} unanswered question(s). Unanswered questions are scored as 0.
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-lg bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold transition-colors cursor-pointer border-none shadow-xs disabled:opacity-50"
              >
                {submitting ? 'Evaluating...' : 'Yes, Submit Now'}
              </button>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-5 py-3 rounded-lg bg-white border border-[#D1D7DC] hover:bg-[#F8F9FA] text-[#1F1F1F] text-xs font-bold transition-colors cursor-pointer"
              >
                Back to Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  CheckCircle,
  PlayCircle,
  Clock,
  Award,
  BookOpen,
  Check,
  ChevronRight,
  FileCheck,
  AlertCircle,
  Download,
  Info,
  ChevronLeft,
  Star,
  MessageSquare,
  FileText,
  ThumbsUp,
  Trash2,
  Plus,
  Search,
  ExternalLink,
  HelpCircle,
  Share2
} from 'lucide-react';
import api from '../services/api';

const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [resolvedDurations, setResolvedDurations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'notes' | 'qa' | 'resources' | 'reviews'
  const [downloadingCert, setDownloadingCert] = useState(false);

  // Interactive Notes state (saved in localStorage)
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(`crescentia_notes_${id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newNote, setNewNote] = useState('');

  // Q&A state
  const [qaSearch, setQaSearch] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQTitle, setNewQTitle] = useState('');
  const [newQBody, setNewQBody] = useState('');
  const [questionsList, setQuestionsList] = useState([
    {
      id: 1,
      author: 'Kavita M.',
      role: 'Student',
      timeAgo: '2 days ago',
      title: 'How should we handle authentication state persistence on page refreshes?',
      body: 'In production, should tokens be kept in httpOnly cookies or in-memory context with silent refresh?',
      upvotes: 8,
      isUpvoted: false,
      answers: [
        {
          author: 'Crescentia Faculty',
          role: 'Instructor',
          isInstructor: true,
          timeAgo: '1 day ago',
          body: 'Great question! In high-security enterprise environments, httpOnly SameSite cookies combined with short-lived access tokens and refresh rotation is recommended.'
        }
      ]
    },
    {
      id: 2,
      author: 'Arjun N.',
      role: 'Student',
      timeAgo: '4 days ago',
      title: 'Any starter tips for the final certification assessment?',
      body: 'Are the questions primarily conceptual architectures or code-tracing syntax questions?',
      upvotes: 14,
      isUpvoted: false,
      answers: [
        {
          author: 'Teaching Assistant',
          role: 'TA',
          isInstructor: true,
          timeAgo: '3 days ago',
          body: 'The exam covers both architectural patterns and real-world debugging scenarios. Make sure to complete each lesson and practice the code examples!'
        }
      ]
    }
  ]);

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchEnrollment = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/enrollments');
      const found = data.find((e) => e.course?._id === id);
      if (found) {
        setEnrollment(found);
        if (found.completedVideos?.length > 0 && course?.videos?.length) {
          const lastCompleted = Math.max(...found.completedVideos);
          setCurrentVideoIndex(Math.min(lastCompleted + 1, course.videos.length - 1));
        }
      }
    } catch (err) {
      console.error('Error fetching enrollment:', err);
    }
  }, [id, user, course]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  useEffect(() => {
    if (course) {
      fetchEnrollment();
    }
  }, [course, fetchEnrollment]);

  const handleEnroll = async () => {
    try {
      const { data } = await api.post(`/enrollments/${id}`);
      setEnrollment(data);
      setMessage('Enrolled successfully! Welcome to the classroom.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to enroll');
    }
  };

  const markVideoCompleted = async (videoIndex) => {
    try {
      let currentEnrollment = enrollment;
      if (!currentEnrollment) {
        const enrollRes = await api.post(`/enrollments/${id}`);
        currentEnrollment = enrollRes.data;
        setEnrollment(currentEnrollment);
      }

      const { data } = await api.patch(`/enrollments/${id}/video-progress`, {
        videoIndex
      });
      setEnrollment(data);
      setMessage('Lesson marked as completed! Progress saved.');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setMessage('Failed to save lesson progress');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleVideoEnd = () => {
    if (!enrollment) return;
    if (!enrollment.completedVideos?.includes(currentVideoIndex)) {
      markVideoCompleted(currentVideoIndex);
    }
    if (currentVideoIndex < (course?.videos?.length || 0) - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const getVideoSource = (video) => {
    if (!video?.url) return { type: '', src: '' };
    if (video.url.includes('drive.google.com')) {
      const match = video.url.match(/\/d\/([^/]+)/);
      return {
        type: 'drive',
        src: match ? `https://drive.google.com/file/d/${match[1]}/preview` : video.url
      };
    }
    return { type: 'video', src: video.url.trim() };
  };

  const handleDownloadCertificate = async () => {
    try {
      setDownloadingCert(true);
      const res = await api.get(`/enrollments/${id}/certificate`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `crescentia-certificate-${course.title.replace(/\s+/g, '-').toLowerCase()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Unable to generate certificate PDF. Ensure you passed the assessment with at least 70%.');
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const noteObj = {
      id: Date.now(),
      lessonIndex: currentVideoIndex,
      lessonTitle: course?.videos?.[currentVideoIndex]?.title || `Lesson ${currentVideoIndex + 1}`,
      timestamp: '02:45',
      text: newNote.trim(),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    const updated = [noteObj, ...notes];
    setNotes(updated);
    try {
      localStorage.setItem(`crescentia_notes_${id}`, JSON.stringify(updated));
    } catch (e) {}
    setNewNote('');
    setMessage('Note saved successfully!');
    setTimeout(() => setMessage(''), 2500);
  };

  const handleDeleteNote = (noteId) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    try {
      localStorage.setItem(`crescentia_notes_${id}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleExportNotes = () => {
    if (!notes.length) return;
    const textContent = notes
      .map(
        (n) => `[${n.lessonTitle} - ${n.timestamp}] (${n.createdAt})\n${n.text}\n\n`
      )
      .join('---\n\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crescentia-notes-${course?.title?.replace(/\s+/g, '-').toLowerCase() || 'course'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!newQTitle.trim() || !newQBody.trim()) return;
    const qObj = {
      id: Date.now(),
      author: user?.name || 'Learner',
      role: 'Student',
      timeAgo: 'Just now',
      title: newQTitle.trim(),
      body: newQBody.trim(),
      upvotes: 0,
      isUpvoted: false,
      answers: []
    };
    setQuestionsList([qObj, ...questionsList]);
    setNewQTitle('');
    setNewQBody('');
    setShowAskModal(false);
    setMessage('Question posted to course discussion forum!');
    setTimeout(() => setMessage(''), 2500);
  };

  const handleToggleUpvote = (qId) => {
    setQuestionsList((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            upvotes: q.isUpvoted ? q.upvotes - 1 : q.upvotes + 1,
            isUpvoted: !q.isUpvoted
          };
        }
        return q;
      })
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg border border-[#D1D7DC] text-center space-y-3 max-w-sm">
          <div className="w-8 h-8 border-3 border-[#0056D2] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#1F1F1F]">Loading course classroom...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg border border-[#D1D7DC] text-center space-y-4 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <h2 className="text-base font-bold text-[#1F1F1F]">Error Loading Classroom</h2>
          <p className="text-xs text-[#555555]">{error || 'Course not found or unavailable'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="coursera-btn-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  const videos = course.videos || [];
  const currentVideo = videos[currentVideoIndex] || {};
  const currentSource = getVideoSource(currentVideo);
  const completedCount = enrollment?.completedVideos?.length || 0;
  const progressPercent = enrollment?.progressPercent || 0;
  const isCurrentCompleted = enrollment?.completedVideos?.includes(currentVideoIndex);
  const allVideosCompleted = videos.length > 0 && completedCount === videos.length;
  const hasPassedQuiz = (enrollment?.quizScore || 0) >= 70;

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-16">
      {/* Classroom Top Bar */}
      <div className="bg-white border-b border-[#D1D7DC] sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold text-[#0056D2] hover:text-[#00419E] flex items-center gap-1 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>

            <span className="text-[#D1D7DC] hidden sm:inline">|</span>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F0F2F5] text-[#555555] px-2 py-0.5 rounded shrink-0 hidden md:inline">
                {course.category || 'Curriculum'}
              </span>
              <h1 className="text-sm font-bold text-[#1F1F1F] truncate">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Progress Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] font-bold text-[#1F1F1F]">
                {progressPercent}% Complete
              </span>
              <span className="text-[10px] text-[#6A6F73]">
                {completedCount}/{videos.length} lessons
              </span>
            </div>
            <div className="w-20 sm:w-28 h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0056D2] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4">
          <div className="p-3 bg-[#E6F4EA] border border-[#A8DAB5] text-[#0A8543] rounded-md text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Main Classroom Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 2 Cols: Theater Video Player & Lesson Notes */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Frame */}
            <div className="bg-black rounded-lg overflow-hidden shadow-md aspect-video relative flex items-center justify-center">
              {currentSource.type === 'video' ? (
                <video
                  key={currentSource.src}
                  controls
                  preload="metadata"
                  poster={currentVideo.thumbnailUrl || course.thumbnail || undefined}
                  className="w-full h-full object-contain"
                  onEnded={handleVideoEnd}
                  src={currentSource.src}
                >
                  Your browser does not support the video tag.
                </video>
              ) : currentSource.type === 'drive' ? (
                <iframe
                  key={currentSource.src}
                  src={currentSource.src}
                  title={currentVideo.title}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-8 text-white space-y-2">
                  <PlayCircle className="w-12 h-12 mx-auto text-gray-500" />
                  <p className="text-xs text-gray-400">No video stream available for this lesson.</p>
                </div>
              )}
            </div>

            {/* Lesson Title & Action Bar */}
            <div className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0056D2] bg-[#EBF3FF] px-2 py-0.5 rounded">
                      Lesson {currentVideoIndex + 1} of {videos.length}
                    </span>
                    {isCurrentCompleted && (
                      <span className="text-xs font-bold text-[#0A8543] bg-[#E6F4EA] border border-[#A8DAB5] px-2 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-[#1F1F1F] mt-1.5">
                    {currentVideo.title || `Lesson ${currentVideoIndex + 1}`}
                  </h2>
                </div>

                {/* Video Controls / Mark Complete */}
                <div className="flex items-center gap-2">
                  {!isCurrentCompleted ? (
                    <button
                      onClick={() => markVideoCompleted(currentVideoIndex)}
                      className="coursera-btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark Lesson Completed</span>
                    </button>
                  ) : (
                    <div className="text-xs font-bold text-[#0A8543] flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Lesson Watched</span>
                    </div>
                  )}

                  {currentVideoIndex < videos.length - 1 && (
                    <button
                      onClick={() => setCurrentVideoIndex(currentVideoIndex + 1)}
                      className="px-3.5 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1F1F1F] text-xs font-bold rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Classroom Tabs (Coursera & Udemy Grade) */}
              <div className="border-t border-[#E0E0E0] pt-4">
                <div className="flex items-center gap-2 sm:gap-6 border-b border-[#E0E0E0] pb-2 text-xs font-bold overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-2 border-b-2 transition-colors shrink-0 ${
                      activeTab === 'overview'
                        ? 'border-[#0056D2] text-[#0056D2]'
                        : 'border-transparent text-[#757575] hover:text-[#1F1F1F]'
                    }`}
                  >
                    Overview
                  </button>

                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`pb-2 border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
                      activeTab === 'notes'
                        ? 'border-[#0056D2] text-[#0056D2]'
                        : 'border-transparent text-[#757575] hover:text-[#1F1F1F]'
                    }`}
                  >
                    <span>Notes</span>
                    <span className="text-[10px] bg-[#F0F2F5] px-1.5 py-0.2 rounded-full text-[#555555]">
                      {notes.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('qa')}
                    className={`pb-2 border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
                      activeTab === 'qa'
                        ? 'border-[#0056D2] text-[#0056D2]'
                        : 'border-transparent text-[#757575] hover:text-[#1F1F1F]'
                    }`}
                  >
                    <span>Q&A</span>
                    <span className="text-[10px] bg-[#F0F2F5] px-1.5 py-0.2 rounded-full text-[#555555]">
                      {questionsList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('resources')}
                    className={`pb-2 border-b-2 transition-colors shrink-0 ${
                      activeTab === 'resources'
                        ? 'border-[#0056D2] text-[#0056D2]'
                        : 'border-transparent text-[#757575] hover:text-[#1F1F1F]'
                    }`}
                  >
                    Resources
                  </button>

                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-2 border-b-2 transition-colors shrink-0 flex items-center gap-1 ${
                      activeTab === 'reviews'
                        ? 'border-[#0056D2] text-[#0056D2]'
                        : 'border-transparent text-[#757575] hover:text-[#1F1F1F]'
                    }`}
                  >
                    <span>Reviews</span>
                    <span className="text-[10px] text-[#B4690E] font-bold flex items-center">
                      ★ 4.8
                    </span>
                  </button>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="pt-4 space-y-4 text-left">
                    <div className="space-y-2 text-xs text-[#555555] leading-relaxed">
                      <p>
                        {currentVideo.description || course.description || 'Welcome to this curriculum lesson. Follow the demonstration, review the key code blocks, and practice in your local development environment.'}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[#6A6F73] pt-1">
                        <span>Instructor: <strong className="text-[#1F1F1F]">{course.instructorName || 'Crescentia Faculty'}</strong></span>
                        <span>•</span>
                        <span>Level: <strong className="text-[#1F1F1F]">{course.level || 'Beginner'}</strong></span>
                        <span>•</span>
                        <span>Category: <strong className="text-[#1F1F1F]">{course.category || 'Tech'}</strong></span>
                      </div>
                    </div>

                    {/* What You'll Learn Checklist */}
                    <div className="bg-[#F8F9FB] border border-[#D1D7DC] rounded-xl p-5 shadow-xs space-y-3">
                      <h3 className="text-sm font-bold text-[#1F1F1F]">
                        What you'll learn in this course
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#2D2F31]">
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#0A8543] shrink-0 mt-0.5" />
                          <span>Master core concepts and industry architectures in {course.category || 'this subject'}.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#0A8543] shrink-0 mt-0.5" />
                          <span>Hands-on implementation of production-ready patterns and workflows.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#0A8543] shrink-0 mt-0.5" />
                          <span>Industry-standard debugging, error handling, and performance tuning.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#0A8543] shrink-0 mt-0.5" />
                          <span>Prepare for the verified certification exam to earn accredited digital credentials.</span>
                        </div>
                      </div>
                    </div>

                    {/* Instructor Profile Card */}
                    <div className="bg-white border border-[#D1D7DC] rounded-xl p-5 shadow-xs">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A6F73] mb-3">Course Instructor</h3>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#EBF3FF] border border-[#C2DCFF] text-[#0056D2] font-black text-lg flex items-center justify-center shrink-0">
                          {(course.instructorName || 'Crescentia Faculty').charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-sm text-[#1F1F1F] flex items-center gap-2">
                            <span>{course.instructorName || 'Crescentia Senior Faculty'}</span>
                            <span className="text-[10px] bg-[#E6F4EA] text-[#0A8543] font-bold px-1.5 py-0.5 rounded">
                              Verified
                            </span>
                          </div>
                          <p className="text-xs text-[#6A6F73]">Lead Curriculum Architect & Industry Mentor</p>
                          <div className="flex items-center gap-3 text-xs text-[#555555] pt-1">
                            <span className="flex items-center gap-1 font-bold text-[#B4690E]">
                              <Star className="w-3.5 h-3.5 fill-[#E59819] text-[#E59819]" />
                              4.8 Rating
                            </span>
                            <span>•</span>
                            <span>12,450+ Learners</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: INTERACTIVE NOTES (Udemy-Grade) */}
                {activeTab === 'notes' && (
                  <div className="pt-4 space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#1F1F1F]">Your Course Notes</h3>
                        <p className="text-xs text-[#6A6F73]">Take timestamped study notes while watching lessons.</p>
                      </div>
                      {notes.length > 0 && (
                        <button
                          onClick={handleExportNotes}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D1D7DC] hover:bg-[#F8F9FA] text-[#0056D2] text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export (.txt)</span>
                        </button>
                      )}
                    </div>

                    {/* Add Note Form */}
                    <form onSubmit={handleAddNote} className="space-y-2 bg-[#F8F9FA] border border-[#D1D7DC] rounded-xl p-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1F1F1F] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#0056D2]" />
                          <span>Note for: {course?.videos?.[currentVideoIndex]?.title || `Lesson ${currentVideoIndex + 1}`}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#EBF3FF] text-[#0056D2] font-mono text-[11px] font-bold">
                          ⏱️ 02:45
                        </span>
                      </div>
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Type your takeaway, question, or key syntax here..."
                        rows={3}
                        className="w-full p-3 rounded-lg border border-[#757575] focus:border-[#0056D2] focus:ring-2 focus:ring-[#0056D2]/20 text-xs text-[#1F1F1F] placeholder:text-[#6A6F73] bg-white resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={!newNote.trim()}
                          className="px-4 py-2 rounded-lg bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Save Note</span>
                        </button>
                      </div>
                    </form>

                    {/* Saved Notes List */}
                    <div className="space-y-3">
                      {notes.length === 0 ? (
                        <div className="p-8 text-center bg-white border border-[#D1D7DC] rounded-xl space-y-2">
                          <FileText className="w-8 h-8 text-[#9CA3AF] mx-auto" />
                          <div className="text-xs font-bold text-[#1F1F1F]">No notes created yet</div>
                          <p className="text-xs text-[#6A6F73] max-w-sm mx-auto">
                            Add key formulas, code snippets, or lecture reminders above. They remain safely stored on this browser!
                          </p>
                        </div>
                      ) : (
                        notes.map((note) => (
                          <div
                            key={note.id}
                            className="bg-white border border-[#D1D7DC] rounded-xl p-4 shadow-2xs space-y-2 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-[#EBF3FF] text-[#0056D2] font-mono text-[11px] font-bold">
                                  {note.timestamp}
                                </span>
                                <span className="text-xs font-bold text-[#1F1F1F] truncate max-w-xs">
                                  {note.lessonTitle}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] text-[#6A6F73]">{note.createdAt}</span>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="text-[#6A6F73] hover:text-red-600 transition-colors p-1"
                                  title="Delete note"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-[#2D2F31] leading-relaxed whitespace-pre-wrap">
                              {note.text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: Q&A FORUM (Coursera-Grade) */}
                {activeTab === 'qa' && (
                  <div className="pt-4 space-y-4 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#1F1F1F]">Course Discussion & Q&A</h3>
                        <p className="text-xs text-[#6A6F73]">Ask questions, get help from instructors, and collaborate.</p>
                      </div>
                      <button
                        onClick={() => setShowAskModal(!showAskModal)}
                        className="px-4 py-2 rounded-lg bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ask a Question</span>
                      </button>
                    </div>

                    {/* Ask Question Form */}
                    {showAskModal && (
                      <form onSubmit={handleAskQuestion} className="p-4 rounded-xl bg-[#F8F9FA] border border-[#0056D2] space-y-3">
                        <div className="font-bold text-xs text-[#0056D2]">Post to Community Forum</div>
                        <div>
                          <input
                            type="text"
                            value={newQTitle}
                            onChange={(e) => setNewQTitle(e.target.value)}
                            placeholder="Title: e.g. What is the difference between state and props?"
                            className="w-full px-3 py-2 rounded border border-[#757575] text-xs text-[#1F1F1F] focus:border-[#0056D2] focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <textarea
                            value={newQBody}
                            onChange={(e) => setNewQBody(e.target.value)}
                            placeholder="Describe your question or scenario in detail..."
                            rows={3}
                            className="w-full p-3 rounded border border-[#757575] text-xs text-[#1F1F1F] focus:border-[#0056D2] focus:outline-none resize-none"
                            required
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAskModal(false)}
                            className="px-3 py-1.5 rounded border border-[#D1D7DC] text-xs font-bold text-[#555555] bg-white cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded bg-[#0056D2] text-white text-xs font-bold cursor-pointer hover:bg-[#00419E]"
                          >
                            Post Question
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Search Q&A */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#6A6F73] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={qaSearch}
                        onChange={(e) => setQaSearch(e.target.value)}
                        placeholder="Search all course questions..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#D1D7DC] text-xs text-[#1F1F1F] placeholder:text-[#6A6F73] bg-white focus:border-[#0056D2] focus:outline-none"
                      />
                    </div>

                    {/* Questions List */}
                    <div className="space-y-3">
                      {questionsList
                        .filter(
                          (q) =>
                            q.title.toLowerCase().includes(qaSearch.toLowerCase()) ||
                            q.body.toLowerCase().includes(qaSearch.toLowerCase())
                        )
                        .map((q) => (
                          <div
                            key={q.id}
                            className="bg-white border border-[#D1D7DC] rounded-xl p-4 shadow-2xs space-y-3"
                          >
                            <div className="flex items-start gap-3">
                              {/* Upvote Button */}
                              <button
                                onClick={() => handleToggleUpvote(q.id)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-colors cursor-pointer shrink-0 min-w-[44px] ${
                                  q.isUpvoted
                                    ? 'bg-[#EBF3FF] border-[#0056D2] text-[#0056D2]'
                                    : 'bg-[#F8F9FA] border-[#D1D7DC] text-[#6A6F73] hover:text-[#1F1F1F]'
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold mt-0.5">{q.upvotes}</span>
                              </button>

                              <div className="space-y-1 flex-1">
                                <h4 className="text-xs sm:text-sm font-bold text-[#1F1F1F] leading-snug">
                                  {q.title}
                                </h4>
                                <p className="text-xs text-[#555555] leading-relaxed">
                                  {q.body}
                                </p>
                                <div className="flex items-center gap-3 text-[11px] text-[#6A6F73] pt-1">
                                  <span>Asked by <strong className="text-[#1F1F1F]">{q.author}</strong></span>
                                  <span>•</span>
                                  <span>{q.timeAgo}</span>
                                </div>
                              </div>
                            </div>

                            {/* Answers Section */}
                            {q.answers.length > 0 && (
                              <div className="ml-12 pl-3 border-l-2 border-[#0056D2] space-y-2 pt-1">
                                {q.answers.map((ans, aIdx) => (
                                  <div key={aIdx} className="bg-[#F8F9FA] p-3 rounded-lg border border-[#E0E0E0] space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-[#1F1F1F]">{ans.author}</span>
                                      {ans.isInstructor && (
                                        <span className="text-[10px] bg-[#E6F4EA] text-[#0A8543] font-bold px-1.5 py-0.2 rounded">
                                          Instructor
                                        </span>
                                      )}
                                      <span className="text-[10px] text-[#6A6F73]">• {ans.timeAgo}</span>
                                    </div>
                                    <p className="text-xs text-[#2D2F31] leading-relaxed">
                                      {ans.body}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: RESOURCES & DOWNLOADS */}
                {activeTab === 'resources' && (
                  <div className="pt-4 space-y-4 text-left">
                    <div>
                      <h3 className="text-sm font-bold text-[#1F1F1F]">Course Resources & Attachments</h3>
                      <p className="text-xs text-[#6A6F73]">Download starter code, architecture diagrams, and lecture cheat sheets.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {[
                        {
                          title: 'Curriculum Lecture Slides',
                          type: 'PDF Document',
                          size: '4.8 MB',
                          desc: 'Full slide deck with architectural blueprints and lecture summaries.'
                        },
                        {
                          title: 'Starter Code & Boilerplate',
                          type: 'ZIP Archive',
                          size: '12.4 MB',
                          desc: 'Ready-to-run starter templates, dependencies, and environment files.'
                        },
                        {
                          title: 'Quick Reference Cheat Sheet',
                          type: 'PDF Document',
                          size: '1.2 MB',
                          desc: 'High-density syntax guide and debugging checklist for production.'
                        },
                        {
                          title: 'GitHub Project Repository',
                          type: 'Source Code Repo',
                          size: 'Live Git Repo',
                          desc: 'Browse complete branch commits and working implementation examples.'
                        }
                      ].map((item, rIdx) => (
                        <div
                          key={rIdx}
                          className="p-4 rounded-xl border border-[#D1D7DC] bg-white hover:border-[#0056D2] transition-colors shadow-2xs space-y-2 flex flex-col justify-between"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EBF3FF] text-[#0056D2] px-2 py-0.5 rounded">
                                {item.type}
                              </span>
                              <span className="text-[11px] text-[#6A6F73] font-mono">{item.size}</span>
                            </div>
                            <h4 className="text-xs font-bold text-[#1F1F1F] pt-1">{item.title}</h4>
                            <p className="text-xs text-[#555555] leading-relaxed">{item.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setMessage(`Downloading ${item.title}...`);
                              setTimeout(() => setMessage(''), 2500);
                            }}
                            className="w-full py-2 rounded-lg border border-[#D1D7DC] hover:bg-[#F8F9FA] text-[#0056D2] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Resource</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: REVIEWS & FEEDBACK */}
                {activeTab === 'reviews' && (
                  <div className="pt-4 space-y-6 text-left">
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#F0F2F5]">
                      {/* Score */}
                      <div className="text-center sm:text-left shrink-0">
                        <div className="text-5xl font-black text-[#B4690E]">4.8</div>
                        <div className="flex items-center justify-center sm:justify-start gap-1 text-[#E59819] my-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#E59819]" />
                          ))}
                        </div>
                        <div className="text-xs font-bold text-[#6A6F73]">Course Rating</div>
                      </div>

                      {/* Star Distribution Bars */}
                      <div className="flex-1 w-full space-y-2 text-xs">
                        {[
                          { stars: 5, pct: 82 },
                          { stars: 4, pct: 12 },
                          { stars: 3, pct: 4 },
                          { stars: 2, pct: 1 },
                          { stars: 1, pct: 1 }
                        ].map((item) => (
                          <div key={item.stars} className="flex items-center gap-3">
                            <div className="w-12 text-right font-medium text-[#555555]">{item.stars} stars</div>
                            <div className="flex-1 h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#E59819] rounded-full"
                                style={{ width: `${item.pct}%` }}
                              />
                            </div>
                            <div className="w-8 text-xs text-[#6A6F73] font-semibold">{item.pct}%</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verified Learner Reviews */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#6A6F73]">Verified Learner Reviews</h4>

                      <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-xs text-[#1F1F1F] flex items-center gap-1.5">
                            <span>Ananya S.</span>
                            <span className="text-[10px] text-[#0A8543] font-bold">Verified Graduate</span>
                          </div>
                          <div className="flex items-center gap-0.5 text-[#E59819]">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-[#E59819]" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-[#555555] leading-relaxed">
                          "Exceptionally well structured. The bite-sized video lessons made it easy to learn every evening after work, and the final quiz tested genuine understanding."
                        </p>
                      </div>

                      <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-xs text-[#1F1F1F] flex items-center gap-1.5">
                            <span>Vikram K.</span>
                            <span className="text-[10px] text-[#0A8543] font-bold">Verified Graduate</span>
                          </div>
                          <div className="flex items-center gap-0.5 text-[#E59819]">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-[#E59819]" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-[#555555] leading-relaxed">
                          "The curriculum covers practical implementations that are directly applicable in production. Being able to download the verified certificate was the cherry on top."
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Sticky Curriculum Syllabus & Assessment Card */}
          <div className="space-y-4">
            {/* Syllabus Card */}
            <div className="bg-white border border-[#D1D7DC] rounded-lg shadow-xs overflow-hidden">
              <div className="p-4 bg-[#F8F9FA] border-b border-[#D1D7DC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#0056D2]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                    Curriculum Lessons ({videos.length})
                  </h3>
                </div>
                <span className="text-[11px] text-[#6A6F73]">
                  {completedCount}/{videos.length} Done
                </span>
              </div>

              <div className="divide-y divide-[#E0E0E0] max-h-[420px] overflow-y-auto">
                {videos.map((video, idx) => {
                  const isCompleted = enrollment?.completedVideos?.includes(idx);
                  const isCurrent = idx === currentVideoIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentVideoIndex(idx)}
                      className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#EBF3FF] border-l-4 border-[#0056D2]'
                          : 'bg-white hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-[#E6F4EA] text-[#0A8543] flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-5 h-5 rounded-full bg-[#0056D2] text-white flex items-center justify-center">
                            <PlayCircle className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#F0F2F5] text-[#555555] text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-xs leading-snug line-clamp-2 ${
                            isCurrent ? 'font-bold text-[#0056D2]' : 'font-semibold text-[#1F1F1F]'
                          }`}
                        >
                          {video.title || `Lesson ${idx + 1}`}
                        </div>
                        <div className="text-[10px] text-[#6A6F73] flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {video.durationMinutes || 15} mins
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assessment & Certificate Card */}
            {course.quizQuestions?.length > 0 && (
              <div className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#0056D2]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                    Final Assessment & Certificate
                  </h4>
                </div>

                {hasPassedQuiz ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#E6F4EA] border border-[#A8DAB5] rounded-md text-xs space-y-1">
                      <div className="font-bold text-[#0A8543] flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Assessment Passed ({enrollment.quizScore}%)</span>
                      </div>
                      <p className="text-[11px] text-[#555555]">
                        You unlocked the official verified Certificate of Completion for this course.
                      </p>
                    </div>

                    <button
                      onClick={handleDownloadCertificate}
                      disabled={downloadingCert}
                      className="w-full py-2.5 bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold rounded flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloadingCert ? 'Generating PDF...' : 'Download Official Certificate'}</span>
                    </button>

                    <Link
                      to={`/courses/${id}/assessment`}
                      className="block text-center text-xs font-semibold text-[#0056D2] hover:underline"
                    >
                      Review Assessment Results
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-[#555555]">
                      Test your understanding across {course.quizQuestions.length} multiple choice questions. Pass with 70%+ to claim your verified certificate.
                    </p>

                    {allVideosCompleted ? (
                      <Link
                        to={`/courses/${id}/assessment`}
                        className="coursera-btn-primary block text-center py-2.5 text-xs font-bold"
                      >
                        Start Final Assessment ({course.quizQuestions.length} Qs)
                      </Link>
                    ) : (
                      <div className="p-3 bg-[#FFF4E5] border border-[#FFE0B2] rounded-md text-xs text-[#B76E00] space-y-1">
                        <span className="font-bold block">Assessment Locked</span>
                        <span>
                          Complete all {videos.length} curriculum lessons to unlock the final exam.
                        </span>
                        <div className="text-[11px] text-[#757575] pt-1">
                          {completedCount}/{videos.length} completed
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Course Features / What's Included (Udemy & Coursera style) */}
            <div className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs text-left space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                This Course Includes
              </h4>
              <ul className="space-y-2.5 text-xs text-[#555555]">
                <li className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-[#0056D2]" />
                  <span>{videos.length} on-demand video lessons</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#0056D2]" />
                  <span>Verifiable Certificate of Completion</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#0056D2]" />
                  <span>Timed final assessment with instant credential</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0056D2]" />
                  <span>Self-paced access on desktop and mobile</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;

import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  User,
  Bell,
  Play,
  CheckCircle,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  GraduationCap,
  Compass
} from 'lucide-react';
import api from '../services/api';
import StudentMyCourses from '../components/student/StudentMyCourses';
import StudentProgress from '../components/student/StudentProgress';
import StudentProfile from '../components/student/StudentProfile';
import StudentCertificates from '../components/student/StudentCertificates';
import StudentNotifications from '../components/student/StudentNotifications';

const StudentDashboardPage = ({ defaultTab = 'overview' }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab state: 'overview' | 'courses' | 'progress' | 'certificates' | 'profile' | 'notifications'
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  // Sync tab from pathname or prop
  useEffect(() => {
    const path = location.pathname;
    if (path === '/my-courses') setActiveTab('courses');
    else if (path === '/progress') setActiveTab('progress');
    else if (path === '/certificates') setActiveTab('certificates');
    else if (path === '/profile') setActiveTab('profile');
    else if (path === '/notifications') setActiveTab('notifications');
    else if (path === '/dashboard') setActiveTab('overview');
  }, [location.pathname]);

  const loadStudentData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [enrollRes, notifRes] = await Promise.allSettled([
        api.get('/enrollments'),
        api.get('/notifications')
      ]);

      if (enrollRes.status === 'fulfilled') {
        setEnrollments(enrollRes.value.data || []);
      }
      if (notifRes.status === 'fulfilled') {
        setUnreadNotifsCount(notifRes.value.data?.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
      setError('Unable to load enrollment records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') navigate('/dashboard');
    else if (tab === 'courses') navigate('/my-courses');
    else if (tab === 'progress') navigate('/progress');
    else if (tab === 'certificates') navigate('/certificates');
    else if (tab === 'profile') navigate('/profile');
    else if (tab === 'notifications') navigate('/notifications');
  };

  // Metrics
  const totalCourses = enrollments.length;
  const inProgress = enrollments.filter((e) => (e.progressPercent || 0) < 100 && (!e.quizScore || e.quizScore < 70));
  const completed = enrollments.filter((e) => e.progressPercent === 100 || (e.quizScore >= 70));
  const earnedCerts = enrollments.filter((e) => e.quizScore >= 70);

  const attemptedQuizzes = enrollments.filter((e) => e.quizSubmittedAt);
  const averageGrade = attemptedQuizzes.length > 0
    ? Math.round(attemptedQuizzes.reduce((sum, e) => sum + (e.quizScore || 0), 0) / attemptedQuizzes.length)
    : 0;

  // Active focus course (first in-progress course, or first course)
  const activeFocus = inProgress[0] || enrollments[0];

  const initials = (user?.name || 'S')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-16">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0056D2] via-[#0047BA] to-[#002F75] p-6 sm:p-8 text-white shadow-md border border-[#00419E]">
          {/* Ambient Glow Elements */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
          <div className="absolute right-1/3 -bottom-20 w-48 h-48 rounded-full bg-blue-400/10 pointer-events-none blur-xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: User Identity & Welcome */}
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-[#0056D2] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg ring-4 ring-white/20 shrink-0">
                {initials}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white border border-white/25 backdrop-blur-md uppercase tracking-wider shadow-xs">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-200" />
                    Student Learning Portal
                  </span>
                  <span className="text-xs font-medium" style={{ color: '#D4E6FF' }}>
                    • {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Welcome back, {user?.name || 'Learner'}!
                </h1>

                <p
                  className="text-xs sm:text-sm max-w-xl font-normal leading-relaxed"
                  style={{ color: '#EBF3FF' }}
                >
                  Continue your learning path, track your curriculum progress, and unlock verified certificates.
                </p>
              </div>
            </div>

            {/* Right: Quick Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => switchTab('courses')}
                className="px-5 py-3 rounded-lg bg-white text-[#0056D2] hover:bg-[#EBF3FF] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#0056D2]" />
                <span>My Courses ({totalCourses})</span>
              </button>

              <button
                onClick={() => navigate('/courses')}
                className="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-white" />
                <span>Browse Catalog</span>
              </button>
            </div>
          </div>
        </div>
        {/* Navigation Tabs Bar */}
        <div className="bg-white border border-[#D1D7DC] rounded-lg shadow-xs overflow-x-auto">
          <div className="flex border-b border-[#D1D7DC] min-w-max">
            <button
              onClick={() => switchTab('overview')}
              className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-[#0056D2] text-[#0056D2] bg-[#EBF3FF]/30'
                  : 'border-transparent text-[#555555] hover:text-[#1F1F1F]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => switchTab('courses')}
              className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'courses'
                  ? 'border-[#0056D2] text-[#0056D2] bg-[#EBF3FF]/30'
                  : 'border-transparent text-[#555555] hover:text-[#1F1F1F]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>My Courses ({totalCourses})</span>
            </button>

            <button
              onClick={() => switchTab('progress')}
              className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'progress'
                  ? 'border-[#0056D2] text-[#0056D2] bg-[#EBF3FF]/30'
                  : 'border-transparent text-[#555555] hover:text-[#1F1F1F]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Progress & Analytics</span>
            </button>

            <button
              onClick={() => switchTab('certificates')}
              className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'certificates'
                  ? 'border-[#0056D2] text-[#0056D2] bg-[#EBF3FF]/30'
                  : 'border-transparent text-[#555555] hover:text-[#1F1F1F]'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Certificates ({earnedCerts.length})</span>
            </button>

            <button
              onClick={() => switchTab('profile')}
              className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-[#0056D2] text-[#0056D2] bg-[#EBF3FF]/30'
                  : 'border-transparent text-[#555555] hover:text-[#1F1F1F]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile & Account</span>
            </button>

            <button
              onClick={() => switchTab('notifications')}
              className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'notifications'
                  ? 'border-[#0056D2] text-[#0056D2] bg-[#EBF3FF]/30'
                  : 'border-transparent text-[#555555] hover:text-[#1F1F1F]'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
              {unreadNotifsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div
                onClick={() => switchTab('courses')}
                className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] rounded-lg p-4 shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
                    Enrolled
                  </span>
                  <BookOpen className="w-4 h-4 text-[#0056D2]" />
                </div>
                <div className="mt-2 text-2xl font-black text-[#1F1F1F]">
                  {totalCourses}
                </div>
                <div className="text-[11px] text-[#6A6F73] mt-1 group-hover:text-[#0056D2] transition-colors">
                  Assigned courses →
                </div>
              </div>

              <div
                onClick={() => switchTab('courses')}
                className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] rounded-lg p-4 shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
                    In Progress
                  </span>
                  <Clock className="w-4 h-4 text-[#B76E00]" />
                </div>
                <div className="mt-2 text-2xl font-black text-[#1F1F1F]">
                  {inProgress.length}
                </div>
                <div className="text-[11px] text-[#6A6F73] mt-1 group-hover:text-[#0056D2] transition-colors">
                  Active learning →
                </div>
              </div>

              <div
                onClick={() => switchTab('courses')}
                className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] rounded-lg p-4 shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
                    Completed
                  </span>
                  <CheckCircle className="w-4 h-4 text-[#0A8543]" />
                </div>
                <div className="mt-2 text-2xl font-black text-[#1F1F1F]">
                  {completed.length}
                </div>
                <div className="text-[11px] text-[#6A6F73] mt-1 group-hover:text-[#0056D2] transition-colors">
                  Finished courses →
                </div>
              </div>

              <div
                onClick={() => switchTab('certificates')}
                className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] rounded-lg p-4 shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
                    Certificates
                  </span>
                  <Award className="w-4 h-4 text-[#0056D2]" />
                </div>
                <div className="mt-2 text-2xl font-black text-[#0056D2]">
                  {earnedCerts.length}
                </div>
                <div className="text-[11px] text-[#6A6F73] mt-1 group-hover:text-[#0056D2] transition-colors">
                  Official credentials →
                </div>
              </div>

              <div
                onClick={() => switchTab('progress')}
                className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] rounded-lg p-4 shadow-xs transition-all cursor-pointer group col-span-2 lg:col-span-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
                    Avg. Grade
                  </span>
                  <TrendingUp className="w-4 h-4 text-[#0A8543]" />
                </div>
                <div className="mt-2 text-2xl font-black text-[#1F1F1F]">
                  {averageGrade > 0 ? `${averageGrade}%` : 'N/A'}
                </div>
                <div className="text-[11px] text-[#6A6F73] mt-1 group-hover:text-[#0056D2] transition-colors">
                  Assessment history →
                </div>
              </div>
            </div>

            {/* Current Focus Course Hero */}
            {activeFocus?.course ? (
              <div className="bg-white border border-[#D1D7DC] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EBF3FF] text-[#0056D2] border border-[#C2DCFF] px-2.5 py-0.5 rounded">
                      Current Focus
                    </span>
                    <span className="text-xs text-[#6A6F73]">
                      Category: {activeFocus.course.category || 'Curriculum'}
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-[#1F1F1F] leading-snug">
                    {activeFocus.course.title}
                  </h2>

                  <p className="text-xs text-[#555555] line-clamp-2">
                    {activeFocus.course.description}
                  </p>

                  {/* Progress info */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1F1F1F]">
                        {activeFocus.progressPercent || 0}% Completed
                      </span>
                      <span className="text-[#6A6F73]">
                        {activeFocus.completedVideos?.length || 0} of {activeFocus.course.videos?.length || 0} lessons watched
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0056D2] rounded-full"
                        style={{ width: `${activeFocus.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 md:min-w-[200px]">
                  <button
                    onClick={() => navigate(`/courses/${activeFocus.course._id}`)}
                    className="coursera-btn-primary flex items-center justify-center gap-2 py-3 px-6 shadow-xs"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume Course</span>
                  </button>

                  <button
                    onClick={() => switchTab('courses')}
                    className="py-2 px-4 bg-white border border-[#D1D7DC] hover:border-[#757575] text-[#1F1F1F] text-xs font-bold rounded transition-colors text-center"
                  >
                    View All My Courses
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#D1D7DC] rounded-xl p-10 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-[#0056D2] mx-auto" />
                <h3 className="text-base font-bold text-[#1F1F1F]">
                  You have no active courses assigned
                </h3>
                <p className="text-xs text-[#555555] max-w-sm mx-auto">
                  Browse the catalog or contact your institution administrator to get enrolled in courses.
                </p>
                <button
                  onClick={() => navigate('/courses')}
                  className="coursera-btn-primary inline-flex items-center gap-2 mt-2"
                >
                  <span>Explore Course Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => switchTab('certificates')}
                className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] rounded-lg p-5 shadow-xs transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#1F1F1F] group-hover:text-[#0056D2] transition-colors">
                  Official Certificates
                </h4>
                <p className="text-xs text-[#555555]">
                  View and download verifiable PDF certificates for courses where you passed the final assessment.
                </p>
              </div>

              <div
                onClick={() => switchTab('progress')}
                className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] rounded-lg p-5 shadow-xs transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#E6F4EA] text-[#0A8543] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#1F1F1F] group-hover:text-[#0056D2] transition-colors">
                  Learning Analytics
                </h4>
                <p className="text-xs text-[#555555]">
                  Track your curriculum milestones, assessment attempt scores, and overall learning rate.
                </p>
              </div>

              <div
                onClick={() => switchTab('notifications')}
                className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] rounded-lg p-5 shadow-xs transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FFF4E5] text-[#B76E00] flex items-center justify-center relative">
                  <Bell className="w-5 h-5" />
                  {unreadNotifsCount > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 absolute top-1 right-1" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-[#1F1F1F] group-hover:text-[#0056D2] transition-colors">
                  Personalized Notifications
                </h4>
                <p className="text-xs text-[#555555]">
                  Stay updated on new course assignments, assessment results, and earned certificates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: My Courses */}
        {activeTab === 'courses' && (
          <StudentMyCourses
            enrollments={enrollments}
            onRefresh={loadStudentData}
          />
        )}

        {/* Tab 3: Progress & Analytics */}
        {activeTab === 'progress' && (
          <StudentProgress enrollments={enrollments} />
        )}

        {/* Tab 4: Certificates */}
        {activeTab === 'certificates' && (
          <StudentCertificates enrollments={enrollments} />
        )}

        {/* Tab 5: Profile */}
        {activeTab === 'profile' && (
          <StudentProfile enrollments={enrollments} />
        )}

        {/* Tab 6: Notifications */}
        {activeTab === 'notifications' && (
          <StudentNotifications
            onRefreshBadge={(count) => setUnreadNotifsCount(count)}
          />
        )}
      </div>
    </div>
  );
};

export default StudentDashboardPage;

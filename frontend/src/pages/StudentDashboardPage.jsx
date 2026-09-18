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
  GraduationCap,
  Compass,
  Menu,
  X,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import api from '../services/api';
import StudentMyCourses from '../components/student/StudentMyCourses';
import StudentProgress from '../components/student/StudentProgress';
import StudentProfile from '../components/student/StudentProfile';
import StudentCertificates from '../components/student/StudentCertificates';
import StudentNotifications from '../components/student/StudentNotifications';

const StudentDashboardPage = ({ defaultTab = 'overview' }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/my-courses') setActiveTab('courses');
    else if (path === '/progress') setActiveTab('progress');
    else if (path === '/certificates') setActiveTab('certificates');
    else if (path === '/profile') setActiveTab('profile');
    else if (path === '/notifications') setActiveTab('notifications');
    else if (path === '/dashboard') setActiveTab('overview');
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') setIsSidebarOpen(false); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isSidebarOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  const loadStudentData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [enrollRes, notifRes] = await Promise.allSettled([
        api.get('/enrollments'),
        api.get('/notifications')
      ]);
      if (enrollRes.status === 'fulfilled') setEnrollments(enrollRes.value.data || []);
      if (notifRes.status === 'fulfilled') setUnreadNotifsCount(notifRes.value.data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
      setError('Unable to load enrollment records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStudentData(); }, [loadStudentData]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    if (tab === 'overview') navigate('/dashboard');
    else if (tab === 'courses') navigate('/my-courses');
    else if (tab === 'progress') navigate('/progress');
    else if (tab === 'certificates') navigate('/certificates');
    else if (tab === 'profile') navigate('/profile');
    else if (tab === 'notifications') navigate('/notifications');
  };

  const handleLogout = async () => {
    setIsSidebarOpen(false);
    try { if (logout) await logout(); } catch (e) {}
    navigate('/login');
  };

  const totalCourses = enrollments.length;
  const inProgress = enrollments.filter((e) => (e.progressPercent || 0) < 100 && (!e.quizScore || e.quizScore < 70));
  const completed = enrollments.filter((e) => e.progressPercent === 100 || (e.quizScore >= 70));
  const earnedCerts = enrollments.filter((e) => e.quizScore >= 70);
  const attemptedQuizzes = enrollments.filter((e) => e.quizSubmittedAt);
  const averageGrade = attemptedQuizzes.length > 0
    ? Math.round(attemptedQuizzes.reduce((sum, e) => sum + (e.quizScore || 0), 0) / attemptedQuizzes.length)
    : 0;
  const activeFocus = inProgress[0] || enrollments[0];
  const initials = (user?.name || 'S').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  const navItems = [
    { key: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
    { key: 'courses', label: `My Courses (${totalCourses})`, icon: BookOpen },
    { key: 'progress', label: 'Progress & Analytics', icon: TrendingUp },
    { key: 'certificates', label: `Certificates (${earnedCerts.length})`, icon: Award },
    { key: 'profile', label: 'Profile & Account', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount },
  ];

  const activeLabel = navItems.find(n => n.key === activeTab)?.label || 'Dashboard';
  const ActiveIcon = navItems.find(n => n.key === activeTab)?.icon || BarChart3;

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-16">

      {/* SIDEBAR BACKDROP */}
      <div
        onClick={() => setIsSidebarOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)',
          transition: 'opacity 0.25s ease',
          opacity: isSidebarOpen ? 1 : 0,
          pointerEvents: isSidebarOpen ? 'auto' : 'none',
        }}
      />

      {/* SIDEBAR DRAWER */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100%',
        width: '290px', maxWidth: 'calc(100vw - 3rem)',
        zIndex: 70,
        background: 'linear-gradient(160deg, #0a1628 0%, #0e2044 50%, #0056D2 100%)',
        boxShadow: '8px 0 40px rgba(0,0,0,0.35)',
        display: 'flex', flexDirection: 'column',
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 20px 20px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'16px', fontWeight:'900' }}>
              {initials}
            </div>
            <div>
              <div style={{ color:'white', fontWeight:'700', fontSize:'13px', lineHeight:1.2 }}>{user?.name || 'Student'}</div>
              <div style={{ color:'rgba(180,210,255,0.8)', fontSize:'11px', marginTop:'2px' }}>Student Portal</div>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ flex:1, overflowY:'auto', padding:'16px 12px', display:'flex', flexDirection:'column', gap:'4px' }}>
          <div style={{ color:'rgba(160,200,255,0.6)', fontSize:'10px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1.2px', padding:'0 8px', marginBottom:'8px' }}>Navigation</div>
          {navItems.map(({ key, label, icon: Icon, badge }) => {
            const isActive = activeTab === key;
            return (
              <button key={key} onClick={() => switchTab(key)} style={{
                display:'flex', alignItems:'center', gap:'12px', padding:'11px 14px', borderRadius:'10px',
                border: isActive ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent',
                background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                color: isActive ? 'white' : 'rgba(180,210,255,0.75)',
                fontWeight: isActive ? '700' : '500', fontSize:'13px',
                cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.15s ease', position:'relative',
              }}>
                {isActive && <div style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width:'3px', height:'60%', borderRadius:'0 3px 3px 0', background:'white' }} />}
                <Icon size={17} style={{ flexShrink:0, opacity: isActive ? 1 : 0.75 }} />
                <span style={{ flex:1 }}>{label}</span>
                {badge > 0 && <span style={{ minWidth:'20px', height:'20px', borderRadius:'10px', background:'#ef4444', color:'white', fontSize:'10px', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 5px' }}>{badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding:'16px 12px', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => { setIsSidebarOpen(false); navigate('/courses'); }} style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'10px 14px', borderRadius:'10px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(180,210,255,0.85)', fontWeight:'600', fontSize:'13px', cursor:'pointer', marginBottom:'8px' }}>
            <Compass size={16} />
            <span>Browse Course Catalog</span>
          </button>
          <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'10px 14px', borderRadius:'10px', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.2)', color:'rgba(252,165,165,0.9)', fontWeight:'600', fontSize:'13px', cursor:'pointer' }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0056D2] via-[#0047BA] to-[#002F75] p-6 sm:p-8 text-white shadow-md border border-[#00419E]">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
          <div className="absolute right-1/3 -bottom-20 w-48 h-48 rounded-full bg-blue-400/10 pointer-events-none blur-xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-[#0056D2] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg ring-4 ring-white/20 shrink-0">
                {initials}
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white border border-white/25 backdrop-blur-md uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-200" />
                    Student Learning Portal
                  </span>
                  <span className="text-xs font-medium" style={{ color: '#D4E6FF' }}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Welcome back, {user?.name || 'Learner'}!
                </h1>
                <p className="text-xs sm:text-sm max-w-xl font-normal leading-relaxed" style={{ color: '#EBF3FF' }}>
                  Continue your learning path, track your curriculum progress, and unlock verified certificates.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button onClick={() => switchTab('courses')} className="px-5 py-3 rounded-lg bg-white text-[#0056D2] hover:bg-[#EBF3FF] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow cursor-pointer">
                <BookOpen className="w-4 h-4 text-[#0056D2]" />
                <span>My Courses ({totalCourses})</span>
              </button>
              <button onClick={() => navigate('/courses')} className="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Compass className="w-4 h-4 text-white" />
                <span>Browse Catalog</span>
              </button>
              {/* Hamburger button */}
              <button onClick={() => setIsSidebarOpen(true)} className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer" title="Open navigation menu">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Context Bar showing active section + hamburger */}
        <div className="flex items-center justify-between bg-white border border-[#D1D7DC] rounded-lg shadow-xs px-5 py-3">
          <div className="flex items-center gap-3">
            <ActiveIcon className="w-4 h-4 text-[#0056D2]" />
            <span className="text-sm font-bold text-[#1F1F1F]">{activeLabel}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0056D2] hover:bg-[#0047BA] text-white font-bold text-xs transition-all cursor-pointer shadow-sm">
            <Menu className="w-4 h-4" />
            <span>Menu</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div onClick={() => switchTab('courses')} className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] rounded-lg p-4 shadow-xs transition-all cursor-pointer group">
                <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#555555]">Enrolled</span><BookOpen className="w-4 h-4 text-[#0056D2]" /></div>
                <div className="mt-2 text-2xl font-black text-[#1F1F1F]">{totalCourses}</div>
                <div className="text-[11px] text-[#6A6F73] mt-1 group-hover:text-[#0056D2] transition-colors">Assigned courses</div>
              </div>
              <div onClick={() => switchTab('courses')} className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] rounded-lg p-4 shadow-xs transition-all cursor-pointer group">
                <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#555555]">In Progress</span><Clock className="w-4 h-4 text-[#B76E00]" /></div>
                <div className="mt-2 text-2xl font-black text-[#1F1F1F]">{inProgress.length}</div>
                <div className="text-[11px] text-[#6A6F73] mt-1 group-hover:text-[#0056D2] transition-colors">Active learning</div>
              </div>
              <div onClick={() => switchTab('courses')} className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] rounded-lg p-4 shadow-xs transition-all cursor-pointer group">
                <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#555555]">Completed</span><CheckCircle className="w-4 h-4 text-[#0A8543]" /></div>
                <div className="mt-2 text-2xl font-black text-[#1F1F1F]">{completed.length}</div>
                <div className="text-[11px] text-[#6A6F73] mt-1 group-hover:text-[#0056D2] transition-colors">Finished courses</div>
              </div>
              <div onClick={() => switchTab('certificates')} className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] rounded-lg p-4 shadow-xs transition-all cursor-pointer group">
                <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#555555]">Certificates</span><Award className="w-4 h-4 text-[#0056D2]" /></div>
                <div className="mt-2 text-2xl font-black text-[#0056D2]">{earnedCerts.length}</div>
                <div className="text-[11px] text-[#6A6F73] mt-1 group-hover:text-[#0056D2] transition-colors">View certificates</div>
              </div>
              <div onClick={() => switchTab('progress')} className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] rounded-lg p-4 shadow-xs transition-all cursor-pointer group">
                <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#555555]">Avg. Grade</span><TrendingUp className="w-4 h-4 text-[#0A8543]" /></div>
                <div className="mt-2 text-2xl font-black text-[#1F1F1F]">{averageGrade > 0 ? `${averageGrade}%` : 'N/A'}</div>
                <div className="text-[11px] text-[#6A6F73] mt-1 group-hover:text-[#0056D2] transition-colors">Assessment history</div>
              </div>
            </div>

            {/* Weekly Learning Goal & Streak Widget (Coursera-Grade) */}
            <div className="bg-white border border-[#D1D7DC] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFF4E5] border border-[#FFE0B2] text-[#B76E00] flex items-center justify-center font-black text-xl shrink-0">
                  🔥
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1F1F1F]">Weekly Learning Goal</h3>
                    <span className="text-[10px] bg-[#E6F4EA] text-[#0A8543] font-bold px-2 py-0.5 rounded-full">
                      3 Day Streak!
                    </span>
                  </div>
                  <p className="text-xs text-[#6A6F73] mt-0.5">
                    Target: Complete lessons 3 days a week to stay on track for your certified credential.
                  </p>
                </div>
              </div>

              {/* Weekday Circles */}
              <div className="flex items-center gap-2 shrink-0">
                {[
                  { day: 'M', active: true },
                  { day: 'T', active: true },
                  { day: 'W', active: true },
                  { day: 'T', active: false },
                  { day: 'F', active: false },
                  { day: 'S', active: false },
                  { day: 'S', active: false }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                      item.active
                        ? 'bg-[#0056D2] text-white shadow-2xs'
                        : 'bg-[#F0F2F5] text-[#757575] border border-[#E0E0E0]'
                    }`}
                  >
                    {item.day}
                  </div>
                ))}
              </div>
            </div>

            {activeFocus?.course ? (
              <div className="bg-white border border-[#D1D7DC] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EBF3FF] text-[#0056D2] border border-[#C2DCFF] px-2.5 py-0.5 rounded">Current Focus</span>
                    <span className="text-xs text-[#6A6F73]">Category: {activeFocus.course.category || 'Curriculum'}</span>
                  </div>
                  <h2 className="text-xl font-black text-[#1F1F1F] leading-snug">{activeFocus.course.title}</h2>
                  <p className="text-xs text-[#555555] line-clamp-2">{activeFocus.course.description}</p>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1F1F1F]">{activeFocus.progressPercent || 0}% Completed</span>
                      <span className="text-[#6A6F73]">{activeFocus.completedVideos?.length || 0} of {activeFocus.course.videos?.length || 0} lessons watched</span>
                    </div>
                    <div className="w-full h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0056D2] rounded-full" style={{ width: `${activeFocus.progressPercent || 0}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0 md:min-w-[200px]">
                  <button onClick={() => navigate(`/courses/${activeFocus.course._id}`)} className="coursera-btn-primary flex items-center justify-center gap-2 py-3 px-6 shadow-xs">
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume Course</span>
                  </button>
                  <button onClick={() => switchTab('courses')} className="py-2 px-4 bg-white border border-[#D1D7DC] hover:border-[#757575] text-[#1F1F1F] text-xs font-bold rounded transition-colors text-center">
                    View All My Courses
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#D1D7DC] rounded-xl p-10 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-[#0056D2] mx-auto" />
                <h3 className="text-base font-bold text-[#1F1F1F]">You have no active courses assigned</h3>
                <p className="text-xs text-[#555555] max-w-sm mx-auto">Browse the catalog or contact your institution administrator to get enrolled in courses.</p>
                <button onClick={() => navigate('/courses')} className="coursera-btn-primary inline-flex items-center gap-2 mt-2">
                  <span>Explore Course Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                type="button"
                onClick={() => switchTab('certificates')}
                className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] hover:shadow-md rounded-xl p-5 shadow-xs transition-all cursor-pointer text-left flex flex-col justify-between group h-full"
              >
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-lg bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1F1F1F] group-hover:text-[#0056D2] transition-colors">
                    Official Certificates
                  </h4>
                  <p className="text-xs text-[#555555] leading-relaxed">
                    View and download verifiable PDF certificates for courses where you passed the final assessment.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0056D2] pt-4 mt-2 border-t border-[#F0F2F5] group-hover:translate-x-1 transition-transform">
                  <span>View Certificates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => switchTab('progress')}
                className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] hover:shadow-md rounded-xl p-5 shadow-xs transition-all cursor-pointer text-left flex flex-col justify-between group h-full"
              >
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-lg bg-[#E6F4EA] text-[#0A8543] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1F1F1F] group-hover:text-[#0056D2] transition-colors">
                    Learning Analytics
                  </h4>
                  <p className="text-xs text-[#555555] leading-relaxed">
                    Track your curriculum milestones, assessment attempt scores, and overall learning rate.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0056D2] pt-4 mt-2 border-t border-[#F0F2F5] group-hover:translate-x-1 transition-transform">
                  <span>Track Progress</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => switchTab('notifications')}
                className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] hover:shadow-md rounded-xl p-5 shadow-xs transition-all cursor-pointer text-left flex flex-col justify-between group h-full"
              >
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-lg bg-[#FFF4E5] text-[#B76E00] flex items-center justify-center relative">
                    <Bell className="w-5 h-5" />
                    {unreadNotifsCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-red-600 absolute top-1 right-1" />}
                  </div>
                  <h4 className="text-sm font-bold text-[#1F1F1F] group-hover:text-[#0056D2] transition-colors">
                    Personalized Notifications
                  </h4>
                  <p className="text-xs text-[#555555] leading-relaxed">
                    Stay updated on new course assignments, assessment results, and earned certificates.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0056D2] pt-4 mt-2 border-t border-[#F0F2F5] group-hover:translate-x-1 transition-transform">
                  <span>Open Notifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Back Button Bar - shown on all non-overview tabs */}
        {activeTab !== 'overview' && (
          <div className="flex items-center gap-3 bg-white border border-[#D1D7DC] rounded-lg px-4 py-3 shadow-xs">
            <button
              onClick={() => switchTab('overview')}
              className="flex items-center gap-2 text-[#0056D2] hover:text-[#0047BA] font-bold text-sm transition-colors cursor-pointer group"
            >
              <span className="w-8 h-8 rounded-lg bg-[#EBF3FF] group-hover:bg-[#D4E8FF] flex items-center justify-center transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </span>
              <span>Back to Dashboard</span>
            </button>
            <span className="text-[#D1D7DC]">|</span>
            <span className="text-xs text-[#6A6F73] font-medium">{activeLabel}</span>
          </div>
        )}

        {activeTab === 'courses' && <StudentMyCourses enrollments={enrollments} onRefresh={loadStudentData} />}
        {activeTab === 'progress' && <StudentProgress enrollments={enrollments} />}
        {activeTab === 'certificates' && <StudentCertificates enrollments={enrollments} />}
        {activeTab === 'profile' && <StudentProfile enrollments={enrollments} />}
        {activeTab === 'notifications' && <StudentNotifications onRefreshBadge={(count) => setUnreadNotifsCount(count)} />}
      </div>
    </div>
  );
};

export default StudentDashboardPage;


import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// 9 Submodules
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminCourses from '../components/admin/AdminCourses';
import AdminCourseBuilder from '../components/admin/AdminCourseBuilder';
import AdminLessonEditor from '../components/admin/AdminLessonEditor';
import AdminStudents from '../components/admin/AdminStudents';
import AdminPayments from '../components/admin/AdminPayments';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import AdminCertificates from '../components/admin/AdminCertificates';
import AdminSettings from '../components/admin/AdminSettings';

// Icons
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Film,
  Users,
  CreditCard,
  BarChart3,
  Award,
  Settings,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Course Management', icon: BookOpen },
  { id: 'course-builder', label: 'Course Builder', icon: PlusCircle },
  { id: 'lesson-editor', label: 'Lesson Editor', icon: Film },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(tabParam);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Shared Data States
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Contextual Sub-states
  const [editingCourse, setEditingCourse] = useState(null);
  const [lessonCourse, setLessonCourse] = useState(null);

  // Sync tab with URL search parameter
  const switchTab = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    setMobileMenuOpen(false);
  };

  const loadAllData = useCallback(async () => {
    if (user?.role !== 'admin' && user?.role !== 'instructor') return;
    try {
      setRefreshing(true);
      const [statsRes, coursesRes, usersRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/courses'),
        api.get('/admin/users')
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.data);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handlers for switching to builder / lesson editor from courses table
  const handleEditCourseFromCatalog = (course) => {
    setEditingCourse(course);
    switchTab('course-builder');
  };

  const handleEditLessonsFromCatalog = (course) => {
    setLessonCourse(course);
    switchTab('lesson-editor');
  };

  if (user?.role !== 'admin' && user?.role !== 'instructor') {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-[#F5F7FA]">
        <div className="bg-white border border-[#D1D7DC] rounded-xl p-8 max-w-md text-center shadow-md space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-[#1F1F1F]">Access Restricted</h2>
          <p className="text-sm text-[#555555]">
            You do not have administrative privileges to view this portal.
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="coursera-btn-primary"
          >
            Go to Student Catalog
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1F1F1F] flex flex-col font-sans">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#D1D7DC] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded hover:bg-slate-100 text-[#1F1F1F]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => switchTab('dashboard')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="text-2xl font-black tracking-tight text-[#0056D2]">
                crescentia
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-[#EBF3FF] text-[#0056D2] border border-[#C2DCFF] uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </div>

          {/* Right quick controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              disabled={refreshing}
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#555555] hover:text-[#0056D2] px-2.5 py-1.5 rounded hover:bg-slate-100 transition-colors"
              title="Refresh all metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#0056D2]' : ''}`} />
              <span>Sync</span>
            </button>

            <button
              onClick={() => navigate('/courses')}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#0056D2] hover:text-[#00419E] bg-[#EBF3FF] hover:bg-blue-100 px-3 py-1.5 rounded border border-[#C2DCFF] transition-colors"
            >
              <span>Student View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-[#D1D7DC]">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#1F1F1F] bg-[#F0F2F5] px-2.5 py-1.5 rounded">
                <User className="w-3.5 h-3.5 text-[#0056D2]" />
                <span className="hidden md:inline">{user.name}</span>
                <span className="text-[10px] bg-[#0056D2] text-white px-1.5 py-0.2 rounded uppercase">
                  {user.role}
                </span>
              </span>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-1.5 text-[#555555] hover:text-[#DC2626] rounded hover:bg-slate-100"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Body: Sidebar + Active Module Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left Coursera-styled Sidebar */}
        <aside
          className={`lg:w-64 shrink-0 ${
            mobileMenuOpen ? 'block' : 'hidden'
          } lg:block`}
        >
          <div className="bg-white border border-[#D1D7DC] rounded-xl p-3 shadow-xs sticky top-20 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#6A6F73]">
              Platform Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#EBF3FF] text-[#0056D2] shadow-xs'
                      : 'text-[#1F1F1F] hover:bg-[#F5F7FA] hover:text-[#0056D2]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0056D2]' : 'text-[#6A6F73]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#0056D2]" />}
                </button>
              );
            })}

            <div className="pt-3 mt-3 border-t border-[#E0E0E0] px-3 pb-1">
              <div className="flex items-center gap-2 text-[11px] text-[#0A8543] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#0A8543]" />
                <span>Crescentia v2.4 Enterprise</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Active Content Area */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="bg-white border border-[#D1D7DC] rounded-xl p-16 text-center shadow-xs">
              <div className="loading-spinner text-sm text-[#0056D2] font-bold">
                Loading Admin Console...
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboard
                  stats={stats}
                  courses={courses}
                  users={users}
                  onNavigateTab={switchTab}
                />
              )}

              {activeTab === 'courses' && (
                <AdminCourses
                  courses={courses}
                  onRefresh={loadAllData}
                  onEditCourse={handleEditCourseFromCatalog}
                  onEditLessons={handleEditLessonsFromCatalog}
                  onNavigateTab={switchTab}
                />
              )}

              {activeTab === 'course-builder' && (
                <AdminCourseBuilder
                  editingCourse={editingCourse}
                  onCancel={() => {
                    setEditingCourse(null);
                    switchTab('courses');
                  }}
                  onSuccess={() => {
                    setEditingCourse(null);
                    loadAllData();
                    switchTab('courses');
                  }}
                />
              )}

              {activeTab === 'lesson-editor' && (
                <AdminLessonEditor
                  courses={courses}
                  initialCourse={lessonCourse}
                  onBack={() => switchTab('courses')}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'students' && (
                <AdminStudents
                  users={users}
                  courses={courses}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'payments' && (
                <AdminPayments
                  stats={stats}
                />
              )}

              {activeTab === 'analytics' && (
                <AdminAnalytics
                  stats={stats}
                  courses={courses}
                  users={users}
                />
              )}

              {activeTab === 'certificates' && (
                <AdminCertificates users={users} />
              )}

              {activeTab === 'settings' && (
                <AdminSettings />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;

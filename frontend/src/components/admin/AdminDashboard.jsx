import {
  Users,
  BookOpen,
  GraduationCap,
  Award,
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  Clock,
  PlusCircle,
  UserPlus,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const AdminDashboard = ({ stats, courses, users, onNavigateTab }) => {
  const totalCourses = courses?.length || stats?.totalCourses || 0;
  const publishedCourses = courses?.filter(c => c.isPublished !== false)?.length || stats?.publishedCourses || totalCourses;

  // Filter actual student accounts for consistent statistics
  const studentUsers = (users || []).filter(u => u.role === 'user');
  const totalStudents = studentUsers.length > 0 ? studentUsers.length : (stats?.totalUsers || 0);
  const activeStudents = studentUsers.length > 0
    ? studentUsers.filter(u => u.isActive !== false).length
    : (stats?.activeUsers || totalStudents);

  const enrollmentsCount = stats?.totalEnrollments || 0;
  const completedCount = stats?.completedEnrollments || 0;
  const totalRevenue = 0;

  // Categories distribution sorted descending
  const categoryCounts = (courses || []).reduce((acc, course) => {
    acc[course.category] = (acc[course.category] || 0) + 1;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // Recent students (prefer role: 'user', fallback to any user)
  const recentStudentsList = studentUsers.length > 0
    ? studentUsers.slice(0, 5)
    : (users || []).slice(0, 5);

  const recentCourses = (courses || []).slice(0, 5);

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner with high contrast and legible typography */}
      <div className="bg-gradient-to-r from-[#0056D2] to-[#00419E] rounded-xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 backdrop-blur-xs mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            Coursera Enterprise Admin Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Academic & Institution Dashboard
          </h1>
          <p
            className="text-sm sm:text-base max-w-2xl font-normal leading-relaxed"
            style={{ color: '#EBF3FF' }}
          >
            Monitor institutional enrollment velocity, course publishing status, learner progress, and verified credential distribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('course-builder')}
            className="px-4 py-2.5 rounded bg-white text-[#0056D2] hover:bg-blue-50 font-bold text-sm transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#0056D2]" />
            <span>Create Course</span>
          </button>
          <button
            onClick={() => onNavigateTab('students')}
            className="px-4 py-2.5 rounded bg-white/15 hover:bg-white/25 text-white font-bold text-sm transition-colors flex items-center gap-2 border border-white/40 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards - all consistently styled with interactive hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Students */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-[#0056D2] hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#555555] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555555] group-hover:text-[#0056D2] transition-colors">
              Students
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#1F1F1F] mb-1">{totalStudents}</div>
            <div className="text-xs text-[#0A8543] font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{activeStudents} active learners</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Courses */}
        <div
          onClick={() => onNavigateTab('courses')}
          className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-[#0056D2] hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#555555] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555555] group-hover:text-[#0056D2] transition-colors">
              Courses
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#1F1F1F] mb-1">{totalCourses}</div>
            <div className="text-xs text-[#555555] font-semibold">
              {publishedCourses} published in catalog
            </div>
          </div>
        </div>

        {/* Card 3: Enrollments */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-[#0056D2] hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#555555] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555555] group-hover:text-[#0056D2] transition-colors">
              Enrollments
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#1F1F1F] mb-1">{enrollmentsCount}</div>
            <div className="text-xs text-[#0A8543] font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18% this month</span>
            </div>
          </div>
        </div>

        {/* Card 4: Completions */}
        <div
          onClick={() => onNavigateTab('certificates')}
          className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-[#0056D2] hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#555555] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555555] group-hover:text-[#0056D2] transition-colors">
              Credentials
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#1F1F1F] mb-1">{completedCount}</div>
            <div className="text-xs text-[#0A8543] font-semibold">Verified Certificates</div>
          </div>
        </div>

        {/* Card 5: Platform Tuition */}
        <div
          onClick={() => onNavigateTab('payments')}
          className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-[#0056D2] hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#555555] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555555] group-hover:text-[#0056D2] transition-colors">
              Revenue
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#E6F4EA] text-[#0A8543] flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#1F1F1F] mb-1">₹0.00</div>
            <div className="text-xs text-[#0A8543] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Production ledger ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Analytics & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Course Categories & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Distribution */}
          <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs text-left">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#F0F2F5]">
              <div>
                <h3 className="text-base font-bold text-[#1F1F1F]">Course Subject Distribution</h3>
                <p className="text-xs text-[#555555] mt-0.5">Active certificate offerings by domain</p>
              </div>
              <button
                onClick={() => onNavigateTab('courses')}
                className="text-xs font-bold text-[#0056D2] hover:text-[#00419E] flex items-center gap-1 cursor-pointer"
              >
                <span>View Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {sortedCategories.slice(0, 6).map(([category, count]) => {
                const percent = Math.round((count / Math.max(1, totalCourses)) * 100);
                const courseLabel = count === 1 ? '1 course' : `${count} courses`;

                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#1F1F1F] font-bold">{category}</span>
                      <span className="text-[#555555]">{courseLabel} ({percent}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0056D2] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(8, percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Courses Added */}
          <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs text-left">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F0F2F5]">
              <div>
                <h3 className="text-base font-bold text-[#1F1F1F]">Recent Course Catalog</h3>
                <p className="text-xs text-[#555555] mt-0.5">Latest curriculum updates</p>
              </div>
              <button
                onClick={() => onNavigateTab('course-builder')}
                className="text-xs font-bold text-[#0056D2] hover:text-[#00419E] flex items-center gap-1 cursor-pointer"
              >
                <span>+ Add New Course</span>
              </button>
            </div>

            <div className="divide-y divide-[#E0E0E0]">
              {recentCourses.map((c) => (
                <div key={c._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-10 rounded bg-slate-100 overflow-hidden shrink-0 border border-[#D1D7DC]">
                      <img
                        src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#1F1F1F] truncate">{c.title}</div>
                      <div className="text-xs text-[#555555] flex items-center gap-2 mt-0.5">
                        <span className="text-[#0056D2] font-semibold">{c.category}</span>
                        <span>•</span>
                        <span>{c.level}</span>
                        <span>•</span>
                        <span>{c.videos?.length || 0} lessons</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${
                      c.isPublished ? 'bg-[#E6F4EA] text-[#0A8543]' : 'bg-[#FFF0EB] text-[#B4690E]'
                    }`}>
                      {c.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Links & Recent Registered Students */}
        <div className="space-y-6 text-left">
          {/* Quick Management Short-Cuts */}
          <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#1F1F1F] mb-4 pb-2 border-b border-[#F0F2F5]">
              Quick Actions
            </h3>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigateTab('course-builder')}
                className="w-full p-3 rounded-md border border-[#D1D7DC] hover:border-[#0056D2] hover:bg-[#F8FAFC] flex items-center justify-between text-xs font-bold text-[#1F1F1F] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center group-hover:bg-[#0056D2] group-hover:text-white transition-colors">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <span>Launch New Course</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#757575] group-hover:text-[#0056D2] group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('lesson-editor')}
                className="w-full p-3 rounded-md border border-[#D1D7DC] hover:border-[#0056D2] hover:bg-[#F8FAFC] flex items-center justify-between text-xs font-bold text-[#1F1F1F] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center group-hover:bg-[#0056D2] group-hover:text-white transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>Update Video Lessons</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#757575] group-hover:text-[#0056D2] group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('students')}
                className="w-full p-3 rounded-md border border-[#D1D7DC] hover:border-[#0056D2] hover:bg-[#F8FAFC] flex items-center justify-between text-xs font-bold text-[#1F1F1F] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center group-hover:bg-[#0056D2] group-hover:text-white transition-colors">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span>Enroll Student to Course</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#757575] group-hover:text-[#0056D2] group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('certificates')}
                className="w-full p-3 rounded-md border border-[#D1D7DC] hover:border-[#0056D2] hover:bg-[#F8FAFC] flex items-center justify-between text-xs font-bold text-[#1F1F1F] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center group-hover:bg-[#0056D2] group-hover:text-white transition-colors">
                    <Award className="w-4 h-4" />
                  </div>
                  <span>Issue Verified Certificate</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#757575] group-hover:text-[#0056D2] group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Recent Students Card */}
          <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F0F2F5]">
              <div>
                <h3 className="text-base font-bold text-[#1F1F1F]">Recent Students</h3>
                <p className="text-xs text-[#555555] mt-0.5">Enrolled platform learners</p>
              </div>
              <button
                onClick={() => onNavigateTab('students')}
                className="text-xs font-bold text-[#0056D2] hover:text-[#00419E] flex items-center gap-1 cursor-pointer"
              >
                <span>All Users</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {recentStudentsList.map((u) => {
                const initial = u.name ? u.name.charAt(0).toUpperCase() : 'S';
                const roleBadge = u.role === 'admin'
                  ? 'ADMIN'
                  : u.role === 'instructor'
                  ? 'INSTRUCTOR'
                  : 'STUDENT';

                return (
                  <div key={u._id} className="flex items-center justify-between gap-3 text-xs py-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#EBF3FF] text-[#0056D2] font-bold text-xs flex items-center justify-center shrink-0 border border-[#C5DCFA]">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#1F1F1F] truncate">{u.name}</div>
                        <div className="text-[#555555] text-[11px] truncate">{u.email}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] shrink-0 tracking-wider ${
                      u.role === 'admin'
                        ? 'bg-[#0056D2] text-white'
                        : u.role === 'instructor'
                        ? 'bg-[#FFF0EB] text-[#B4690E]'
                        : 'bg-[#EBF3FF] text-[#0056D2]'
                    }`}>
                      {roleBadge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

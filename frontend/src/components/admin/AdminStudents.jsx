import { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  BookOpen,
  RotateCcw,
  Shield,
  Key,
  TrendingUp,
  Award,
  Clock,
  Check,
  PlayCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Plus,
  X,
  Calendar,
  Layers
} from 'lucide-react';
import api from '../../services/api';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'user'
};

const AdminStudents = ({ users = [], courses = [], onRefresh }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [learningFilter, setLearningFilter] = useState('All'); // 'All' | 'Studying' | 'Completed' | 'NotStarted'
  const [userForm, setUserForm] = useState(emptyForm);
  const [editingUserId, setEditingUserId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCourseForUser, setSelectedCourseForUser] = useState({});
  const [loadingAction, setLoadingAction] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [expandedStudents, setExpandedStudents] = useState({});
  const [activeStudentId, setActiveStudentId] = useState(null);

  const activeStudent = users.find((x) => x._id === activeStudentId);

  const filteredUsers = (users || []).filter((u) => {
    const enrollments = u.enrollments || [];
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      enrollments.some((e) => e.courseTitle?.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && u.isActive) ||
      (statusFilter === 'Inactive' && !u.isActive);

    let matchesLearning = true;
    if (learningFilter === 'Studying') {
      matchesLearning = enrollments.some((e) => e.progressPercent > 0 && e.progressPercent < 100 && !e.isPassed);
    } else if (learningFilter === 'Completed') {
      matchesLearning = enrollments.some((e) => e.isPassed || e.progressPercent === 100);
    } else if (learningFilter === 'NotStarted') {
      matchesLearning = enrollments.length > 0 && enrollments.every((e) => (e.progressPercent || 0) === 0);
    }

    return matchesSearch && matchesRole && matchesStatus && matchesLearning;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (editingUserId) {
        await api.put(`/admin/users/${editingUserId}`, userForm);
        setMessage('Student/User updated successfully');
      } else {
        await api.post('/admin/users', userForm);
        setMessage('Student/User created successfully');
      }

      setShowModal(false);
      setUserForm(emptyForm);
      setEditingUserId('');
      await onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEditClick = (u) => {
    setEditingUserId(u._id);
    setUserForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (userId) => {
    try {
      setLoadingAction(userId);
      const { data } = await api.patch(`/admin/users/${userId}/toggle-status`);
      setMessage(data.message || 'Status updated');
      await onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete student "${name}"?`)) return;

    try {
      setLoadingAction(userId);
      await api.delete(`/admin/users/${userId}`);
      setMessage('User removed successfully');
      await onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAssignCourse = async (userId) => {
    const courseId = selectedCourseForUser[userId];
    if (!courseId) return;

    try {
      setLoadingAction(userId);
      await api.post(`/admin/users/${userId}/assign-course`, { courseId });
      setMessage('Course assigned to student successfully');
      setSelectedCourseForUser((prev) => ({ ...prev, [userId]: '' }));
      await onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign course');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRemoveCourse = async (userId, courseId, enrollmentId) => {
    if (!window.confirm('Remove access to this course for this student?')) return;

    try {
      setLoadingAction(userId);
      await api.post(`/admin/users/${userId}/remove-course`, { courseId, enrollmentId });
      setMessage('Course access revoked successfully');
      await onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove access');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetProgress = async (userId, userName) => {
    if (!window.confirm(`Reset all course progress and assessment scores for ${userName}?`)) return;

    try {
      setLoadingAction(userId);
      await api.post(`/admin/users/${userId}/reset-progress`);
      setMessage(`Progress reset for ${userName}`);
      await onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset progress');
    } finally {
      setLoadingAction(null);
    }
  };

  // Compute summary stats across all students
  const studentAccounts = users.filter((u) => u.role === 'user');
  const activeLearners = studentAccounts.filter((u) =>
    (u.enrollments || []).some((e) => e.progressPercent > 0 && e.progressPercent < 100 && !e.isPassed)
  ).length;
  const certifiedLearners = studentAccounts.filter((u) =>
    (u.enrollments || []).some((e) => e.isPassed || e.progressPercent === 100)
  ).length;
  const totalEnrollmentsCount = studentAccounts.reduce(
    (sum, u) => sum + (u.enrollments?.length || 0),
    0
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1F1F1F] tracking-tight">
            Student Cards & Live Activity Hub
          </h2>
          <p className="text-sm text-[#555555]">
            Individual cards for every student showing all enrolled courses, live studying status, and exact completion metrics.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUserId('');
            setUserForm(emptyForm);
            setShowModal(true);
          }}
          className="coursera-btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Student / User</span>
        </button>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
              Total Students
            </span>
            <Users className="w-4 h-4 text-[#0056D2]" />
          </div>
          <div className="text-2xl font-black text-[#1F1F1F] mt-2">
            {studentAccounts.length}
          </div>
          <div className="text-[11px] text-[#6A6F73] mt-1">
            {totalEnrollmentsCount} course assignments
          </div>
        </div>

        <div className="bg-white border border-[#D1D7DC] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
              Actively Studying
            </span>
            <BookOpen className="w-4 h-4 text-[#0056D2]" />
          </div>
          <div className="text-2xl font-black text-[#0056D2] mt-2">
            {activeLearners}
          </div>
          <div className="text-[11px] text-[#6A6F73] mt-1">
            Lessons in progress
          </div>
        </div>

        <div className="bg-white border border-[#D1D7DC] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
              Certified Graduates
            </span>
            <Award className="w-4 h-4 text-[#0A8543]" />
          </div>
          <div className="text-2xl font-black text-[#0A8543] mt-2">
            {certifiedLearners}
          </div>
          <div className="text-[11px] text-[#6A6F73] mt-1">
            Passed exam with 70%+ score
          </div>
        </div>

        <div className="bg-white border border-[#D1D7DC] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
              Catalog Courses
            </span>
            <GraduationCap className="w-4 h-4 text-[#B76E00]" />
          </div>
          <div className="text-2xl font-black text-[#1F1F1F] mt-2">
            {courses.length}
          </div>
          <div className="text-[11px] text-[#6A6F73] mt-1">
            Available curriculum
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-[#E6F4EA] border border-[#A8DAB5] text-[#0A8543] rounded-md text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#FDF2F2] border border-[#F87171] text-[#DC2626] rounded-md text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-[#D1D7DC] rounded-lg p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, or enrolled course..."
            className="w-full pr-4 py-2 text-sm rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none search-input-with-icon"
            style={{ paddingLeft: '2.75rem' }}
          />
          <Search className="w-4 h-4 text-[#6A6F73] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#555555] shrink-0">Learning State:</span>
          <select
            value={learningFilter}
            onChange={(e) => setLearningFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded border border-[#757575] bg-white font-medium focus:border-[#0056D2]"
          >
            <option value="All">All Learning States</option>
            <option value="Studying">Actively Studying</option>
            <option value="Completed">Completed / Certified</option>
            <option value="NotStarted">Not Started (0%)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#555555] shrink-0">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded border border-[#757575] bg-white font-medium focus:border-[#0056D2]"
          >
            <option value="All">All Roles</option>
            <option value="user">Student (User)</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#555555] shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded border border-[#757575] bg-white font-medium focus:border-[#0056D2]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* STUDENT CARDS: ONE COMPLETE CARD PER STUDENT WITH FULL ACTIVITY */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white border border-[#D1D7DC] rounded-xl p-12 text-center space-y-3 shadow-xs">
          <Users className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-[#1F1F1F]">No students found</h3>
          <p className="text-xs text-[#555555] max-w-sm mx-auto">
            Try clearing your search query or selecting "All Learning States" to view all enrolled students.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.map((u) => {
            const enrollments = u.enrollments || [];
            const initial = u.name ? u.name.charAt(0).toUpperCase() : 'U';
            const completedCerts = enrollments.filter((e) => e.isPassed || e.progressPercent === 100).length;
            const activeCourses = enrollments.filter((e) => e.progressPercent > 0 && e.progressPercent < 100 && !e.isPassed).length;
            const avgProgress = u.learningSummary?.averageProgress || 0;

            return (
              <div
                key={u._id}
                onClick={() => setActiveStudentId(u._id)}
                className="bg-white border border-[#D1D7DC] hover:border-[#0056D2] rounded-xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3 relative"
              >
                {/* Top Info: Avatar, Name, Role & Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#0056D2] text-white font-black text-base flex items-center justify-center shrink-0 shadow-2xs ring-2 ring-[#EBF3FF] group-hover:scale-105 transition-transform">
                        {initial}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-[#1F1F1F] group-hover:text-[#0056D2] transition-colors truncate">
                          {u.name}
                        </h4>
                        <p className="text-xs text-[#6A6F73] truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>

                    {/* Active/Inactive Dot Indicator */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(u._id);
                      }}
                      disabled={loadingAction === u._id}
                      className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform hover:scale-125 ${
                        u.isActive ? 'bg-[#0A8543] ring-2 ring-[#E6F4EA]' : 'bg-[#DC2626] ring-2 ring-[#FDF2F2]'
                      }`}
                      title={u.isActive ? 'Active (Click to disable)' : 'Inactive (Click to enable)'}
                    />
                  </div>

                  {/* Badges: Role & Status */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded font-bold uppercase text-[9px] tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-[#0056D2] text-white'
                          : u.role === 'instructor'
                          ? 'bg-[#F5F0FF] text-[#6B21A8] border border-[#E9D5FF]'
                          : 'bg-[#EBF3FF] text-[#0056D2] border border-[#C2DCFF]'
                      }`}
                    >
                      {u.role === 'user' ? 'Student' : u.role}
                    </span>

                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        u.isActive ? 'bg-[#E6F4EA] text-[#0A8543]' : 'bg-[#FDF2F2] text-[#DC2626]'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Metrics Pills */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-[#F8FAFC] border border-[#E4E8EE] rounded-lg p-2 text-left">
                      <span className="text-[10px] text-[#6A6F73] font-medium block">Courses</span>
                      <span className="text-sm font-black text-[#1F1F1F]">
                        {enrollments.length} Registered
                      </span>
                    </div>

                    <div className="bg-[#F8FAFC] border border-[#E4E8EE] rounded-lg p-2 text-left">
                      <span className="text-[10px] text-[#6A6F73] font-medium block">Certified</span>
                      <span className="text-sm font-black text-[#0A8543]">
                        {completedCerts} Passed
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6A6F73] font-medium">Avg. Progress</span>
                      <span className="font-bold text-[#1F1F1F]">{avgProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E8ECEF] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          avgProgress === 100
                            ? 'bg-[#0A8543]'
                            : avgProgress > 0
                            ? 'bg-[#0056D2]'
                            : 'bg-transparent'
                        }`}
                        style={{ width: `${avgProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer: Click prompt + Quick Action Icons */}
                <div className="pt-2 border-t border-[#F0F2F5] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0056D2] group-hover:underline flex items-center gap-1 text-[11px]">
                    <span>View Courses & Progress</span>
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(u);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-[#0056D2] hover:bg-[#EBF3FF] transition-colors"
                      title="Edit student"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(u._id, u.name);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete student"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL STUDENT MODAL: OPENS WHEN CLICKING ON THE SMALL CARD */}
      {activeStudent && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setActiveStudentId(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#D1D7DC] shadow-2xl max-w-4xl w-full h-[90vh] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Fixed at top) */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#F8FAFC] via-[#F4F8FF] to-[#FFFFFF] border-b border-[#D1D7DC] flex items-start sm:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0056D2] text-white font-black text-xl flex items-center justify-center shrink-0 shadow-xs ring-4 ring-[#EBF3FF]">
                  {activeStudent.name ? activeStudent.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-extrabold text-[#1F1F1F]">
                      {activeStudent.name}
                    </h3>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded font-bold uppercase text-[10px] tracking-wider ${
                        activeStudent.role === 'admin'
                          ? 'bg-[#0056D2] text-white'
                          : activeStudent.role === 'instructor'
                          ? 'bg-[#F5F0FF] text-[#6B21A8] border border-[#E9D5FF]'
                          : 'bg-[#EBF3FF] text-[#0056D2] border border-[#C2DCFF]'
                      }`}
                    >
                      {activeStudent.role === 'user' ? 'Student' : activeStudent.role}
                    </span>

                    <button
                      onClick={() => handleToggleStatus(activeStudent._id)}
                      disabled={loadingAction === activeStudent._id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer border transition-colors ${
                        activeStudent.isActive
                          ? 'bg-[#E6F4EA] text-[#0A8543] border-[#A8DAB5] hover:bg-[#D4EDDA]'
                          : 'bg-[#FDF2F2] text-[#DC2626] border-[#F87171] hover:bg-[#FCE8E8]'
                      }`}
                      title="Toggle Active/Inactive"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          activeStudent.isActive ? 'bg-[#0A8543]' : 'bg-[#DC2626]'
                        }`}
                      />
                      <span>{activeStudent.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>

                  <div className="text-xs text-[#555555] flex flex-wrap items-center gap-3">
                    <span>{activeStudent.email}</span>
                    <span className="text-[#D1D7DC]">•</span>
                    <span className="font-mono text-[11px] text-[#6A6F73]">
                      ID: {activeStudent._id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleEditClick(activeStudent);
                  }}
                  className="p-2 rounded-lg border border-[#D1D7DC] text-[#0056D2] hover:bg-[#EBF3FF] transition-colors"
                  title="Edit details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStudentId(null)}
                  className="p-2 rounded-lg text-[#555555] hover:text-[#1F1F1F] hover:bg-gray-100 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* UNIFIED SMOOTH SCROLLABLE MODAL BODY */}
            <div className="flex-1 overflow-y-auto min-h-0 p-5 sm:p-6 space-y-6 overscroll-contain">
              {/* Quick Actions & Course Assigner Bar */}
              <div className="p-4 bg-[#F8FAFC] border border-[#D1D7DC] rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                {/* Assign Course Dropdown */}
                <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                  <div className="relative flex-1">
                    <select
                      value={selectedCourseForUser[activeStudent._id] || ''}
                      onChange={(e) =>
                        setSelectedCourseForUser((prev) => ({
                          ...prev,
                          [activeStudent._id]: e.target.value
                        }))
                      }
                      className="w-full py-2 px-3 text-xs rounded-lg border border-[#D1D7DC] bg-white font-medium focus:border-[#0056D2] focus:outline-none"
                    >
                      <option value="">+ Select a course to register student...</option>
                      {(courses || []).map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title} ({c.category || 'General'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAssignCourse(activeStudent._id)}
                    disabled={!selectedCourseForUser[activeStudent._id] || loadingAction === activeStudent._id}
                    className="px-4 py-2 bg-[#0056D2] hover:bg-[#00419E] text-white rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Course</span>
                  </button>
                </div>

                {/* Reset Progress Action */}
                {activeStudent.role === 'user' && (
                  <button
                    type="button"
                    onClick={() => handleResetProgress(activeStudent._id, activeStudent.name)}
                    className="px-3 py-2 rounded-lg border border-[#D1D7DC] text-[#B4690E] hover:bg-[#FFF8E6] hover:border-[#B4690E] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 bg-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Progress</span>
                  </button>
                )}
              </div>

              {/* Learning Metrics Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl p-3.5 shadow-2xs">
                  <span className="text-[#6A6F73] font-medium block">Registered Courses</span>
                  <span className="font-extrabold text-[#1F1F1F] text-xl mt-1 block">
                    {activeStudent.enrollments?.length || 0}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl p-3.5 shadow-2xs">
                  <span className="text-[#6A6F73] font-medium block">In Progress</span>
                  <span className="font-extrabold text-[#0056D2] text-xl mt-1 block">
                    {(activeStudent.enrollments || []).filter(
                      (e) => e.progressPercent > 0 && e.progressPercent < 100 && !e.isPassed
                    ).length}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl p-3.5 shadow-2xs">
                  <span className="text-[#6A6F73] font-medium block">Certificates Earned</span>
                  <span className="font-extrabold text-[#0A8543] text-xl mt-1 block">
                    {(activeStudent.enrollments || []).filter(
                      (e) => e.isPassed || e.progressPercent === 100
                    ).length}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl p-3.5 shadow-2xs">
                  <span className="text-[#6A6F73] font-medium block">Avg. Completion</span>
                  <span className="font-extrabold text-[#1F1F1F] text-xl mt-1 block">
                    {activeStudent.learningSummary?.averageProgress || 0}%
                  </span>
                </div>
              </div>

              {/* Registered Courses Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#0056D2]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                      All Registered Courses & Live Studying Activities ({activeStudent.enrollments?.length || 0})
                    </h4>
                  </div>
                </div>

                {(!activeStudent.enrollments || activeStudent.enrollments.length === 0) ? (
                  <div className="p-12 bg-[#F8F9FA] rounded-xl border border-[#E0E0E0] text-center space-y-2">
                    <BookOpen className="w-10 h-10 text-gray-400 mx-auto" />
                    <h5 className="text-sm font-bold text-[#1F1F1F]">No Courses Registered</h5>
                    <p className="text-xs text-[#6A6F73] max-w-sm mx-auto">
                      This student is not enrolled in any courses yet. Use the course selector above to assign their first course.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeStudent.enrollments.map((enr) => {
                      const progress = enr.progressPercent || 0;
                      const isPassed = enr.isPassed;

                      return (
                        <div
                          key={enr.courseId || enr._id}
                          className="bg-[#F8FAFC] border border-[#D1D7DC] hover:border-[#0056D2] rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between"
                        >
                          {/* Course Category + Level + Revoke Button */}
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-[#0056D2] border border-[#C2DCFF] px-2 py-0.5 rounded shadow-2xs">
                                  {enr.courseCategory || 'Curriculum'}
                                </span>
                                <span className="text-[10px] font-semibold bg-[#E4E6EB] text-[#555555] px-1.5 py-0.5 rounded">
                                  {enr.courseLevel || 'Beginner'}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveCourse(activeStudent._id, enr.courseId?._id || enr.courseId, enr._id)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                title="Revoke access to this course"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <h5 className="text-sm font-bold text-[#1F1F1F] leading-snug">
                              {enr.courseTitle}
                            </h5>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-[#1F1F1F]">
                                {progress}% Completed
                              </span>
                              <span className="text-[#6A6F73] text-[11px]">
                                {enr.completedLessons || 0} of {enr.totalLessons || 0} lessons watched
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isPassed || progress === 100
                                    ? 'bg-[#0A8543]'
                                    : progress > 0
                                    ? 'bg-[#0056D2]'
                                    : 'bg-transparent'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Live Studying Indicator */}
                          <div className="p-2.5 bg-white rounded-lg border border-[#E0E0E0] text-xs space-y-1 shadow-2xs">
                            <span className="text-[10px] text-[#6A6F73] font-bold uppercase tracking-wider block">
                              Currently Studying:
                            </span>
                            <div className="font-bold text-[#1F1F1F] flex items-center gap-1.5 text-xs truncate">
                              {isPassed ? (
                                <span className="text-[#0A8543] flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5 text-[#0A8543] shrink-0" />
                                  <span>Course Completed & Certified</span>
                                </span>
                              ) : (
                                <span className="text-[#0056D2] flex items-center gap-1 truncate">
                                  <PlayCircle className="w-3.5 h-3.5 text-[#0056D2] shrink-0" />
                                  <span className="truncate">{enr.currentlyStudying}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Assessment Status Footer */}
                          <div className="flex items-center justify-between gap-2 pt-1 text-[11px] border-t border-[#E8ECF0]">
                            {isPassed ? (
                              <span className="text-[#0A8543] font-bold flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" />
                                <span>Passed ({enr.quizScore}%) - Certificate Ready</span>
                              </span>
                            ) : enr.quizSubmittedAt ? (
                              <span className="text-[#B76E00] font-semibold">
                                Score: {enr.quizScore}% (Needs 70%)
                              </span>
                            ) : (
                              <span className="text-[#757575]">
                                Assessment not taken yet
                              </span>
                            )}

                            <span className="text-[10px] text-[#8A8F94]">
                              {new Date(enr.lastActivityAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer (Fixed at bottom) */}
            <div className="p-4 bg-[#F8FAFC] border-t border-[#D1D7DC] flex items-center justify-between shrink-0">
              <span className="text-xs text-[#6A6F73]">
                Total {activeStudent.enrollments?.length || 0} courses registered for {activeStudent.name}
              </span>
              <button
                type="button"
                onClick={() => setActiveStudentId(null)}
                className="px-5 py-2 bg-[#1F1F1F] hover:bg-[#333333] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D1D7DC] shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#1F1F1F]">
              {editingUserId ? 'Edit Student / User' : 'Add New Student / User'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1F1F1F]">Full Name *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="e.g., Alex Johnson"
                  className="w-full p-2 text-sm rounded border border-[#757575] focus:border-[#0056D2]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1F1F1F]">Email Address *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full p-2 text-sm rounded border border-[#757575] focus:border-[#0056D2]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1F1F1F]">
                  Password {editingUserId ? '(Leave blank to keep existing)' : '*'}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full p-2 text-sm rounded border border-[#757575] focus:border-[#0056D2]"
                  required={!editingUserId}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1F1F1F]">System Role *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full p-2 text-sm rounded border border-[#757575] focus:border-[#0056D2] bg-white"
                >
                  <option value="user">Student (User)</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#757575] rounded text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0056D2] text-white rounded text-xs font-bold hover:bg-[#00419E]"
                >
                  {editingUserId ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;

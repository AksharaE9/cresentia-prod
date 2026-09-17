import { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Edit3,
  Trash2,
  BookOpen,
  Eye,
  EyeOff,
  Video,
  CheckCircle,
  ExternalLink,
  Layers
} from 'lucide-react';
import api from '../../services/api';

const AdminCourses = ({ courses, onRefresh, onEditCourse, onEditLessons, onNavigateTab }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [loadingAction, setLoadingAction] = useState(null);
  const [message, setMessage] = useState('');

  const categories = [
    'All',
    'Auth Concepts',
    'Website Content',
    'Business Analysis',
    'API Development',
    'Backend Basics',
    'Machine Learning',
    'Conversion Optimization',
    'Web Development'
  ];

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = (courses || []).filter((c) => {
    const matchesSearch = c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Published' && c.isPublished) ||
      (selectedStatus === 'Draft' && !c.isPublished);

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });

  const handleTogglePublish = async (courseId) => {
    try {
      setLoadingAction(courseId);
      const res = await api.patch(`/admin/courses/${courseId}/toggle-publish`);
      setMessage(res.data.message || 'Status updated');
      await onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update publish state');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      setLoadingAction(courseId);
      await api.delete(`/admin/courses/${courseId}`);
      setMessage('Course deleted successfully');
      await onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete course');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1F1F1F] tracking-tight">
            Course Management
          </h2>
          <p className="text-sm text-[#555555]">
            Manage, publish, and structure all institutional courses in the catalog.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('course-builder')}
          className="coursera-btn-primary"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          <span>New Course</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-[#E6F4EA] border border-[#A8DAB5] text-[#0A8543] rounded-md text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#D1D7DC] rounded-lg p-4 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subject, or keyword..."
            className="w-full pr-4 py-2 text-sm rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none search-input-with-icon"
            style={{ paddingLeft: '2.75rem' }}
          />
          <Search className="w-4 h-4 text-[#6A6F73] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#555555] shrink-0 whitespace-nowrap">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 rounded border border-[#757575] bg-white font-medium focus:border-[#0056D2] focus:outline-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#555555] shrink-0 whitespace-nowrap">Level:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="text-xs py-2 px-3 rounded border border-[#757575] bg-white font-medium focus:border-[#0056D2] focus:outline-none cursor-pointer"
          >
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#555555] shrink-0 whitespace-nowrap">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-3 rounded border border-[#757575] bg-white font-medium focus:border-[#0056D2] focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published Only</option>
            <option value="Draft">Draft Only</option>
          </select>
        </div>
      </div>

      {/* Course Data Table */}
      <div className="bg-white border border-[#D1D7DC] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#D1D7DC] text-[#555555] uppercase tracking-wider font-bold">
                <th className="p-4">Course</th>
                <th className="p-4">Domain / Category</th>
                <th className="p-4">Level</th>
                <th className="p-4 text-center">Lessons</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-[#555555]">
                    No courses match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => {
                  const lessonCount = course.videos?.length || 0;
                  return (
                    <tr key={course._id} className="hover:bg-[#F9FAFB] transition-colors">
                      {/* Course Title & Thumbnail */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded bg-slate-100 overflow-hidden shrink-0 border border-[#D1D7DC]">
                            <img
                              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#1F1F1F] hover:text-[#0056D2] cursor-pointer" onClick={() => onEditCourse(course)}>
                              {course.title}
                            </div>
                            <div className="text-[#6A6F73] text-[11px] line-clamp-1 max-w-sm">
                              {course.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Domain / Category */}
                      <td className="p-4">
                        <span className="font-semibold text-[#0056D2] bg-[#EBF3FF] px-2.5 py-1 rounded">
                          {course.category}
                        </span>
                      </td>

                      {/* Level */}
                      <td className="p-4">
                        <span className="font-semibold text-[#1F1F1F]">
                          {course.level}
                        </span>
                      </td>

                      {/* Lessons Count */}
                      <td className="p-4 text-center font-bold text-[#1F1F1F]">
                        <span className="inline-flex items-center gap-1 bg-[#F5F7FA] px-2.5 py-1 rounded border border-[#E0E0E0]">
                          <Video className="w-3 h-3 text-[#0056D2]" />
                          <span>{lessonCount}</span>
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleTogglePublish(course._id)}
                          disabled={loadingAction === course._id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-bold uppercase text-[10px] transition-colors cursor-pointer border ${
                            course.isPublished
                              ? 'bg-[#E6F4EA] text-[#0A8543] border-[#A8DAB5] hover:bg-[#cdeed4]'
                              : 'bg-[#FFF0EB] text-[#B4690E] border-[#FFD0B8] hover:bg-[#ffe3d6]'
                          }`}
                          title="Click to toggle publication"
                        >
                          {course.isPublished ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Lessons */}
                          <button
                            onClick={() => onEditLessons(course)}
                            className="p-1.5 rounded hover:bg-[#EBF3FF] text-[#0056D2] transition-colors"
                            title="Edit Curriculum & Lessons"
                          >
                            <Layers className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => onEditCourse(course)}
                            className="p-1.5 rounded hover:bg-[#EBF3FF] text-[#0056D2] transition-colors"
                            title="Edit Course Configuration"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteCourse(course._id, course.title)}
                            disabled={loadingAction === course._id}
                            className="p-1.5 rounded hover:bg-[#FDF2F2] text-[#DC2626] transition-colors"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;

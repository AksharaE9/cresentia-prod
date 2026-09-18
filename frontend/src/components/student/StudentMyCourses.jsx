import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  Search,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import api from '../../services/api';

const StudentMyCourses = ({ enrollments = [], onRefresh }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all' | 'in_progress' | 'completed'
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  const filteredEnrollments = enrollments.filter((e) => {
    const title = e.course?.title || '';
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
    const isCompleted = e.progressPercent === 100 || (e.quizScore >= 70);

    if (!matchesSearch) return false;
    if (filter === 'in_progress') return !isCompleted;
    if (filter === 'completed') return isCompleted;
    return true;
  });

  const handleDownloadCertificate = async (courseId, courseTitle) => {
    try {
      setDownloadingId(courseId);
      const res = await api.get(`/enrollments/${courseId}/certificate`, {
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `crescentia-certificate-${courseTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Unable to download certificate. Make sure you passed the final assessment with at least 70%.');
    } finally {
      setDownloadingId(null);
    }
  };

  const inProgressCount = enrollments.filter((e) => (e.progressPercent || 0) < 100 && (!e.quizScore || e.quizScore < 70)).length;
  const completedCount = enrollments.filter((e) => e.progressPercent === 100 || (e.quizScore >= 70)).length;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-[#D1D7DC]">
        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-[#0056D2] text-white'
                : 'bg-[#F0F2F5] text-[#555555] hover:bg-[#E4E6EB]'
            }`}
          >
            All Courses ({enrollments.length})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${
              filter === 'in_progress'
                ? 'bg-[#0056D2] text-white'
                : 'bg-[#F0F2F5] text-[#555555] hover:bg-[#E4E6EB]'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${
              filter === 'completed'
                ? 'bg-[#0056D2] text-white'
                : 'bg-[#F0F2F5] text-[#555555] hover:bg-[#E4E6EB]'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter enrolled courses..."
            className="w-full pr-3 py-1.5 text-xs rounded-md border border-[#D1D7DC] focus:border-[#0056D2] focus:outline-none search-input-with-icon"
            style={{ paddingLeft: '2.75rem' }}
          />
          <Search className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Course Cards Grid */}
      {filteredEnrollments.length === 0 ? (
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="text-base font-bold text-[#1F1F1F]">
            {filter === 'completed'
              ? 'No completed courses yet'
              : filter === 'in_progress'
              ? 'No courses in progress'
              : 'No enrolled courses found'}
          </div>
          <p className="text-xs text-[#555555] max-w-sm mx-auto">
            {enrollments.length === 0
              ? 'You are not enrolled in any courses yet. Contact your institution administrator or explore available courses.'
              : 'Try adjusting your search query or filter tab to find what you need.'}
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="coursera-btn-primary inline-flex items-center gap-2"
          >
            <span>Explore Course Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((e) => {
            const course = e.course;
            if (!course) return null;

            const progress = e.progressPercent || 0;
            const hasPassedQuiz = e.quizScore >= 70;
            const totalVideos = course.videos?.length || 0;
            const completedVideos = e.completedVideos?.length || 0;

            return (
              <div
                key={e._id}
                className="bg-white border border-[#D1D7DC] rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Top Banner / Category */}
                <div>
                  <div className="h-32 bg-gradient-to-r from-[#0056D2] to-[#00419E] p-4 flex flex-col justify-between text-white relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded">
                        {course.category || 'General'}
                      </span>
                      <span className="text-[10px] font-semibold bg-black/30 px-2 py-0.5 rounded">
                        {course.level || 'All Levels'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold line-clamp-2 text-white leading-tight">
                        {course.title}
                      </h4>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-[#555555] line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-[#6A6F73] pt-1">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {totalVideos} Lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.estimatedDuration || Math.ceil((totalVideos * 25) / 60)}h total
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1F1F1F]">
                          {progress}% Completed
                        </span>
                        <span className="text-[#6A6F73] text-[11px]">
                          {completedVideos}/{totalVideos} lessons
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0056D2] rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Assessment & Certification Status */}
                    <div className="pt-2">
                      {hasPassedQuiz ? (
                        <div className="p-2 bg-[#E6F4EA] border border-[#A8DAB5] rounded-md text-xs font-semibold text-[#0A8543] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-[#0A8543]" />
                            Certified (Score: {e.quizScore}%)
                          </span>
                          <span className="text-[10px] bg-[#0A8543] text-white px-1.5 py-0.5 rounded uppercase">
                            Passed
                          </span>
                        </div>
                      ) : e.quizSubmittedAt ? (
                        <div className="p-2 bg-[#FFF4E5] border border-[#FFE0B2] rounded-md text-xs font-semibold text-[#B76E00] flex items-center justify-between">
                          <span>Assessment Score: {e.quizScore}% (Needs 70%)</span>
                          <span className="text-[10px] bg-[#B76E00] text-white px-1.5 py-0.5 rounded uppercase">
                            Retry
                          </span>
                        </div>
                      ) : progress >= 70 ? (
                        <div className="p-2 bg-[#EBF3FF] border border-[#C2DCFF] rounded-md text-xs font-semibold text-[#0056D2] flex items-center gap-1.5">
                          <FileCheck className="w-4 h-4" />
                          <span>Ready for Final Assessment</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-0 border-t border-[#F0F2F5] mt-2 flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="w-full py-2.5 px-4 bg-[#0056D2] hover:bg-[#00419E] text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{progress > 0 ? 'Resume Classroom' : 'Start Learning'}</span>
                  </button>

                  {hasPassedQuiz && (
                    <button
                      onClick={() => handleDownloadCertificate(course._id, course.title)}
                      disabled={downloadingId === course._id}
                      className="w-full py-2 px-4 bg-white border border-[#0056D2] text-[#0056D2] hover:bg-[#EBF3FF] font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>
                        {downloadingId === course._id ? 'Generating PDF...' : 'Download Certificate'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentMyCourses;

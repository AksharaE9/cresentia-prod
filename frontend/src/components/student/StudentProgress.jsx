import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle,
  Award,
  BookOpen,
  Calendar,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

const StudentProgress = ({ enrollments = [] }) => {
  const navigate = useNavigate();

  // Metrics computation
  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter((e) => e.progressPercent === 100 || (e.quizScore >= 70)).length;
  const totalLessonsWatched = enrollments.reduce((sum, e) => sum + (e.completedVideos?.length || 0), 0);
  const totalLessonsAvailable = enrollments.reduce((sum, e) => sum + (e.course?.videos?.length || 0), 0);
  
  const overallProgress = totalCourses > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progressPercent || 0), 0) / totalCourses)
    : 0;

  const attemptedQuizzes = enrollments.filter((e) => e.quizSubmittedAt);
  const averageScore = attemptedQuizzes.length > 0
    ? Math.round(attemptedQuizzes.reduce((sum, e) => sum + (e.quizScore || 0), 0) / attemptedQuizzes.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
              Overall Progress
            </span>
            <div className="w-8 h-8 rounded-full bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1F1F1F]">{overallProgress}%</span>
            <span className="text-xs text-[#555555]">across all courses</span>
          </div>
          <div className="w-full h-1.5 bg-[#E0E0E0] rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-[#0056D2] rounded-full"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-[#D1D7DC] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
              Lessons Watched
            </span>
            <div className="w-8 h-8 rounded-full bg-[#E6F4EA] text-[#0A8543] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1F1F1F]">
              {totalLessonsWatched}
            </span>
            <span className="text-xs text-[#555555]">
              of {totalLessonsAvailable} lessons
            </span>
          </div>
          <div className="text-[11px] text-[#0A8543] mt-2 font-semibold">
            {totalLessonsAvailable > 0
              ? `${Math.round((totalLessonsWatched / totalLessonsAvailable) * 100)}% curriculum covered`
              : 'Enrolled in courses'}
          </div>
        </div>

        <div className="bg-white border border-[#D1D7DC] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
              Average Assessment
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FFF4E5] text-[#B76E00] flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1F1F1F]">
              {averageScore > 0 ? `${averageScore}%` : 'N/A'}
            </span>
            <span className="text-xs text-[#555555]">
              {attemptedQuizzes.length} exam(s) taken
            </span>
          </div>
          <div className="text-[11px] text-[#555555] mt-2">
            70% required to unlock certificates
          </div>
        </div>

        <div className="bg-white border border-[#D1D7DC] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
              Certificates Earned
            </span>
            <div className="w-8 h-8 rounded-full bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0056D2]">{completedCourses}</span>
            <span className="text-xs text-[#555555]">of {totalCourses} courses</span>
          </div>
          <div className="text-[11px] text-[#0056D2] mt-2 font-semibold">
            Official verifiable credentials
          </div>
        </div>
      </div>

      {/* Course-by-Course Progress Detail */}
      <div className="bg-white border border-[#D1D7DC] rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F8F9FA] border-b border-[#D1D7DC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#0056D2]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
              Detailed Course Progress Breakdown
            </h3>
          </div>
          <span className="text-xs text-[#555555]">
            {enrollments.length} Enrolled Courses
          </span>
        </div>

        {enrollments.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#555555]">
            No progress data recorded yet. Start watching lessons to track your learning progress!
          </div>
        ) : (
          <div className="divide-y divide-[#E0E0E0]">
            {enrollments.map((e) => {
              const course = e.course;
              if (!course) return null;

              const progress = e.progressPercent || 0;
              const completedCount = e.completedVideos?.length || 0;
              const totalCount = course.videos?.length || 0;
              const hasPassed = e.quizScore >= 70;

              return (
                <div key={e._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#FBFBFC] transition-colors">
                  {/* Left: Course Info & Lessons */}
                  <div className="space-y-2 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F0F2F5] text-[#555555] px-2 py-0.5 rounded">
                        {course.category || 'Curriculum'}
                      </span>
                      <span className="text-[10px] text-[#6A6F73]">
                        Enrolled {new Date(e.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#1F1F1F] leading-snug">
                      {course.title}
                    </h4>

                    <div className="flex items-center gap-4 text-xs text-[#555555]">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-[#0A8543]" />
                        {completedCount} of {totalCount} lessons completed
                      </span>
                      {e.quizSubmittedAt && (
                        <span className="flex items-center gap-1 font-semibold">
                          Exam Score: {e.quizScore}% {hasPassed ? '✓ Passed' : '✗ Try again'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center: Progress Bar */}
                  <div className="flex-1 max-w-xs space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1F1F1F]">{progress}% Complete</span>
                      <span className="text-[#6A6F73]">
                        {progress === 100 ? 'Course Finished' : `${100 - progress}% remaining`}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#E0E0E0] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          hasPassed || progress === 100 ? 'bg-[#0A8543]' : 'bg-[#0056D2]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="px-4 py-2 bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Learning Milestones & Badges */}
      <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0056D2] flex items-center gap-2">
          <Award className="w-4 h-4" />
          <span>Learner Milestones</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${totalLessonsWatched >= 1 ? 'bg-[#E6F4EA] border-[#A8DAB5]' : 'bg-[#F8F9FA] border-[#E0E0E0] opacity-60'}`}>
            <div className="flex items-center gap-2 font-bold text-xs text-[#1F1F1F]">
              <CheckCircle2 className={`w-4 h-4 ${totalLessonsWatched >= 1 ? 'text-[#0A8543]' : 'text-[#757575]'}`} />
              <span>First Step</span>
            </div>
            <p className="text-[11px] text-[#555555] mt-1">
              Watched your first lesson video in Crescentia.
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${attemptedQuizzes.length >= 1 ? 'bg-[#E6F4EA] border-[#A8DAB5]' : 'bg-[#F8F9FA] border-[#E0E0E0] opacity-60'}`}>
            <div className="flex items-center gap-2 font-bold text-xs text-[#1F1F1F]">
              <CheckCircle2 className={`w-4 h-4 ${attemptedQuizzes.length >= 1 ? 'text-[#0A8543]' : 'text-[#757575]'}`} />
              <span>Assessment Challenger</span>
            </div>
            <p className="text-[11px] text-[#555555] mt-1">
              Attempted a final course assessment to test knowledge.
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${completedCourses >= 1 ? 'bg-[#E6F4EA] border-[#A8DAB5]' : 'bg-[#F8F9FA] border-[#E0E0E0] opacity-60'}`}>
            <div className="flex items-center gap-2 font-bold text-xs text-[#1F1F1F]">
              <CheckCircle2 className={`w-4 h-4 ${completedCourses >= 1 ? 'text-[#0A8543]' : 'text-[#757575]'}`} />
              <span>Certified Graduate</span>
            </div>
            <p className="text-[11px] text-[#555555] mt-1">
              Passed assessment with 70%+ and earned a verified certificate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;

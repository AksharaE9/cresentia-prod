import { Link } from 'react-router-dom';
import { Star, Award, Clock, BookOpen, CheckCircle } from 'lucide-react';

const CourseCard = ({ course }) => {
  const buttonLabel = course.progressPercent > 0 ? 'Continue Learning' : 'Enroll';

  return (
    <article className="bg-white border border-[#D1D7DC] rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200 group text-left">
      {/* Course Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-[#E0E0E0]">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {course.progressPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-[#0056D2] text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm">
            {course.progressPercent}% Completed
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Institutional / Partner Line */}
          <div className="flex items-center gap-1.5 text-xs text-[#555555] font-semibold mb-2 uppercase tracking-wide">
            <span className="text-[#0056D2] font-bold">Crescentia Academy</span>
            <span>•</span>
            <span className="text-[#0A8543] font-bold bg-[#E6F4EA] px-1.5 py-0.5 rounded text-[11px]">
              {course.level || 'Beginner'}
            </span>
          </div>

          {/* Course Title */}
          <h3 className="text-base sm:text-lg font-bold text-[#1F1F1F] group-hover:text-[#0056D2] transition-colors line-clamp-2 leading-snug mb-2">
            {course.title}
          </h3>

          {/* Skills Gain Strip */}
          <p className="text-xs text-[#555555] line-clamp-2 mb-3 leading-relaxed">
            <strong className="text-[#1F1F1F]">Skills you'll gain:</strong> {course.category}, Problem Solving, Real-world Implementation
          </p>
        </div>

        <div>
          {/* Ratings and Lessons Metadata */}
          <div className="flex items-center gap-2 text-xs mb-3 text-[#555555]">
            <div className="flex items-center gap-1 text-[#B4690E] font-bold">
              <Star className="w-3.5 h-3.5 fill-[#E59819] text-[#E59819]" />
              <span>4.8</span>
            </div>
            <span>•</span>
            <span>{course.lessonCount || 0} lessons</span>
            <span>•</span>
            <span>{course.durationLabel || 'Approx. 10 hours'}</span>
          </div>

          {/* Progress Bar (if in progress) */}
          {course.progressPercent > 0 && (
            <div className="w-full h-1.5 bg-[#E0E0E0] rounded-full overflow-hidden mb-3.5">
              <div
                className="h-full bg-[#0056D2] rounded-full transition-all duration-300"
                style={{ width: `${course.progressPercent}%` }}
              />
            </div>
          )}

          {/* Coursera Action Button */}
          <Link
            to={`/courses/${course._id}`}
            className="coursera-btn-primary w-full text-center"
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;

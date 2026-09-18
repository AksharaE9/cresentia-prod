import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, CheckCircle } from 'lucide-react';

const FALLBACK_THUMBNAILS = [
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
];

const getCourseMeta = (course) => {
  const seed = (course._id || course.id || course.title || 'cres')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const ratings = ['4.8', '4.7', '4.6', '4.8', '4.9'];
  const rating =
    course.ratingAverage && course.ratingAverage > 0
      ? course.ratingAverage.toFixed(1)
      : ratings[seed % ratings.length];

  const counts = ['202,235', '8,960', '11,300', '436,083', '142,500', '28,400', '95,120'];
  const ratingCount = course.ratingCount
    ? Number(course.ratingCount).toLocaleString()
    : counts[seed % counts.length];

  const prices = [
    { price: '569.00', original: '3,199.00' },
    { price: '549.00', original: '799.00' },
    { price: '549.00', original: '799.00' },
    { price: '569.00', original: '3,199.00' },
    { price: '499.00', original: '1,999.00' },
    { price: '599.00', original: '2,499.00' }
  ];
  const priceObj = course.price
    ? { price: Number(course.price).toFixed(2), original: (Number(course.price) * 3).toFixed(2) }
    : prices[seed % prices.length];

  const instructors = [
    'TIA Training, Andrew Ramdayal',
    'Prof. Ryan Ahmed, PhD, MBA, Stemplicity Inc.',
    'Ligency , Ed Donner',
    'Dr. Angela Yu, Developer and Lead Instructor',
    'Crescentia Industry Faculty',
    'Meta Certified Professional Staff'
  ];
  const instructor =
    course.instructorName ||
    course.instructor?.name ||
    instructors[seed % instructors.length];

  const fallbackThumb = FALLBACK_THUMBNAILS[seed % FALLBACK_THUMBNAILS.length];

  return {
    rating,
    ratingCount,
    price: priceObj.price,
    originalPrice: priceObj.original,
    instructor,
    fallbackThumb
  };
};

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(course.thumbnail || null);
  const meta = getCourseMeta(course);

  const isEnrolled = course.progressPercent > 0;
  const courseId = course._id || course.id;

  const handleOpenCourse = () => {
    navigate(`/courses/${courseId}`);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/courses/${courseId}`);
  };

  return (
    <article
      onClick={handleOpenCourse}
      className="bg-white border border-[#D1D7DC] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between hover:shadow-lg hover:border-[#A435F0]/40 transition-all duration-200 group text-left cursor-pointer relative select-none h-full"
    >
      {/* Top Details */}
      <div>
        {/* Course Thumbnail */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100 border border-gray-100 mb-2.5">
          <img
            src={imgSrc || meta.fallbackThumb}
            alt={course.title}
            onError={() => setImgSrc(meta.fallbackThumb)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isEnrolled && (
            <div className="absolute top-2 right-2 bg-[#0056D2] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>{course.progressPercent}% Completed</span>
            </div>
          )}
        </div>

        {/* Course Title */}
        <h3 className="font-bold text-[#1C1D1F] text-[15px] sm:text-base leading-snug line-clamp-2 mt-1 group-hover:text-[#5624D0] transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-xs text-[#6A6F73] mt-1 line-clamp-1">
          {meta.instructor}
        </p>

        {/* Badges & Rating */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {/* Bestseller Badge */}
          <span className="bg-[#D1F2EB] text-[#0D6251] text-[11px] font-bold px-2 py-0.5 rounded-[3px] shrink-0">
            Bestseller
          </span>

          {/* Rating Box */}
          <div className="flex items-center gap-1 border border-[#D1D7DC] rounded-[3px] px-1.5 py-0.5 text-xs text-[#2D2F31]">
            <span className="flex items-center gap-0.5 font-bold text-[#B4690E]">
              <Star className="w-3.5 h-3.5 fill-[#E59819] text-[#E59819]" />
              {meta.rating}
            </span>
            <span className="text-[#6A6F73] text-[11px]">
              {meta.ratingCount} ratings
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: Price & Add to Cart */}
      <div className="flex items-center justify-between mt-3 pt-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-base sm:text-lg font-extrabold text-[#1C1D1F]">
            ₹{meta.price}
          </span>
          <span className="text-xs text-[#6A6F73] line-through">
            ₹{meta.originalPrice}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="border border-[#A435F0] text-[#A435F0] hover:bg-[#FBF4FE] font-bold text-xs sm:text-[13px] px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          {isEnrolled ? 'Go to course' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
};

export default CourseCard;

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Filter, Star, Clock, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const categories = [
  'All',
  'Web Development',
  'Machine Learning',
  'API Development',
  'Business Analysis',
  'Auth Concepts',
  'Backend Basics'
];
const sortOptions = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Title (A-Z)', value: 'title-asc' },
  { label: 'Newest Releases', value: 'newest' }
];
const ratingOptions = [
  { label: 'All Ratings', value: 'all' },
  { label: '4.5 & up', value: '4.5' },
  { label: '4.0 & up', value: '4.0' }
];
const durationOptions = [
  { label: 'All Durations', value: 'all' },
  { label: '< 2 Hours', value: 'short' },
  { label: '2 - 5 Hours', value: 'medium' },
  { label: '5+ Hours', value: 'long' }
];

const getVideoType = (url = '') => (url.includes('drive.google.com') ? 'drive' : url ? 'video' : '');

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [resolvedDurations, setResolvedDurations] = useState({});
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(true);

  // Sync with searchParams if changed in URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedLevel !== 'All') params.level = selectedLevel;
        if (query) params.q = query;

        const requests = [api.get('/courses', { params })];
        if (user) {
          requests.push(api.get('/enrollments'));
        }

        const results = await Promise.allSettled(requests);
        const courseRes = results[0];
        const enrollmentRes = results[1];

        setCourses(courseRes?.status === 'fulfilled' ? courseRes.value.data : []);
        setEnrollments(enrollmentRes?.status === 'fulfilled' ? enrollmentRes.value.data : []);
      } catch (error) {
        console.error('Failed to load courses:', error);
        setCourses([]);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedLevel, query, user]);

  useEffect(() => {
    if (!courses.length) {
      setResolvedDurations({});
      return;
    }

    let isCancelled = false;

    const loadCourseDurations = async () => {
      const entries = await Promise.all(
        courses.map(async (course) => {
          const videos = course.videos || [];

          const videoDurations = await Promise.all(
            videos.map(
              (video) =>
                new Promise((resolve) => {
                  if (getVideoType(video.url) !== 'video') {
                    resolve(null);
                    return;
                  }

                  const media = document.createElement('video');
                  media.preload = 'metadata';
                  media.src = video.url.trim();

                  const cleanup = () => {
                    media.removeAttribute('src');
                    media.load();
                  };

                  media.onloadedmetadata = () => {
                    const minutes = Number.isFinite(media.duration) ? Math.max(1, Math.ceil(media.duration / 60)) : null;
                    cleanup();
                    resolve(minutes);
                  };

                  media.onerror = () => {
                    cleanup();
                    resolve(null);
                  };
                })
            )
          );

          const resolvedValues = videoDurations.filter((value) => typeof value === 'number');
          const unresolvedCount = videos.length - resolvedValues.length;

          return [
            course._id,
            {
              minutes: resolvedValues.reduce((sum, value) => sum + value, 0),
              unresolvedCount
            }
          ];
        })
      );

      if (!isCancelled) {
        setResolvedDurations(Object.fromEntries(entries));
      }
    };

    loadCourseDurations();

    return () => {
      isCancelled = true;
    };
  }, [courses]);

  const courseCards = useMemo(() => {
    let result = courses.map((course) => {
      const enrollment = enrollments.find((item) => item.course?._id === course._id);
      const durationInfo = resolvedDurations[course._id];
      let durationMinutes = durationInfo ? durationInfo.minutes : 120;
      let durationLabel = 'Loading duration...';

      if (durationInfo) {
        durationLabel =
          durationInfo.unresolvedCount > 0
            ? `${durationInfo.minutes} mins+`
            : `${durationInfo.minutes} mins`;
      }

      return {
        ...course,
        durationMinutes,
        lessonCount: course.videos?.length || 0,
        durationLabel,
        progressPercent: enrollment?.progressPercent || 0,
        status:
          enrollment?.progressPercent === 100
            ? 'Completed'
            : enrollment?.progressPercent > 0
            ? 'In Progress'
            : 'Not Started'
      };
    });

    // Multi-facet Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(
        (c) => (c.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Rating filter
    if (selectedRating !== 'all') {
      const minRating = parseFloat(selectedRating);
      result = result.filter((c) => (c.ratingAverage || 4.8) >= minRating);
    }

    // Duration filter
    if (selectedDuration === 'short') {
      result = result.filter((c) => c.durationMinutes < 120);
    } else if (selectedDuration === 'medium') {
      result = result.filter((c) => c.durationMinutes >= 120 && c.durationMinutes <= 300);
    } else if (selectedDuration === 'long') {
      result = result.filter((c) => c.durationMinutes > 300);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.ratingAverage || 4.8) - (a.ratingAverage || 4.8);
      }
      if (sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      // default: popular
      return (b.studentsAssigned?.length || 0) - (a.studentsAssigned?.length || 0);
    });

    return result;
  }, [courses, enrollments, resolvedDurations, selectedCategory, selectedRating, selectedDuration, sortBy]);

  const handleResetFilters = () => {
    setSelectedLevel('All');
    setSelectedCategory('All');
    setSelectedRating('all');
    setSelectedDuration('all');
    setSortBy('popular');
    setQuery('');
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedLevel !== 'All' ||
    selectedCategory !== 'All' ||
    selectedRating !== 'all' ||
    selectedDuration !== 'all' ||
    sortBy !== 'popular' ||
    Boolean(query);

  return (
    <main className="container page text-left">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-[#0056D2] hover:text-[#00419E] text-sm font-semibold mb-4 bg-transparent border-none cursor-pointer px-0 py-1 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      {/* Hero Header */}
      <section className="bg-[#EBF3FF] border border-[#C2DCFF] rounded-lg p-8 sm:p-10 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0056D2] mb-1 block">
            {user ? `Welcome back, ${user.name}` : 'Crescentia Learning Catalog'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F1F1F] tracking-tight mb-2">
            Explore Courses
          </h1>
          <p className="text-[#555555] text-sm sm:text-base max-w-xl">
            {user
              ? 'Start, resume, or finish courses. Complete video lessons and pass the final assessment to unlock your verified certificate.'
              : 'Browse all certificate programs and specializations. Enroll to access video lessons, quizzes, and credentials.'}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-white border border-[#D1D7DC] rounded-md p-4 text-center min-w-[100px] flex-1 md:flex-none shadow-xs">
            <div className="text-2xl font-black text-[#0056D2]">{courseCards.length}</div>
            <div className="text-xs text-[#555555] font-semibold">Available Courses</div>
          </div>
          {user && (
            <>
              <div className="bg-white border border-[#D1D7DC] rounded-md p-4 text-center min-w-[100px] flex-1 md:flex-none shadow-xs">
                <div className="text-2xl font-black text-[#0A8543]">
                  {enrollments.filter((item) => item.progressPercent > 0 && item.progressPercent < 100).length}
                </div>
                <div className="text-xs text-[#555555] font-semibold">In Progress</div>
              </div>
              <div className="bg-white border border-[#D1D7DC] rounded-md p-4 text-center min-w-[100px] flex-1 md:flex-none shadow-xs">
                <div className="text-2xl font-black text-[#1F1F1F]">
                  {enrollments.filter((item) => item.progressPercent === 100).length}
                </div>
                <div className="text-xs text-[#555555] font-semibold">Completed</div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Multi-Facet Filter Bar (Udemy & Coursera Style) */}
      <section className="bg-white border border-[#D1D7DC] rounded-xl p-5 mb-8 shadow-xs space-y-4">
        {/* Top Search Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by course title, topic, or skill..."
              className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-sm text-[#1F1F1F]"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-xs font-bold text-[#555555] whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-3 rounded-lg border border-[#757575] focus:border-[#0056D2] focus:outline-none text-sm text-[#1F1F1F] bg-white font-medium cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs font-bold text-[#555555] whitespace-nowrap mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-[#0056D2] text-white border-[#0056D2]'
                  : 'bg-[#F8F9FA] text-[#555555] border-[#E0E0E0] hover:bg-slate-200 hover:text-[#1F1F1F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Facets: Level, Duration, Rating & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0F2F5]">
          <div className="flex flex-wrap items-center gap-3">
            {/* Level Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#555555]">Level:</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="py-1.5 px-2.5 rounded-md border border-[#D1D7DC] text-xs text-[#1F1F1F] bg-white font-medium cursor-pointer focus:border-[#0056D2]"
              >
                {levels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#555555]">Rating:</span>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="py-1.5 px-2.5 rounded-md border border-[#D1D7DC] text-xs text-[#1F1F1F] bg-white font-medium cursor-pointer focus:border-[#0056D2]"
              >
                {ratingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Duration Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#555555]">Duration:</span>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="py-1.5 px-2.5 rounded-md border border-[#D1D7DC] text-xs text-[#1F1F1F] bg-white font-medium cursor-pointer focus:border-[#0056D2]"
              >
                {durationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary & Reset Button */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#6A6F73]">
              Showing {courseCards.length} {courseCards.length === 1 ? 'course' : 'courses'}
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs font-bold text-[#0056D2] hover:text-[#00419E] bg-transparent border-none cursor-pointer py-1 px-2 rounded hover:bg-[#EBF3FF] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset filters</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {loading && <div className="loading-spinner">Loading courses...</div>}

      {!loading && courseCards.length === 0 && (
        <div className="beautiful-empty-state">
          <div className="empty-state-icon">📚</div>
          <h3 className="empty-state-title">No courses match your filters</h3>
          <p className="empty-state-description mb-4">
            Try adjusting your search keywords, category, or rating filters to see more results.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="coursera-btn-primary"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {!loading && courseCards.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {courseCards.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </section>
      )}
    </main>
  );
};

export default HomePage;

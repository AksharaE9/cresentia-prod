import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
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
    return courses.map((course) => {
      const enrollment = enrollments.find((item) => item.course?._id === course._id);
      const durationInfo = resolvedDurations[course._id];
      let durationLabel = 'Loading duration...';

      if (durationInfo) {
        durationLabel =
          durationInfo.unresolvedCount > 0
            ? `${durationInfo.minutes} mins+`
            : `${durationInfo.minutes} mins`;
      }

      return {
        ...course,
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
  }, [courses, enrollments, resolvedDurations]);

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
          <div className="bg-white border border-[#D1D7DC] rounded-md p-4 text-center min-w-[100px] flex-1 md:flex-none">
            <div className="text-2xl font-black text-[#0056D2]">{courseCards.length}</div>
            <div className="text-xs text-[#555555] font-semibold">Available Courses</div>
          </div>
          {user && (
            <>
              <div className="bg-white border border-[#D1D7DC] rounded-md p-4 text-center min-w-[100px] flex-1 md:flex-none">
                <div className="text-2xl font-black text-[#0A8543]">
                  {enrollments.filter((item) => item.progressPercent > 0 && item.progressPercent < 100).length}
                </div>
                <div className="text-xs text-[#555555] font-semibold">In Progress</div>
              </div>
              <div className="bg-white border border-[#D1D7DC] rounded-md p-4 text-center min-w-[100px] flex-1 md:flex-none">
                <div className="text-2xl font-black text-[#1F1F1F]">
                  {enrollments.filter((item) => item.progressPercent === 100).length}
                </div>
                <div className="text-xs text-[#555555] font-semibold">Completed</div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Coursera Search and Filter Bar */}
      <section className="bg-white border border-[#D1D7DC] rounded-lg p-4 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by course title, topic, or skill..."
            className="w-full pl-4 pr-10 py-2.5 rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-sm text-[#1F1F1F]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-[#555555] whitespace-nowrap">Filter Level:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="py-2.5 px-3 rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none text-sm text-[#1F1F1F] bg-white font-medium cursor-pointer"
          >
            {levels.map((level) => (
              <option key={level}>{level}</option>
            ))}
          </select>
        </div>
      </section>

      {loading && <div className="loading-spinner">Loading courses...</div>}

      {!loading && courseCards.length === 0 && (
        <div className="beautiful-empty-state">
          <div className="empty-state-icon">📚</div>
          <h3 className="empty-state-title">No courses found</h3>
          <p className="empty-state-description">
            Try another search or level filter. The course landing page reads directly from the backend catalog.
          </p>
        </div>
      )}

      {!loading && courseCards.length > 0 && (
        <section className="grid courses-grid">
          {courseCards.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </section>
      )}
    </main>
  );
};

export default HomePage;

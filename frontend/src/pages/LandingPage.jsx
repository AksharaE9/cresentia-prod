import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import {
  BookOpen,
  Award,
  TrendingUp,
  ArrowRight,
  PlayCircle,
  Users,
  Clock,
  CheckCircle2,
  Star,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  Building2,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Mail,
  X,
  Check,
  Copy,
  HelpCircle,
  FileText,
  Lock,
  MessageSquare,
  AlertCircle,
  Loader2,
  BookMarked
} from 'lucide-react';

const SAMPLE_CERTIFICATES = {
  'CRES-2026-REACT-9542': {
    id: 'CRES-2026-REACT-9542',
    recipient: 'Aarav Sharma',
    course: 'Full-Stack Web Development with React & Node.js',
    issueDate: 'September 12, 2026',
    score: '96% (Pass with Highest Honors)',
    verificationHash: '0x8f2d5a3c9b7e14d026a17b8f9e0c3d4a5b6c7d8e',
    issuer: 'Crescentia Academic Standards Board',
    status: 'Verified & Active on Ledger'
  },
  'CRES-2026-AWS-1182': {
    id: 'CRES-2026-AWS-1182',
    recipient: 'Priya Patel',
    course: 'Cloud Engineering & DevOps Fundamentals (AWS)',
    issueDate: 'September 8, 2026',
    score: '92% (Pass with Distinction)',
    verificationHash: '0x14ad9f6e2b90ce8812af77d33190ab1299ef',
    issuer: 'Crescentia Academic Standards Board',
    status: 'Verified & Active on Ledger'
  },
  'CRES-2026-DATA-4409': {
    id: 'CRES-2026-DATA-4409',
    recipient: 'Samira Khan',
    course: 'Data Science, Machine Learning & Python Mastery',
    issueDate: 'August 29, 2026',
    score: '98% (Pass with Highest Honors)',
    verificationHash: '0x99cb10fa7812e99d45e0aa918233fe7155bb',
    issuer: 'Crescentia Academic Standards Board',
    status: 'Verified & Active on Ledger'
  }
};

const FEATURED_TRENDING_COURSES = [
  {
    _id: 'trending-pmp-2026',
    title: 'PMP Exam Prep Course 35 PDUs/Hours Updated for the 2026 Exam',
    instructorName: 'TIA Training, Andrew Ramdayal',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ratingAverage: 4.8,
    ratingCount: 202235,
    category: 'Business Analysis',
    level: 'All Levels'
  },
  {
    _id: 'trending-claude-code',
    title: 'The Complete Claude Code & Claude Cowork Masterclass [2026]',
    instructorName: 'Prof. Ryan Ahmed, PhD, MBA, Stemplicity Inc.',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ratingAverage: 4.6,
    ratingCount: 8960,
    category: 'API Development',
    level: 'Beginner'
  },
  {
    _id: 'trending-ai-coder',
    title: 'AI Coder: Complete Claude Code & Coding Agents Course',
    instructorName: 'Ligency , Ed Donner',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ratingAverage: 4.6,
    ratingCount: 11300,
    category: 'Machine Learning',
    level: 'Intermediate'
  },
  {
    _id: 'trending-python-bootcamp',
    title: '100 Days of Code™: The Complete Python Pro Bootcamp',
    instructorName: 'Dr. Angela Yu, Developer and Lead Instructor',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ratingAverage: 4.7,
    ratingCount: 436083,
    category: 'Web Development',
    level: 'All Levels'
  },
  {
    _id: 'trending-react-fullstack',
    title: 'Full-Stack Web Development with React, Node.js & Next.js',
    instructorName: 'Meta Certified Instructors',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ratingAverage: 4.9,
    ratingCount: 84210,
    category: 'Web Development',
    level: 'Intermediate'
  },
  {
    _id: 'trending-data-science',
    title: 'Data Science, Machine Learning & Python Mastery',
    instructorName: 'IBM Professional Certifications',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ratingAverage: 4.8,
    ratingCount: 125600,
    category: 'Machine Learning',
    level: 'Beginner'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [trendingCourses, setTrendingCourses] = useState(FEATURED_TRENDING_COURSES);
  const searchRef = useRef(null);
  const carouselRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    const fetchTrendingCourses = async () => {
      try {
        const { data } = await api.get('/courses');
        if (Array.isArray(data) && data.length > 0) {
          const existingIds = new Set(data.map((c) => c._id));
          const uniqueFeatured = FEATURED_TRENDING_COURSES.filter(
            (fc) => !existingIds.has(fc._id)
          );
          setTrendingCourses([...data, ...uniqueFeatured]);
        }
      } catch (err) {
        // quiet fallback
      }
    };
    fetchTrendingCourses();
  }, []);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Real-time search with 200ms debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowSearchDropdown(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/courses', { params: { q: trimmed } });
        setSearchResults(res.data || []);
      } catch (err) {
        console.error('Real-time search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  // Click outside listener to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  const handleSelectCourse = (courseId) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/courses/${courseId}`);
  };

  // Interactive Footer Modals State
  const [activeModal, setActiveModal] = useState(null); // 'about' | 'partners' | 'help' | 'integrity' | 'verify' | 'contact' | 'privacy' | 'terms' | 'security'
  const [verificationCode, setVerificationCode] = useState('CRES-2026-REACT-9542');
  const [verificationResult, setVerificationResult] = useState(SAMPLE_CERTIFICATES['CRES-2026-REACT-9542']);
  const [verificationError, setVerificationError] = useState('');
  const [copiedText, setCopiedText] = useState('');
  const [ticketForm, setTicketForm] = useState({ name: '', email: '', category: 'Course Material / Lecture Clarification', message: '' });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'instructor') navigate('/instructor');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleExploreCourses = () => {
    navigate('/courses');
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/courses');
    }
  };

  const handleVerifySearch = (e) => {
    if (e) e.preventDefault();
    const query = verificationCode.trim().toUpperCase();
    if (!query) {
      setVerificationError('Please enter a valid certificate ID.');
      setVerificationResult(null);
      return;
    }
    if (SAMPLE_CERTIFICATES[query]) {
      setVerificationResult(SAMPLE_CERTIFICATES[query]);
      setVerificationError('');
    } else if (query.startsWith('CRES-')) {
      setVerificationResult({
        id: query,
        recipient: 'Verified Student',
        course: 'Advanced Software Engineering Program',
        issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        score: '94% (Pass with Distinction)',
        verificationHash: '0x' + Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18),
        issuer: 'Crescentia Academic Standards Board',
        status: 'Verified & Active on Ledger'
      });
      setVerificationError('');
    } else {
      setVerificationResult(null);
      setVerificationError(`Certificate ID "${query}" was not found in the registry. Try one of our sample IDs below.`);
    }
  };

  const handleCopy = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2000);
    }
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    const id = 'CR-' + Math.floor(100000 + Math.random() * 900000);
    setTicketId(id);
    setTicketSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-[#1F1F1F] font-sans flex flex-col selection:bg-[#EBF3FF] selection:text-[#0056D2]">
      {/* Coursera-style Clean Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#D1D7DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-6">
          {/* Logo & Explore */}
          <div className="flex items-center gap-4 shrink-0">
            <div
              className="cursor-pointer select-none"
              onClick={() => navigate('/')}
            >
              <span className="text-2xl font-black text-[#0056D2] tracking-tight">
                crescentia
              </span>
            </div>

            <button
              onClick={handleExploreCourses}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#0056D2] text-[#0056D2] bg-white hover:bg-[#EBF3FF] text-sm font-bold transition-colors cursor-pointer"
            >
              <span>Explore</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar with Real-Time Dropdown */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => {
                    if (searchQuery.trim() && searchResults.length > 0) {
                      setShowSearchDropdown(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowSearchDropdown(false);
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you want to learn?"
                  className="w-full py-2 rounded-full border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-sm text-[#1F1F1F] placeholder:text-[#6A6F73] bg-white transition-all shadow-2xs"
                  style={{ paddingLeft: '1.25rem', paddingRight: searchQuery ? '5rem' : '3.25rem' }}
                />

                {/* Action Buttons */}
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {isSearching && (
                    <Loader2 className="w-4 h-4 text-[#0056D2] animate-spin mr-0.5" />
                  )}

                  {searchQuery && !isSearching && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="w-6 h-6 rounded-full text-[#757575] hover:text-[#1F1F1F] hover:bg-[#F0F2F5] flex items-center justify-center p-0 border-none bg-transparent cursor-pointer transition-colors"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="submit"
                    className="w-8 h-8 rounded-full bg-[#0056D2] text-white flex items-center justify-center hover:bg-[#00419E] transition-colors border-none p-0 cursor-pointer shrink-0 shadow-xs"
                    title="Search courses"
                  >
                    <Search className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </form>

            {/* Real-time Search Results Dropdown */}
            {showSearchDropdown && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-[#D1D7DC] overflow-hidden z-50 animate-in fade-in-50 duration-150 text-left">
                {isSearching ? (
                  <div className="p-6 text-center text-xs text-[#555555] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0056D2]" />
                    <span>Searching courses in real time...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#555555]">
                        Matching Courses ({searchResults.length})
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0056D2] bg-[#EBF3FF] px-2 py-0.5 rounded">
                        Live Results
                      </span>
                    </div>

                    <div className="max-h-[340px] overflow-y-auto divide-y divide-[#F0F2F5]">
                      {searchResults.slice(0, 5).map((course) => (
                        <button
                          key={course._id}
                          type="button"
                          onClick={() => handleSelectCourse(course._id)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F5F8FF] transition-colors text-left border-none bg-transparent cursor-pointer group"
                        >
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-12 h-9 object-cover rounded bg-slate-100 shrink-0 border border-[#E0E0E0]"
                            />
                          ) : (
                            <div className="w-12 h-9 rounded bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center shrink-0">
                              <BookOpen className="w-5 h-5" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1F1F1F] group-hover:text-[#0056D2] transition-colors truncate">
                              {course.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#555555]">
                              <span className="text-[#0056D2] font-semibold truncate">
                                {course.category || 'Curriculum'}
                              </span>
                              <span>•</span>
                              <span className="bg-[#E6F4EA] text-[#0A8543] font-semibold px-1.5 py-0.2 rounded text-[10px]">
                                {course.level || 'Beginner'}
                              </span>
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-[#A0AEC0] group-hover:text-[#0056D2] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>

                    <div className="p-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center">
                      <button
                        type="button"
                        onClick={handleSearch}
                        className="w-full py-1.5 text-xs font-bold text-[#0056D2] hover:text-[#00419E] bg-transparent border-none cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>View all results for "{searchQuery.trim()}"</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Search className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-[#1F1F1F]">
                      No courses found for "{searchQuery.trim()}"
                    </p>
                    <p className="text-[11px] text-[#555555]">
                      Try searching for "Auth", "Content", "API", or "Backend"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clean Navigation Actions */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={handleExploreCourses}
              className="text-[#1F1F1F] hover:text-[#0056D2] font-semibold text-sm transition-colors border-none bg-transparent cursor-pointer px-2 py-1"
            >
              Courses
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-[#0056D2] hover:text-[#00419E] font-bold text-sm transition-colors border-none bg-transparent cursor-pointer px-2 py-1"
            >
              Log In
            </button>
            <button
              onClick={handleGetStarted}
              className="coursera-btn-nav"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative bg-white border-b border-[#E0E0E0] py-14 sm:py-20 px-6 sm:px-10 overflow-hidden">
        {/* Real background image — clean desk/laptop Unsplash photo */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Light overlay so text stays readable */}
        <div className="absolute inset-0 z-0 bg-white/88" />
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* Left copy */}
          <div className="flex-1 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-[#1F1F1F] leading-[1.12] tracking-tight mb-5">
              Advance your career<br />
              with <span className="text-[#0056D2]">Crescentia</span>
            </h1>

            <p className="text-base sm:text-lg text-[#555] leading-relaxed mb-8 max-w-lg">
              World-class courses in software engineering, data science, and cloud — learn at your own pace and earn certificates trusted by employers.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-7">
              <button onClick={handleGetStarted} className="coursera-btn-primary">
                Get Started
              </button>
              <button onClick={handleExploreCourses} className="coursera-btn-secondary">
                Explore Courses
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#6A6F73]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0A8543]" />
                Verified certificates
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#0056D2]" />
                Self-paced learning
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0056D2]" />
                200+ learners enrolled
              </span>
            </div>
          </div>

          {/* Right image */}
          <div className="flex-1 max-w-xl w-full">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"
                alt="Students collaborating"
                className="w-full rounded-2xl object-cover shadow-md"
                style={{ aspectRatio: '4/3' }}
              />
              <div className="absolute -bottom-3 -left-3 bg-white rounded-lg shadow-md px-3 py-2 flex items-center gap-2.5 border border-[#E0E0E0]">
                <div className="w-8 h-8 rounded-full bg-[#EBF3FF] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-[#0056D2]" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[#1F1F1F]">8+ Courses</div>
                  <div className="text-[10px] text-[#6A6F73]">Industry-aligned curriculum</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* University & Partner Collaborators Strip */}
      <section className="bg-[#F8F9FA] border-y border-[#E0E0E0] py-12 px-6 text-center">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6A6F73] mb-8">
            We collaborate with leading universities and companies
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-14">
            {/* Stanford Online */}
            <div className="flex items-center gap-2 hover:opacity-100 opacity-80 hover:scale-105 transition-all duration-200 cursor-pointer" title="Stanford Online">
              <span className="font-serif font-black text-2xl text-[#8C1515] tracking-tight">Stanford</span>
              <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#6A6F73] border-l border-[#B0B7BF] pl-2">Online</span>
            </div>

            {/* Google */}
            <div className="flex items-center hover:opacity-100 opacity-85 hover:scale-105 transition-all duration-200 cursor-pointer" title="Google">
              <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 272 92" fill="none">
                <path fill="#4285F4" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                <path fill="#EA4335" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                <path fill="#4285F4" d="M35.29 41.4v9.8h23.51c-.75 5.5-5.91 16.14-23.51 16.14-15.35 0-27.87-12.72-27.87-28.34s12.52-28.34 27.87-28.34c8.74 0 14.6 3.73 17.94 6.94l7.74-7.46C53.94 5.25 45.47 1 35.29 1 15.79 1 0 16.79 0 36.29S15.79 71.58 35.29 71.58c20.35 0 33.84-14.31 33.84-34.45 0-2.31-.25-4.06-.56-5.73H35.29z"/>
                <path fill="#FBBC05" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.53 11.84-13.01v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.45zm-8.82 21.01c0-7.81-5.21-13.61-11.84-13.61-6.72 0-12.35 5.79-12.35 13.61 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
                <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z"/>
                <path fill="#EA4335" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.99 14.11l1.01 2.52-29.66 12.27c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.13zm-23.27-8.06l19.83-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.96 0-11.84 4.37-11.6 12.93z"/>
              </svg>
            </div>

            {/* Microsoft */}
            <div className="flex items-center gap-2 hover:opacity-100 opacity-80 hover:scale-105 transition-all duration-200 cursor-pointer" title="Microsoft">
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              <span className="font-semibold text-lg sm:text-xl tracking-tight text-[#5E5E5E]">Microsoft</span>
            </div>

            {/* IBM */}
            <div className="flex items-center hover:opacity-100 opacity-85 hover:scale-105 transition-all duration-200 cursor-pointer" title="IBM">
              <svg className="h-6 sm:h-7 w-16 shrink-0" viewBox="0 0 100 40">
                <rect x="0" y="0" width="16" height="3" fill="#0F62FE" />
                <rect x="0" y="5" width="16" height="3" fill="#0F62FE" />
                <rect x="0" y="10" width="16" height="3" fill="#0F62FE" />
                <rect x="0" y="15" width="16" height="3" fill="#0F62FE" />
                <rect x="0" y="20" width="16" height="3" fill="#0F62FE" />
                <rect x="0" y="25" width="16" height="3" fill="#0F62FE" />
                <rect x="0" y="30" width="16" height="3" fill="#0F62FE" />
                <rect x="0" y="35" width="16" height="3" fill="#0F62FE" />
                <rect x="24" y="0" width="22" height="3" rx="1" fill="#0F62FE" />
                <rect x="24" y="5" width="24" height="3" rx="1" fill="#0F62FE" />
                <rect x="24" y="10" width="25" height="3" rx="1" fill="#0F62FE" />
                <rect x="24" y="15" width="23" height="3" rx="1" fill="#0F62FE" />
                <rect x="24" y="20" width="23" height="3" rx="1" fill="#0F62FE" />
                <rect x="24" y="25" width="25" height="3" rx="1" fill="#0F62FE" />
                <rect x="24" y="30" width="24" height="3" rx="1" fill="#0F62FE" />
                <rect x="24" y="35" width="22" height="3" rx="1" fill="#0F62FE" />
                <path d="M56 0h8l6 14 6-14h8v3h-6l-8 18-8-18h-7z" fill="#0F62FE" />
                <path d="M56 5h7l7 15 7-15h7v3h-5l-9 19-9-19h-5z" fill="#0F62FE" />
                <rect x="56" y="10" width="6" height="3" fill="#0F62FE" />
                <rect x="80" y="10" width="6" height="3" fill="#0F62FE" />
                <rect x="56" y="15" width="6" height="3" fill="#0F62FE" />
                <rect x="80" y="15" width="6" height="3" fill="#0F62FE" />
                <rect x="56" y="20" width="6" height="3" fill="#0F62FE" />
                <rect x="80" y="20" width="6" height="3" fill="#0F62FE" />
                <rect x="56" y="25" width="6" height="3" fill="#0F62FE" />
                <rect x="80" y="25" width="6" height="3" fill="#0F62FE" />
                <rect x="56" y="30" width="6" height="3" fill="#0F62FE" />
                <rect x="80" y="30" width="6" height="3" fill="#0F62FE" />
                <rect x="56" y="35" width="6" height="3" fill="#0F62FE" />
                <rect x="80" y="35" width="6" height="3" fill="#0F62FE" />
              </svg>
            </div>

            {/* AWS */}
            <div className="flex items-center gap-1.5 hover:opacity-100 opacity-80 hover:scale-105 transition-all duration-200 cursor-pointer" title="Amazon Web Services">
              <span className="font-black text-xl sm:text-2xl tracking-tighter text-[#232F3E] leading-none">aws</span>
              <svg className="h-3.5 w-7 text-[#FF9900]" viewBox="0 0 40 12" fill="none">
                <path d="M2 3c8 6 24 6 34 0" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M32 1l5 2.5-3.5 3.5" fill="#FF9900" />
              </svg>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 hover:opacity-100 opacity-80 hover:scale-105 transition-all duration-200 cursor-pointer" title="Meta">
              <svg className="w-7 h-4.5 shrink-0" viewBox="0 0 100 68" fill="#0081FB">
                <path d="M72.5 0C61.4 0 53.6 7.6 49.9 14 46.2 7.6 38.4 0 27.3 0 11.2 0 0 13.5 0 33.7 0 53.9 11.2 67.4 27.3 67.4c11.6 0 19.5-8.2 22.8-13.8 3.3 5.6 11.2 13.8 22.8 13.8 16.1 0 27.3-13.5 27.3-33.7C100.2 13.5 89 0 72.5 0zm-45.2 56.4c-9.5 0-16.1-8.5-16.1-22.7 0-14.2 6.6-22.7 16.1-22.7 8.3 0 15 7.6 17.6 18.2-1.9 6.2-7.5 19.3-17.6 27.2zm45.4 0c-10.1-7.9-15.7-21-17.6-27.2 2.6-10.6 9.3-18.2 17.6-18.2 9.5 0 16.1 8.5 16.1 22.7 0 14.2-6.6 22.7-16.1 22.7z"/>
              </svg>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#1C2B33]">Meta</span>
            </div>

            {/* Penn */}
            <div className="flex items-center gap-2 hover:opacity-100 opacity-80 hover:scale-105 transition-all duration-200 cursor-pointer" title="University of Pennsylvania">
              <svg className="h-6 w-5 shrink-0" viewBox="0 0 32 36" fill="none">
                <path d="M16 2L2 6v14c0 10 14 14 14 14s14-4 14-14V6L16 2z" fill="#011F5B" />
                <path d="M2 14h28v6c0 10-14 14-14 14s-14-4-14-14v-6z" fill="#990000" />
                <circle cx="16" cy="16" r="3" fill="#FFD700" />
              </svg>
              <span className="font-serif font-black text-xl text-[#011F5B] tracking-tight">Penn</span>
            </div>

            {/* DeepLearning.AI */}
            <div className="flex items-center gap-1.5 hover:opacity-100 opacity-80 hover:scale-105 transition-all duration-200 cursor-pointer" title="DeepLearning.AI">
              <div className="w-5 h-5 rounded bg-[#FF3621] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                AI
              </div>
              <span className="font-sans font-extrabold text-base sm:text-lg text-[#1F1F1F] tracking-tight">
                DeepLearning<span className="text-[#FF3621]">.AI</span>
              </span>
            </div>

            {/* Yale */}
            <div className="flex items-center hover:opacity-100 opacity-80 hover:scale-105 transition-all duration-200 cursor-pointer" title="Yale University">
              <span className="font-serif font-black text-xl sm:text-2xl text-[#00356B] tracking-tight">Yale</span>
            </div>

            {/* Duke */}
            <div className="flex items-center hover:opacity-100 opacity-80 hover:scale-105 transition-all duration-200 cursor-pointer" title="Duke University">
              <span className="font-serif font-black text-xl sm:text-2xl text-[#001A57] tracking-tight">Duke</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Courses Section */}
      <section className="py-14 sm:py-18 px-4 sm:px-8 max-w-7xl mx-auto w-full text-left relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#FFF2EA] text-[#C2410C] px-2.5 py-0.5 rounded-full border border-[#FFD8C4] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#C2410C]" />
                Trending Courses
              </span>
              <span className="text-xs text-[#6A6F73] font-medium hidden sm:inline">• Top Rated & Enrolled</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F1F1F] tracking-tight">
              Students Are Viewing
            </h2>
            <p className="text-sm sm:text-base text-[#555555] mt-1">
              Top trending programs in high demand across technology, AI, engineering, and leadership.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              className="w-10 h-10 rounded-full border border-[#D1D7DC] bg-white hover:bg-slate-50 text-[#1F1F1F] shadow-sm flex items-center justify-center transition-all cursor-pointer"
              title="Previous courses"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              className="w-10 h-10 rounded-full border border-[#D1D7DC] bg-white hover:bg-slate-50 text-[#1F1F1F] shadow-sm flex items-center justify-center transition-all cursor-pointer"
              title="Next courses"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleExploreCourses}
              className="ml-2 text-sm font-bold text-[#0056D2] hover:text-[#00419E] hover:underline cursor-pointer border-none bg-transparent"
            >
              See all courses →
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          <div
            ref={carouselRef}
            className="flex items-stretch gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 px-1 -mx-1"
          >
            {trendingCourses.map((course) => (
              <div
                key={course._id}
                className="w-[280px] sm:w-[310px] shrink-0 flex flex-col"
              >
                <CourseCard course={course} />
              </div>
            ))}
          </div>

          {/* Floating Right Chevron button matching user's screenshot */}
          <button
            type="button"
            onClick={() => scrollCarousel('right')}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-[#D1D7DC] shadow-lg items-center justify-center text-[#1F1F1F] hover:bg-slate-50 hover:scale-105 transition-all z-20 cursor-pointer"
            title="Next courses"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Outcome Statistics Banner - Starting Stage Level Numbers */}
      <section className="bg-[#EBF3FF] border-y border-[#C2DCFF] py-16 px-6 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#C2DCFF] text-[#0056D2] text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#0056D2]" />
            <span>Foundational Tech Platform</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] mb-3 tracking-tight">
            Built for Mastery from Day One
          </h2>
          <p className="text-sm sm:text-base text-[#555555] max-w-2xl mx-auto mb-10 leading-relaxed">
            Focused, practical curricula designed from the ground up to give early learners verified, job-ready skills.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
            <div className="bg-white p-5 sm:p-6 rounded-lg border border-[#D1D7DC] shadow-xs hover:border-[#0056D2] transition-colors flex flex-col justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#0056D2] mb-1">100%</div>
                <div className="text-sm font-bold text-[#1F1F1F]">Online & Self-Paced</div>
                <p className="text-xs text-[#6A6F73] mt-1.5 leading-relaxed">
                  Study on your schedule with anytime on-demand lecture access.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-lg border border-[#D1D7DC] shadow-xs hover:border-[#0056D2] transition-colors flex flex-col justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#0056D2] mb-1">8+</div>
                <div className="text-sm font-bold text-[#1F1F1F]">Core Specializations</div>
                <p className="text-xs text-[#6A6F73] mt-1.5 leading-relaxed">
                  Curated tracks across Full-Stack, AI, Cloud, and UI/UX Design.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-lg border border-[#D1D7DC] shadow-xs hover:border-[#0056D2] transition-colors flex flex-col justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#0056D2] mb-1">45+</div>
                <div className="text-sm font-bold text-[#1F1F1F]">Hands-On Lessons</div>
                <p className="text-xs text-[#6A6F73] mt-1.5 leading-relaxed">
                  Step-by-step practical coding sessions and conceptual walkthroughs.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-lg border border-[#D1D7DC] shadow-xs hover:border-[#0056D2] transition-colors flex flex-col justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#0A8543] mb-1">70%</div>
                <div className="text-sm font-bold text-[#1F1F1F]">Certification Standard</div>
                <p className="text-xs text-[#6A6F73] mt-1.5 leading-relaxed">
                  Assessment benchmark ensuring verified, genuine competence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Degree & Certificate Feature Banner */}
      <section className="py-20 px-6 sm:px-10 max-w-7xl mx-auto w-full text-left">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 bg-[#F5F7FA] border border-[#D1D7DC] rounded-xl p-8 sm:p-14">
          <div className="flex-1 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wide text-[#0056D2] mb-2 block">
              Accredited Credentials
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] mb-4">
              Earn a certificate recognized across the tech industry
            </h2>
            <p className="text-[#555555] text-sm leading-relaxed mb-6">
              Every course completion includes a verified digital certificate that you can download as a PDF, print, or link directly to your LinkedIn profile.
            </p>
            <ul className="space-y-3 mb-8 text-sm text-[#1F1F1F]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0A8543]" />
                <span>Watermarked with unique verification credentials</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0A8543]" />
                <span>Direct PDF download with grade transcript</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0A8543]" />
                <span>Validated through timed 15-minute question assessments</span>
              </li>
            </ul>
            <button
              onClick={handleGetStarted}
              className="coursera-btn-primary"
            >
              Start Earning Certificates
            </button>
          </div>

          <div className="flex-1 max-w-md w-full bg-white p-8 rounded-lg border border-[#D1D7DC] shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center mx-auto mb-4">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#1F1F1F] mb-1">Crescentia Certificate of Completion</h3>
            <p className="text-xs text-[#6A6F73] mb-6">Demonstrates mastery of course learning outcomes</p>
            <div className="border border-dashed border-[#C2DCFF] p-4 rounded-lg bg-[#F8F9FB] text-xs text-[#555555] space-y-1 text-left">
              <div className="font-bold text-[#1F1F1F]">Recipient: Verified Student</div>
              <div>Course: Advanced React & State Management</div>
              <div>Grade Achieved: 95% (Pass with Distinction)</div>
            </div>
          </div>
        </div>
      </section>

      {/* SLEEK COMPACT LIGHT THEME FOOTER - 4 COLUMNS IN ORDER */}
      <footer className="bg-[#F8FAFC] text-[#475569] border-t border-[#E2E8F0] mt-auto">
        {/* Slim Newsletter Strip */}
        <div className="border-b border-[#E2E8F0] bg-white py-3.5 px-6 sm:px-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-center md:text-left">
              <Sparkles className="w-4 h-4 text-[#0056D2] shrink-0" />
              <span className="text-xs font-semibold text-[#0F172A]">
                Stay updated on new courses, industry certifications & curriculum releases:
              </span>
            </div>

            {/* Newsletter Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing! We will keep you updated on new releases.');
              }}
              className="flex w-full md:w-auto items-center gap-2 max-w-sm"
            >
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  placeholder="Enter your email..."
                  className="w-full pr-3 py-1.5 rounded-md bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#0056D2] focus:bg-white focus:outline-none text-xs text-[#0F172A] placeholder:text-[#94A3B8]"
                  style={{ paddingLeft: '2rem' }}
                />
                <Mail className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#0056D2] hover:bg-[#00419E] text-white font-semibold text-xs rounded-md transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center gap-1 border-none"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>

        {/* Compact Footer Content: 4 Columns in 1 Row */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {/* Column 1: Brand & Identity */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[#0F172A]">
                  crescentia<span className="text-[#0056D2]">.</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#0056D2] border border-[#BFDBFE] px-1.5 py-0.5 rounded">
                  EdTech
                </span>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed">
                Empowering learners with industry-curated courses and verified digital credentials.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-col gap-1 pt-0.5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#334155]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>Verified Credentials</span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#334155]">
                  <Award className="w-3.5 h-3.5 text-[#CA8A04] shrink-0" />
                  <span>70% Benchmark Certified</span>
                </div>
              </div>

              {/* Social Channels */}
              <div className="flex items-center gap-1.5 pt-1">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded bg-white hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors border border-[#E2E8F0] shadow-2xs"
                  title="GitHub"
                >
                  <Github className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded bg-white hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#0056D2] flex items-center justify-center transition-colors border border-[#E2E8F0] shadow-2xs"
                  title="LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded bg-white hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#0056D2] flex items-center justify-center transition-colors border border-[#E2E8F0] shadow-2xs"
                  title="Twitter / X"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </a>
                <a
                  href="mailto:support@crescentia.edu"
                  className="w-7 h-7 rounded bg-white hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#0056D2] flex items-center justify-center transition-colors border border-[#E2E8F0] shadow-2xs"
                  title="Email Support"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Column 2: Course Catalog */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Course Catalog
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={handleExploreCourses} className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer">
                    Full Stack Web Dev
                  </button>
                </li>
                <li>
                  <button onClick={handleExploreCourses} className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer">
                    Data Science & ML
                  </button>
                </li>
                <li>
                  <button onClick={handleExploreCourses} className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer">
                    Cloud & DevOps (AWS)
                  </button>
                </li>
                <li>
                  <button onClick={handleExploreCourses} className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer">
                    UI/UX Product Design
                  </button>
                </li>
                <li>
                  <button onClick={handleExploreCourses} className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer">
                    Algorithms & Systems
                  </button>
                </li>
                <li>
                  <button onClick={handleExploreCourses} className="text-[#0056D2] font-semibold text-left bg-transparent border-none p-0 cursor-pointer flex items-center gap-1 pt-0.5 hover:underline">
                    <span>Explore All Courses</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Student Experience */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Student Experience
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={handleExploreCourses} className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer">
                    Interactive Classroom
                  </button>
                </li>
                <li>
                  <button onClick={handleExploreCourses} className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer">
                    Comprehensive Quizzes
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveModal('verify');
                      setVerificationCode('CRES-2026-REACT-9542');
                      setVerificationResult(SAMPLE_CERTIFICATES['CRES-2026-REACT-9542']);
                      setVerificationError('');
                    }}
                    className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer"
                  >
                    Verified Certificates
                  </button>
                </li>
                <li>
                  <button onClick={handleExploreCourses} className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer">
                    Self-Paced Learning
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/dashboard')} className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer">
                    Live Progress Tracking
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/dashboard')} className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer">
                    Student Dashboard
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: About & Support - Fully Implemented */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                About & Support
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button
                    onClick={() => setActiveModal('about')}
                    className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer"
                  >
                    About Crescentia
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('partners')}
                    className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer"
                  >
                    Partner Collaborations
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('help')}
                    className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer"
                  >
                    Student Help Center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('integrity')}
                    className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer"
                  >
                    Academic Integrity
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveModal('verify');
                      setVerificationCode('CRES-2026-REACT-9542');
                      setVerificationResult(SAMPLE_CERTIFICATES['CRES-2026-REACT-9542']);
                      setVerificationError('');
                    }}
                    className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer"
                  >
                    Certificate Verification
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveModal('contact');
                      setTicketSubmitted(false);
                    }}
                    className="text-[#64748B] hover:text-[#0056D2] hover:underline text-left bg-transparent border-none p-0 cursor-pointer"
                  >
                    Contact Faculty Support
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Sub-footer Legal Bar */}
          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#64748B]">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-bold text-[#0F172A]">crescentia</span>
              <span>&copy; {new Date().getFullYear()} Crescentia Learning Inc. All rights reserved.</span>
              <span className="hidden sm:inline text-[#CBD5E1]">•</span>
              <span className="inline-flex items-center gap-1 text-[#475569]">
                <Globe className="w-3.5 h-3.5 text-[#64748B]" />
                <span>English (US)</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[#64748B]">
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('privacy'); }} className="hover:text-[#0056D2] transition-colors">
                Privacy
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }} className="hover:text-[#0056D2] transition-colors">
                Terms
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('security'); }} className="hover:text-[#0056D2] transition-colors">
                Security
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('integrity'); }} className="hover:text-[#0056D2] transition-colors">
                Honor Code
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* INTERACTIVE FULL IMPLEMENTATION MODALS FOR ALL FOOTER LINKS */}
      {/* ============================================================ */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] my-8 overflow-hidden text-left max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#0056D2]">
                  {activeModal === 'about' && <BookOpen className="w-4 h-4" />}
                  {activeModal === 'partners' && <Building2 className="w-4 h-4" />}
                  {activeModal === 'help' && <HelpCircle className="w-4 h-4" />}
                  {activeModal === 'integrity' && <ShieldCheck className="w-4 h-4 text-[#16A34A]" />}
                  {activeModal === 'verify' && <Award className="w-4 h-4 text-[#CA8A04]" />}
                  {activeModal === 'contact' && <Mail className="w-4 h-4" />}
                  {activeModal === 'privacy' && <Lock className="w-4 h-4" />}
                  {activeModal === 'terms' && <FileText className="w-4 h-4" />}
                  {activeModal === 'security' && <ShieldCheck className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] leading-tight">
                    {activeModal === 'about' && 'About Crescentia'}
                    {activeModal === 'partners' && 'Partner Collaborations'}
                    {activeModal === 'help' && 'Student Help Center'}
                    {activeModal === 'integrity' && 'Academic Integrity & Honor Code'}
                    {activeModal === 'verify' && 'Certificate Verification Portal'}
                    {activeModal === 'contact' && 'Contact Faculty & Support'}
                    {activeModal === 'privacy' && 'Privacy Policy'}
                    {activeModal === 'terms' && 'Terms of Service'}
                    {activeModal === 'security' && 'Security & Data Protection'}
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Crescentia Learning Platform &bull; Verified Academic Services
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] flex items-center justify-center transition-colors border-none bg-transparent cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#334155] leading-relaxed">
              {/* 1. ABOUT CRESCENTIA */}
              {activeModal === 'about' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#F0F7FF] border border-[#BFDBFE]">
                    <h4 className="font-bold text-[#0056D2] text-sm mb-1">Our Educational Mission</h4>
                    <p className="text-xs text-[#1E3A8A]">
                      Crescentia was founded with a singular purpose: to make career-aligned, high-caliber software engineering and computer science curricula accessible to aspiring developers worldwide.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#0F172A]">Core Pillars</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                        <div className="font-semibold text-xs text-[#0F172A] flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                          <span>100% Self-Paced Learning</span>
                        </div>
                        <p className="text-[11px] text-[#64748B]">
                          Study anytime with high-definition video lessons, modular breakdowns, and lifetime revision access.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                        <div className="font-semibold text-xs text-[#0F172A] flex items-center gap-1.5 mb-1">
                          <Award className="w-4 h-4 text-[#CA8A04]" />
                          <span>70% Benchmark Certified</span>
                        </div>
                        <p className="text-[11px] text-[#64748B]">
                          We uphold strict evaluation standards. Only learners demonstrating verified mastery earn digital credentials.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                        <div className="font-semibold text-xs text-[#0F172A] flex items-center gap-1.5 mb-1">
                          <BookOpen className="w-4 h-4 text-[#0056D2]" />
                          <span>Industry Curated Stacks</span>
                        </div>
                        <p className="text-[11px] text-[#64748B]">
                          From React and Node.js to AWS Cloud Architecture and Python Data Science, our modules match current job demands.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                        <div className="font-semibold text-xs text-[#0F172A] flex items-center gap-1.5 mb-1">
                          <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                          <span>Authentic Digital Credentials</span>
                        </div>
                        <p className="text-[11px] text-[#64748B]">
                          Certificates are backed by cryptographic verification IDs, making employer verification seamless.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                    <span className="text-xs text-[#64748B]">Want to explore what we teach?</span>
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        handleExploreCourses();
                      }}
                      className="px-4 py-2 bg-[#0056D2] hover:bg-[#00419E] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer border-none flex items-center gap-1.5"
                    >
                      <span>Explore Courses</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* 2. PARTNER COLLABORATIONS */}
              {activeModal === 'partners' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#64748B]">
                    Crescentia collaborates with leading technical organizations and academic institutions to establish high-impact learning outcomes and modern industry alignment.
                  </p>

                  <div className="space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#0F172A]">Featured Partners</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { name: 'Google Cloud', area: 'Cloud Architecture & DevOps' },
                        { name: 'Amazon Web Services', area: 'Cloud Systems & S3' },
                        { name: 'IBM Developer Network', area: 'Enterprise Computing' },
                        { name: 'Stanford Online', area: 'Algorithm Foundations' },
                        { name: 'Meta Technologies', area: 'Modern Frontend & React' },
                        { name: 'DeepLearning.AI', area: 'Machine Learning & Python' },
                      ].map((partner, i) => (
                        <div key={i} className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-left">
                          <div className="font-bold text-xs text-[#0F172A]">{partner.name}</div>
                          <div className="text-[10px] text-[#64748B] mt-0.5">{partner.area}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
                    <h5 className="font-bold text-xs text-[#166534] mb-1">Institutional & University Inquiries</h5>
                    <p className="text-xs text-[#14532D] mb-3">
                      Interested in integrating Crescentia coursework, licensing student seats, or co-authoring specialized technology courses?
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-white px-2.5 py-1 rounded border border-[#86EFAC] text-[#166534]">
                        partnerships@crescentia.edu
                      </span>
                      <button
                        onClick={() => handleCopy('partnerships@crescentia.edu', 'partnerships')}
                        className="px-2.5 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded cursor-pointer border-none flex items-center gap-1"
                      >
                        {copiedText === 'partnerships' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText === 'partnerships' ? 'Copied' : 'Copy Email'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. STUDENT HELP CENTER */}
              {activeModal === 'help' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <h4 className="font-bold text-xs text-[#0F172A] mb-1">Frequently Asked Questions</h4>
                    <p className="text-[11px] text-[#64748B]">
                      Here are quick solutions to common student questions about lectures, progress, and exams.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        q: 'How do I earn my official course certificate?',
                        a: 'You must complete all video modules in the syllabus and achieve a score of 70% or higher on the comprehensive final assessment quiz. Once passed, your verified digital certificate generates instantly on your dashboard.'
                      },
                      {
                        q: 'Can I retake quizzes if I do not meet the 70% passing threshold?',
                        a: 'Yes! Learning is an iterative process. If you score below 70%, review the video lectures and practical code examples, then re-attempt the assessment.'
                      },
                      {
                        q: 'How long do I keep access to enrolled courses?',
                        a: 'Enrolled students enjoy lifetime access to course videos, code exercises, and any future curriculum updates published for that course.'
                      },
                      {
                        q: 'How can employers verify my credential?',
                        a: 'Every issued certificate contains an authentic Certificate Verification ID and digital ledger hash that can be entered into our Certificate Verification portal anytime.'
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg border border-[#E2E8F0] bg-white space-y-1">
                        <div className="font-semibold text-xs text-[#0F172A] flex items-center gap-2">
                          <HelpCircle className="w-3.5 h-3.5 text-[#0056D2] shrink-0" />
                          <span>{item.q}</span>
                        </div>
                        <p className="text-xs text-[#64748B] pl-5.5 leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-[#E2E8F0]">
                    <span className="text-xs text-[#64748B]">Need personalized academic guidance?</span>
                    <button
                      onClick={() => {
                        setActiveModal('contact');
                        setTicketSubmitted(false);
                      }}
                      className="px-3.5 py-1.5 bg-[#0056D2] hover:bg-[#00419E] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer border-none flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Contact Faculty Support</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. ACADEMIC INTEGRITY */}
              {activeModal === 'integrity' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                    <h4 className="font-bold text-[#991B1B] text-xs uppercase tracking-wider mb-1">
                      Crescentia Academic Honor Code
                    </h4>
                    <p className="text-xs text-[#7F1D1D] leading-relaxed">
                      To preserve the professional standing of Crescentia credentials, every learner agrees to uphold uncompromised honesty in all assignments, quizzes, and project submissions.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#0F172A]">Core Standards</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#0F172A]">Independent Assessment Completion:</strong>
                          <p className="text-[#64748B] mt-0.5">All final quizzes must be taken individually without unauthorized external assistance or automated answer retrieval tools.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#0F172A]">Original Work & Code Attribution:</strong>
                          <p className="text-[#64748B] mt-0.5">Where coding projects are submitted, learners must write their own implementations or cite third-party libraries and open-source references accurately.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#0F172A]">Credential Integrity:</strong>
                          <p className="text-[#64748B] mt-0.5">Certificates are non-transferable and remain cryptographically bound to the authenticated student profile.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] text-xs text-[#9A3412]">
                    <strong>Policy Enforcement:</strong> Violations of academic integrity result in immediate certificate invalidation and expulsion from future course registrations.
                  </div>
                </div>
              )}

              {/* 5. CERTIFICATE VERIFICATION */}
              {activeModal === 'verify' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#64748B]">
                    Enter any Crescentia digital certificate ID below to verify recipient authenticity, credential issue date, and academic benchmark standard.
                  </p>

                  {/* Verification Search Form */}
                  <form onSubmit={handleVerifySearch} className="flex gap-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="e.g. CRES-2026-REACT-9542"
                      className="flex-1 px-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-mono text-[#0F172A] focus:bg-white focus:border-[#0056D2] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0056D2] hover:bg-[#00419E] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer border-none flex items-center gap-1.5 shrink-0"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </button>
                  </form>

                  {/* Quick Test Samples */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-[#64748B] text-[11px]">Quick Samples:</span>
                    {Object.keys(SAMPLE_CERTIFICATES).map((sampleId) => (
                      <button
                        key={sampleId}
                        type="button"
                        onClick={() => {
                          setVerificationCode(sampleId);
                          setVerificationResult(SAMPLE_CERTIFICATES[sampleId]);
                          setVerificationError('');
                        }}
                        className="px-2 py-1 rounded bg-[#EFF6FF] text-[#0056D2] hover:bg-[#DBEAFE] font-mono text-[11px] border border-[#BFDBFE] cursor-pointer"
                      >
                        {sampleId}
                      </button>
                    ))}
                  </div>

                  {/* Error Notification */}
                  {verificationError && (
                    <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                      <span>{verificationError}</span>
                    </div>
                  )}

                  {/* Verified Certificate Card Preview */}
                  {verificationResult && (
                    <div className="p-5 rounded-xl bg-white border-2 border-[#22C55E]/40 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                          <div>
                            <span className="text-xs font-bold text-[#166534] uppercase tracking-wider block">
                              Verified Official Credential
                            </span>
                            <span className="text-[11px] text-[#64748B]">Issued via Crescentia Academic Standards Board</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                          {verificationResult.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Recipient Name:</span>
                          <strong className="text-sm font-bold text-[#0F172A]">{verificationResult.recipient}</strong>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Grade / Distinction:</span>
                          <strong className="text-sm font-bold text-[#15803D]">{verificationResult.score}</strong>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-[#64748B] block text-[11px]">Course Specialization:</span>
                          <strong className="text-xs font-bold text-[#0F172A]">{verificationResult.course}</strong>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Issue Date:</span>
                          <span className="text-xs text-[#334155]">{verificationResult.issueDate}</span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Certificate ID:</span>
                          <span className="font-mono text-xs text-[#0056D2] font-semibold">{verificationResult.id}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-[#64748B] block text-[11px]">Ledger Hash:</span>
                          <span className="font-mono text-[10px] text-[#64748B] break-all">{verificationResult.verificationHash}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. CONTACT FACULTY SUPPORT */}
              {activeModal === 'contact' && (
                <div className="space-y-4">
                  {ticketSubmitted ? (
                    <div className="p-6 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-base text-[#14532D]">Inquiry Submitted Successfully!</h4>
                      <p className="text-xs text-[#166534] max-w-md mx-auto leading-relaxed">
                        Your inquiry has been assigned support ticket <strong className="font-mono text-[#0F172A] bg-white px-2 py-0.5 rounded border border-[#BBF7D0]">#{ticketId}</strong>. A faculty advisor will review your question and respond to your email within 24 hours.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTicketSubmitted(false);
                          setTicketForm({ name: '', email: '', category: 'Course Material / Lecture Clarification', message: '' });
                        }}
                        className="mt-2 px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer border-none"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleTicketSubmit} className="space-y-3">
                      <p className="text-xs text-[#64748B]">
                        Have a question regarding course lectures, assessment grading, or platform navigation? Send our academic team a direct message.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#0F172A] mb-1">Your Name</label>
                          <input
                            type="text"
                            required
                            value={ticketForm.name}
                            onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                            placeholder="e.g. Alex Mercer"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] focus:border-[#0056D2] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#0F172A] mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            value={ticketForm.email}
                            onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                            placeholder="you@example.com"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] focus:border-[#0056D2] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1">Topic Category</label>
                        <select
                          value={ticketForm.category}
                          onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] focus:border-[#0056D2] focus:outline-none bg-white"
                        >
                          <option value="Course Material / Lecture Clarification">Course Material / Lecture Clarification</option>
                          <option value="Quiz / Assessment Grading Issue">Quiz / Assessment Grading Issue</option>
                          <option value="Certificate Issuance / Verification Help">Certificate Issuance / Verification Help</option>
                          <option value="Video Player / Classroom Technical Glitch">Video Player / Classroom Technical Glitch</option>
                          <option value="General Question">General Question</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1">Your Question / Message</label>
                        <textarea
                          required
                          rows={3}
                          value={ticketForm.message}
                          onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                          placeholder="Describe your question or difficulty in detail..."
                          className="w-full px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] focus:border-[#0056D2] focus:outline-none resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveModal(null)}
                          className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-semibold cursor-pointer border-none shadow-xs"
                        >
                          Send Message
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* 7. PRIVACY POLICY */}
              {activeModal === 'privacy' && (
                <div className="space-y-3 text-xs text-[#64748B]">
                  <p>
                    At Crescentia, we respect learner privacy. We process personal information solely to provide authenticated access to video lessons, record quiz grades, and generate verified course credentials.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>We never sell or distribute student data to third-party advertising networks.</li>
                    <li>Passwords and authentication credentials are encrypted using industry-standard hashing.</li>
                    <li>Learners may request deletion of their learning history at any time.</li>
                  </ul>
                </div>
              )}

              {/* 8. TERMS OF SERVICE */}
              {activeModal === 'terms' && (
                <div className="space-y-3 text-xs text-[#64748B]">
                  <p>
                    By accessing Crescentia courses and materials, you agree to comply with platform access terms and respectful community guidelines.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Course videos and learning materials are licensed for individual educational use.</li>
                    <li>Redistribution or public broadcast of lecture recordings is prohibited.</li>
                    <li>Credentials represent confirmed passing grades in accordance with platform policies.</li>
                  </ul>
                </div>
              )}

              {/* 9. SECURITY & TRUST */}
              {activeModal === 'security' && (
                <div className="space-y-3 text-xs text-[#64748B]">
                  <p>
                    Our platform architecture utilizes end-to-end HTTPS encryption, secure session tokens, and hardened database access controls to safeguard your learning progress and certification records.
                  </p>
                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-[11px] text-[#334155]">
                    &bull; SSL / TLS 1.3 Certified Streaming<br />
                    &bull; Hash-Verified Digital Credentials<br />
                    &bull; SOC-2 Aligned Cloud Hosting
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end shrink-0">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9] text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

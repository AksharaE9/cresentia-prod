import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  ChevronDown,
  Search,
  User,
  Bell,
  Award,
  BookOpen,
  Check,
  CheckCheck,
  ExternalLink,
  ShieldCheck,
  X,
  Loader2,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [navSearch, setNavSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Explore Megamenu state
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const exploreRef = useRef(null);

  const exploreCategories = [
    {
      title: 'Web Development',
      slug: 'Web Development',
      topics: ['React', 'JavaScript', 'Node.js', 'Frontend Architecture', 'Full Stack']
    },
    {
      title: 'Data Science & AI',
      slug: 'Data Science',
      topics: ['Python', 'Machine Learning', 'Data Analysis', 'Deep Learning', 'SQL']
    },
    {
      title: 'Cloud & DevOps',
      slug: 'Cloud & DevOps',
      topics: ['AWS', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Linux']
    },
    {
      title: 'Cybersecurity',
      slug: 'Cybersecurity',
      topics: ['Ethical Hacking', 'Network Security', 'SOC Operations', 'Penetration Testing']
    },
    {
      title: 'Mobile Development',
      slug: 'Mobile Development',
      topics: ['Flutter', 'React Native', 'Android', 'iOS Swift']
    },
    {
      title: 'Business & Management',
      slug: 'Business Analysis',
      topics: ['Agile & Scrum', 'Product Management', 'Project Management', 'Data Visualization']
    }
  ];

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifRef = useRef(null);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  // Real-time search with 200ms debounce
  useEffect(() => {
    const trimmed = navSearch.trim();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      setShowSearchDropdown(false);
      // If on /courses and search cleared, update URL
      if (location.pathname === '/courses') {
        const params = new URLSearchParams(location.search);
        if (params.get('q')) {
          navigate('/courses', { replace: true });
        }
      }
      return;
    }

    setIsSearching(true);
    setShowSearchDropdown(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/courses', { params: { q: trimmed } });
        setSearchResults(res.data || []);
        // If already on /courses, keep catalog page live in sync
        if (location.pathname === '/courses') {
          navigate(`/courses?q=${encodeURIComponent(trimmed)}`, { replace: true });
        }
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
  }, [navSearch, location.pathname]);

  // Sync navSearch if URL has query parameter on /courses
  useEffect(() => {
    if (location.pathname === '/courses') {
      const params = new URLSearchParams(location.search);
      const q = params.get('q');
      if (q !== null && q !== navSearch) {
        setNavSearch(q);
      }
    }
  }, [location.pathname, location.search]);

  // Click outside listener to close search dropdown & explore megamenu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(e.target)) {
        setShowExploreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearSearch = () => {
    setNavSearch('');
    setSearchResults([]);
    setShowSearchDropdown(false);
    if (location.pathname === '/courses') {
      navigate('/courses');
    }
  };

  const handleSelectCourse = (courseId) => {
    setShowSearchDropdown(false);
    setNavSearch('');
    navigate(`/courses/${courseId}`);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (navSearch.trim()) {
      setShowSearchDropdown(false);
      navigate(`/courses?q=${encodeURIComponent(navSearch.trim())}`);
    }
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  // Fetch notifications for student
  useEffect(() => {
    if (!user) return;

    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        // quiet fallback
      }
    };

    fetchNotifs();
    // Refresh notifications every 60s
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close notification menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationItemClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif._id);
    }
    setShowNotifMenu(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#D1D7DC] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Branding & Explore */}
        <div className="flex items-center gap-5">
          <Link
            to="/"
            className="flex items-center gap-1 text-2xl font-black tracking-tight text-[#0056D2] hover:opacity-90 no-underline"
          >
            <span>crescentia</span>
          </Link>

          <div ref={exploreRef} className="hidden lg:flex items-center relative">
            <button
              type="button"
              onClick={() => setShowExploreMenu(!showExploreMenu)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded border text-sm font-bold no-underline transition-colors cursor-pointer ${
                showExploreMenu
                  ? 'border-[#0056D2] text-white bg-[#0056D2]'
                  : 'border-[#0056D2] text-[#0056D2] bg-white hover:bg-[#EBF3FF]'
              }`}
            >
              <span>Explore</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showExploreMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Coursera-Style Megamenu Dropdown */}
            {showExploreMenu && (
              <div className="absolute top-full left-0 mt-2 w-[680px] bg-white border border-[#D1D7DC] rounded-2xl shadow-xl z-50 p-6 grid grid-cols-12 gap-6 text-left">
                {/* Left 5 Cols: Categories */}
                <div className="col-span-5 border-r border-[#E0E0E0] pr-4 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#6A6F73] px-3 pb-2">
                    Subject Areas
                  </div>
                  {exploreCategories.map((cat, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => {
                        setShowExploreMenu(false);
                        navigate(`/courses?category=${encodeURIComponent(cat.slug)}`);
                      }}
                      className="w-full px-3 py-2 rounded-lg text-xs font-bold text-[#1F1F1F] hover:text-[#0056D2] hover:bg-[#F8F9FA] flex items-center justify-between transition-colors text-left cursor-pointer border-none bg-transparent"
                    >
                      <span>{cat.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    </button>
                  ))}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowExploreMenu(false);
                        navigate('/courses');
                      }}
                      className="w-full px-3 py-2 rounded-lg text-xs font-bold text-[#0056D2] bg-[#EBF3FF] hover:bg-[#D4E8FF] flex items-center justify-between transition-colors text-left cursor-pointer border-none"
                    >
                      <span>Browse All Courses</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right 7 Cols: Popular Skills & Fast Credentials */}
                <div className="col-span-7 space-y-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#6A6F73] pb-2">
                      Popular Skills & Technologies
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['React', 'Python', 'AWS Cloud', 'Docker', 'Machine Learning', 'Cybersecurity', 'SQL', 'Flutter', 'TypeScript', 'Node.js'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setShowExploreMenu(false);
                            navigate(`/courses?q=${encodeURIComponent(tag)}`);
                          }}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold text-[#1F1F1F] bg-[#F8F9FA] hover:bg-[#0056D2] hover:text-white border border-[#D1D7DC] transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E0E0E0]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#6A6F73] pb-2">
                      Verified Credentials
                    </div>
                    <div
                      onClick={() => {
                        setShowExploreMenu(false);
                        navigate('/courses');
                      }}
                      className="p-3 rounded-xl border border-[#D1D7DC] hover:border-[#0056D2] hover:bg-[#F8F9FA] cursor-pointer transition-all flex items-center gap-3 bg-[#FDFDFD]"
                    >
                      <Award className="w-5 h-5 text-[#0056D2] shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-[#1F1F1F]">Professional Certifications</div>
                        <div className="text-[11px] text-[#6A6F73]">Earn verifiable credentials with 70%+ score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Search Bar with Real-Time Dropdown */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative w-full">
              <input
                type="text"
                value={navSearch}
                onFocus={() => {
                  if (navSearch.trim() && searchResults.length > 0) {
                    setShowSearchDropdown(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowSearchDropdown(false);
                }}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="What do you want to learn?"
                className="w-full py-2 rounded-full border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-sm text-[#1F1F1F] placeholder:text-[#6A6F73] bg-white transition-all shadow-2xs"
                style={{ paddingLeft: '1.25rem', paddingRight: navSearch ? '5rem' : '3.25rem' }}
              />

              {/* Action Buttons inside Search Bar */}
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isSearching && (
                  <Loader2 className="w-4 h-4 text-[#0056D2] animate-spin mr-0.5" />
                )}

                {navSearch && !isSearching && (
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
                  className="w-8 h-8 rounded-full bg-[#0056D2] text-white flex items-center justify-center hover:bg-[#00419E] transition-colors p-0 border-none cursor-pointer shrink-0 shadow-xs"
                  title="Search courses"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </form>

          {/* Real-time Search Results Dropdown */}
          {showSearchDropdown && navSearch.trim() && (
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
                      onClick={handleSearchSubmit}
                      className="w-full py-1.5 text-xs font-bold text-[#0056D2] hover:text-[#00419E] bg-transparent border-none cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>View all results for "{navSearch.trim()}"</span>
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
                    No courses found for "{navSearch.trim()}"
                  </p>
                  <p className="text-[11px] text-[#555555]">
                    Try searching for "Auth", "Content", "API", or "Backend"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Navigation & Profile */}
        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-1">
            {user?.role === 'user' && (
              <>
                <Link
                  to="/dashboard"
                  className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded no-underline transition-colors ${
                    isActive('/dashboard') ? 'text-[#0056D2] bg-[#EBF3FF]' : 'text-[#1F1F1F] hover:text-[#0056D2]'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/my-courses"
                  className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded no-underline transition-colors ${
                    isActive('/my-courses') ? 'text-[#0056D2] bg-[#EBF3FF]' : 'text-[#1F1F1F] hover:text-[#0056D2]'
                  }`}
                >
                  My Courses
                </Link>

                <Link
                  to="/certificates"
                  className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded no-underline transition-colors ${
                    isActive('/certificates') ? 'text-[#0056D2] bg-[#EBF3FF]' : 'text-[#1F1F1F] hover:text-[#0056D2]'
                  }`}
                >
                  Certificates
                </Link>
              </>
            )}

            {(user?.role === 'admin' || user?.role === 'instructor') && (
              <>
                <Link
                  to="/admin"
                  className={`text-sm font-semibold px-3 py-1.5 rounded no-underline ${
                    isActive('/admin') ? 'text-[#0056D2] bg-[#EBF3FF]' : 'text-[#1F1F1F] hover:text-[#0056D2]'
                  }`}
                >
                  Admin Panel
                </Link>
                <Link
                  to="/courses"
                  className={`text-sm font-semibold px-3 py-1.5 rounded no-underline ${
                    isActive('/courses') ? 'text-[#0056D2] bg-[#EBF3FF]' : 'text-[#1F1F1F] hover:text-[#0056D2]'
                  }`}
                >
                  Catalog
                </Link>
              </>
            )}
          </nav>

          {user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#D1D7DC]">
              {/* Notification Bell Dropdown (Dynamic per student) */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="w-9 h-9 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1F1F1F] flex items-center justify-center relative transition-colors cursor-pointer border-none"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Popover Dropdown */}
                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#D1D7DC] rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-3.5 bg-[#F8F9FA] border-b border-[#E0E0E0] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#0056D2]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                          Notifications ({unreadCount} new)
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] font-bold text-[#0056D2] hover:underline cursor-pointer border-none bg-transparent"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-[#E0E0E0]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#555555]">
                          No notifications at this time.
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationItemClick(notif)}
                            className={`p-3 text-left transition-colors cursor-pointer flex items-start gap-3 ${
                              notif.isRead ? 'bg-white hover:bg-[#F8F9FA]' : 'bg-[#F0F6FF] hover:bg-[#E5F0FF]'
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-[#0056D2] shrink-0 mt-1.5 opacity-80" />
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="text-xs font-bold text-[#1F1F1F] truncate">
                                {notif.title}
                              </div>
                              <div className="text-[11px] text-[#555555] line-clamp-2">
                                {notif.message}
                              </div>
                              <div className="text-[10px] text-[#757575] pt-0.5">
                                {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2.5 bg-[#F8F9FA] border-t border-[#E0E0E0] text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNotifMenu(false);
                          navigate('/notifications');
                        }}
                        className="text-xs font-bold text-[#0056D2] hover:underline cursor-pointer border-none bg-transparent"
                      >
                        View All Notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Student Profile & Quick Actions */}
              <Link
                to="/profile"
                className="flex items-center gap-1.5 text-xs font-bold text-[#0056D2] bg-[#EBF3FF] hover:bg-[#DFEDFF] px-2.5 py-1.5 rounded border border-[#C2DCFF] no-underline transition-colors"
                title="View Profile"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{user.name}</span>
                {user.role === 'admin' && (
                  <span className="text-[10px] bg-[#0056D2] text-white px-1 rounded uppercase">
                    Admin
                  </span>
                )}
              </Link>

              <button
                className="flex items-center gap-1 text-xs font-bold text-[#555555] hover:text-[#0056D2] px-2 py-1.5 rounded hover:bg-[#F5F7FA] transition-colors border-none bg-transparent cursor-pointer"
                onClick={onLogout}
                type="button"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/courses"
                className={`text-sm font-semibold px-2 py-1 rounded no-underline ${
                  isActive('/courses') ? 'text-[#0056D2] font-bold' : 'text-[#1F1F1F] hover:text-[#0056D2]'
                }`}
              >
                Courses
              </Link>
              <Link
                to="/login"
                className="text-[#0056D2] hover:text-[#00419E] font-bold text-sm no-underline px-2 py-1"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="coursera-btn-nav no-underline"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

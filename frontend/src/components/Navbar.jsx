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
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [navSearch, setNavSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifRef = useRef(null);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
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
            to={user ? (user.role === 'admin' || user.role === 'instructor' ? '/admin' : '/dashboard') : '/'}
            className="flex items-center gap-1 text-2xl font-black tracking-tight text-[#0056D2] hover:opacity-90 no-underline"
          >
            <span>crescentia</span>
          </Link>

          <div className="hidden lg:flex items-center">
            <Link
              to="/courses"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded border border-[#0056D2] text-[#0056D2] bg-white hover:bg-[#EBF3FF] text-sm font-bold no-underline transition-colors"
            >
              <span>Explore</span>
              <ChevronDown className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Center Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="What do you want to learn?"
              className="w-full py-2 rounded-full border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-sm text-[#1F1F1F] placeholder:text-[#6A6F73]"
              style={{ paddingLeft: '1.25rem', paddingRight: '3.25rem' }}
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0056D2] text-white flex items-center justify-center hover:bg-[#00419E] transition-colors p-0 border-none cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>

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

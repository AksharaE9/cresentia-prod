import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  Award,
  BookOpen,
  Clock,
  ExternalLink,
  Check,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const StudentNotifications = ({ onRefreshBadge }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      if (onRefreshBadge) onRefreshBadge(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      if (onRefreshBadge) onRefreshBadge(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onRefreshBadge) onRefreshBadge(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif._id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'course_assigned':
        return <BookOpen className="w-4 h-4 text-[#0056D2]" />;
      case 'certificate_earned':
        return <Award className="w-4 h-4 text-[#0A8543]" />;
      case 'lesson_completed':
        return <CheckCircle className="w-4 h-4 text-[#0A8543]" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-[#B76E00]" />;
      default:
        return <Bell className="w-4 h-4 text-[#0056D2]" />;
    }
  };

  const formatRelativeTime = (dateStr) => {
    const diffMs = new Date() - new Date(dateStr);
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div className="bg-white border border-[#D1D7DC] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-[#0056D2] text-white'
                : 'bg-[#F0F2F5] text-[#555555] hover:bg-[#E4E6EB]'
            }`}
          >
            All ({notifications.length})
          </button>

          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-[#0056D2] text-white'
                : 'bg-[#F0F2F5] text-[#555555] hover:bg-[#E4E6EB]'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionLoading}
            className="text-xs font-bold text-[#0056D2] hover:text-[#00419E] flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-[#EBF3FF] transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-[#D1D7DC] rounded-lg shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[#555555]">
            Loading your personalized notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F0F2F5] text-[#757575] flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-[#1F1F1F]">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </div>
            <p className="text-xs text-[#555555] max-w-sm mx-auto">
              When instructors assign courses, or when you complete lessons and unlock certificates, personalized updates will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E0E0E0]">
            {filtered.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer transition-colors ${
                  notif.isRead
                    ? 'bg-white hover:bg-[#FBFBFC]'
                    : 'bg-[#F4F8FF] hover:bg-[#EBF3FF]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.isRead ? 'bg-[#F0F2F5]' : 'bg-white shadow-xs'
                    }`}
                  >
                    {getIcon(notif.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[#1F1F1F]">
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#0056D2] shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-[#555555] leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-[#757575] pt-1">
                      <span>{formatRelativeTime(notif.createdAt)}</span>
                      {notif.link && (
                        <span className="text-[#0056D2] font-semibold flex items-center gap-0.5 hover:underline">
                          View details <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!notif.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif._id);
                    }}
                    className="p-1.5 text-[#757575] hover:text-[#0056D2] rounded hover:bg-white transition-colors shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;

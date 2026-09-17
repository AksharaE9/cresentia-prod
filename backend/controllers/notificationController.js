import Notification from '../models/Notification.js';
import Course from '../models/Course.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper function to create a notification programmatically
export const createStudentNotification = async ({
  recipient,
  title,
  message,
  type = 'system',
  link = ''
}) => {
  try {
    return await Notification.create({
      recipient,
      title,
      message,
      type,
      link
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

// GET /api/notifications
export const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Check if student has notifications. If none exist, seed contextual onboarding notifications
  let count = await Notification.countDocuments({ recipient: userId });
  if (count === 0) {
    // Check if user has assigned courses
    const user = req.user;
    const welcomeNotifs = [
      {
        recipient: userId,
        title: 'Welcome to Crescentia!',
        message: 'Your student account is active. Explore your personalized dashboard and begin learning today.',
        type: 'system',
        link: '/dashboard',
        isRead: false
      }
    ];

    if (user.assignedCourses && user.assignedCourses.length > 0) {
      // Find course title
      const courses = await Course.find({ _id: { $in: user.assignedCourses } }).select('title').limit(2);
      courses.forEach((c) => {
        welcomeNotifs.push({
          recipient: userId,
          title: 'Course Enrollment Confirmed',
          message: `You have official access to "${c.title}". Watch the video lessons and complete the assessment to unlock your certificate.`,
          type: 'course_assigned',
          link: `/courses/${c._id}`,
          isRead: false
        });
      });
    }

    await Notification.insertMany(welcomeNotifs);
  }

  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false
  });

  res.json({
    notifications,
    unreadCount
  });
});

// PATCH /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  notification.isRead = true;
  await notification.save();

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  res.json({
    message: 'Notification marked as read',
    notification,
    unreadCount
  });
});

// PATCH /api/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({
    message: 'All notifications marked as read',
    unreadCount: 0
  });
});

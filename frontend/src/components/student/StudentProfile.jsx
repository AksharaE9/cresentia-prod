import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  Save,
  Clock,
  Award,
  BookOpen
} from 'lucide-react';
import api from '../../services/api';

const StudentProfile = ({ enrollments = [] }) => {
  const { user } = useAuth();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileErr('Full name cannot be empty');
      return;
    }

    try {
      setSavingProfile(true);
      setProfileMsg('');
      setProfileErr('');

      const res = await api.patch('/auth/profile', { name: name.trim() });
      setProfileMsg('Profile updated successfully!');

      // Update local storage user if needed
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.name = res.data.user.name;
          localStorage.setItem('user', JSON.stringify(parsed));
        } catch (e) {}
      }

      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileErr(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdErr('');

    if (!currentPassword || !newPassword) {
      setPwdErr('Please fill in both current and new password');
      return;
    }

    if (newPassword.length < 6) {
      setPwdErr('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdErr('New passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      await api.patch('/auth/change-password', {
        currentPassword,
        newPassword
      });

      setPwdMsg('Password updated successfully! Keep your credentials secure.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdMsg(''), 4000);
    } catch (err) {
      setPwdErr(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = (user?.name || 'S')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const completedCerts = enrollments.filter((e) => e.quizScore >= 70).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Student Identity Card */}
      <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#0056D2] text-white font-black text-xl flex items-center justify-center shadow-xs shrink-0">
            {initials}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1F1F1F]">{user?.name}</h2>
              <span className="px-2 py-0.5 rounded bg-[#EBF3FF] text-[#0056D2] font-bold text-[10px] uppercase tracking-wider border border-[#C2DCFF]">
                Verified Learner
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#555555] mt-1">
              <Mail className="w-3.5 h-3.5 text-[#757575]" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#757575] mt-1">
              <span>Student ID: <code className="font-mono bg-[#F0F2F5] px-1 rounded">{user?._id || 'STD-001'}</code></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-[#E0E0E0] pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
          <div>
            <div className="text-xl font-black text-[#0056D2]">{enrollments.length}</div>
            <div className="text-[11px] text-[#555555]">Assigned Courses</div>
          </div>
          <div>
            <div className="text-xl font-black text-[#0A8543]">{completedCerts}</div>
            <div className="text-[11px] text-[#555555]">Certificates</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E0E0E0] pb-3">
            <User className="w-4 h-4 text-[#0056D2]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F1F1F]">
              Profile Details
            </h3>
          </div>

          {profileMsg && (
            <div className="p-3 bg-[#E6F4EA] border border-[#A8DAB5] text-[#0A8543] rounded text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{profileMsg}</span>
            </div>
          )}

          {profileErr && (
            <div className="p-3 bg-[#FDF2F2] border border-[#F87171] text-[#DC2626] rounded text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileErr}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1F1F1F]">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 text-xs rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none"
              />
              <p className="text-[11px] text-[#757575]">
                This name will appear on your official Crescentia certificates of completion.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1F1F1F]">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 text-xs rounded border border-[#E0E0E0] bg-[#F5F7FA] text-[#757575] cursor-not-allowed"
              />
              <p className="text-[11px] text-[#757575]">
                Official institutional email address linked to your enrollment records.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1F1F1F]">
                Account Role
              </label>
              <input
                type="text"
                value="Student / Registered Learner"
                disabled
                className="w-full px-3 py-2 text-xs rounded border border-[#E0E0E0] bg-[#F5F7FA] text-[#757575] cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="coursera-btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Security & Password Form */}
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E0E0E0] pb-3">
            <Shield className="w-4 h-4 text-[#0056D2]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F1F1F]">
              Security & Credentials
            </h3>
          </div>

          {pwdMsg && (
            <div className="p-3 bg-[#E6F4EA] border border-[#A8DAB5] text-[#0A8543] rounded text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{pwdMsg}</span>
            </div>
          )}

          {pwdErr && (
            <div className="p-3 bg-[#FDF2F2] border border-[#F87171] text-[#DC2626] rounded text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pwdErr}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1F1F1F]">
                Current Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2 text-xs rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1F1F1F]">
                New Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 text-xs rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1F1F1F]">
                Confirm New Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3 py-2 text-xs rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="px-4 py-2 bg-white border border-[#0056D2] text-[#0056D2] hover:bg-[#EBF3FF] rounded text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{changingPassword ? 'Updating...' : 'Change Password'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

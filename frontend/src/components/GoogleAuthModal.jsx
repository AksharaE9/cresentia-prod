import { useState } from 'react';
import { X, Check } from 'lucide-react';

const GoogleAuthModal = ({ isOpen, onClose, onSuccess, initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    setError('');
    setLoading(true);
    try {
      await onSuccess({ email: cleanEmail, name: cleanName });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (quickEmail, quickName) => {
    setEmail(quickEmail);
    setName(quickName);
    setError('');
    setLoading(true);
    try {
      await onSuccess({ email: quickEmail, name: quickName });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-[#D1D7DC] overflow-hidden text-left"
        role="dialog" 
        aria-modal="true"
      >
        {/* Top bar with Google Logo & Close */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-2.5">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="text-base font-bold text-[#1F1F1F]">Sign in with Google</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6A6F73] hover:text-[#1F1F1F] p-1.5 rounded-full hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="px-6 py-2">
          <p className="text-xs text-[#555555]">
            Choose an account or enter your Google email to continue to <span className="font-semibold text-[#1F1F1F]">Crescentia</span>.
          </p>
        </div>

        {/* One-click suggestions */}
        <div className="px-6 py-2 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6A6F73]">
            Instant Access
          </div>
          <button
            type="button"
            onClick={() => handleQuickSelect('student@crescentia.edu', 'Alex Rivera')}
            disabled={loading}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#D1D7DC] hover:border-[#0056D2] hover:bg-[#F8F9FA] transition-all cursor-pointer bg-white text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0056D2] text-white flex items-center justify-center font-bold text-xs">
                AR
              </div>
              <div>
                <div className="text-xs font-bold text-[#1F1F1F] group-hover:text-[#0056D2]">Alex Rivera</div>
                <div className="text-[11px] text-[#6A6F73]">student@crescentia.edu</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#0056D2] group-hover:underline">Sign In</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center px-6 py-2">
          <div className="border-t border-[#E0E0E0] w-full" />
          <span className="bg-white px-2.5 text-[11px] font-medium text-[#6A6F73] shrink-0">
            or use another Google account
          </span>
          <div className="border-t border-[#E0E0E0] w-full" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#1F1F1F] mb-1">
              Google Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required
              disabled={loading}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-[#1F1F1F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F1F1F] mb-1">
              Your Name <span className="font-normal text-[#6A6F73]">(Optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              disabled={loading}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-[#1F1F1F]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border-none disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating with Google...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-[#6A6F73] text-center pt-1 leading-relaxed">
            By continuing, Crescentia will authenticate your profile and grant instant course access.
          </p>
        </form>
      </div>
    </div>
  );
};

export default GoogleAuthModal;

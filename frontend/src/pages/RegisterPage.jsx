import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import TermsModal from '../components/TermsModal';

const RegisterPage = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsTab, setTermsTab] = useState('terms');

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-transparent' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(form.password);

  const submit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please accept the Terms of Use and Privacy Notice to continue.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(form);
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-[#1F1F1F] flex flex-col justify-between selection:bg-[#EBF3FF] selection:text-[#0056D2]">
      {/* Header */}
      <header className="bg-white border-b border-[#D1D7DC] px-6 sm:px-12 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-black text-[#0056D2] tracking-tight no-underline">
            crescentia
          </Link>
          <div className="text-xs sm:text-sm text-[#555555]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#0056D2] hover:underline no-underline">
              Log In
            </Link>
          </div>
        </div>
      </header>

      {/* Clean Centered Auth Card (Coursera & Udemy Official Standard) */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[420px] bg-white border border-[#D1D7DC] rounded-xl shadow-xs p-8 sm:p-10 space-y-6 text-left">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">
              Create your account
            </h1>
            <p className="text-xs text-[#6A6F73]">
              Start learning with top courses and verifiable certificates.
            </p>
          </div>



          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="block text-xs font-bold text-[#1F1F1F] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-sm text-[#1F1F1F] placeholder:text-[#6A6F73]"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1F1F] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@email.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-sm text-[#1F1F1F] placeholder:text-[#6A6F73]"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1F1F] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create password (6+ characters)"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-sm text-[#1F1F1F] placeholder:text-[#6A6F73]"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#1F1F1F] focus:outline-none p-1 bg-transparent border-none cursor-pointer flex items-center justify-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#555555]" />
                  ) : (
                    <Eye className="w-4 h-4 text-[#555555]" />
                  )}
                </button>
              </div>

              {/* Password strength meter */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#6A6F73]">Password strength:</span>
                    <span className="font-bold text-[#1F1F1F]">{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E0E0E0] rounded-full overflow-hidden flex gap-0.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 h-full transition-colors ${
                          strength.score >= step ? strength.color : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 text-xs text-[#555555] cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-[#757575] text-[#0056D2] focus:ring-[#0056D2]"
                />
                <span>
                  I agree to Crescentia's{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsTab('terms');
                      setTermsModalOpen(true);
                    }}
                    className="text-[#0056D2] font-semibold underline hover:text-[#00419E] bg-transparent border-none p-0 cursor-pointer text-xs inline"
                  >
                    Terms of Use
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsTab('privacy');
                      setTermsModalOpen(true);
                    }}
                    className="text-[#0056D2] font-semibold underline hover:text-[#00419E] bg-transparent border-none p-0 cursor-pointer text-xs inline"
                  >
                    Privacy Notice
                  </button>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#0056D2] hover:bg-[#00419E] text-white font-bold text-sm transition-colors mt-2 cursor-pointer border-none shadow-xs disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Bottom Link */}
          <div className="pt-4 border-t border-[#E0E0E0] text-center text-xs text-[#555555]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0056D2] hover:underline font-bold">
              Log in
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#6A6F73] border-t border-[#D1D7DC] bg-white flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
        <span>© {new Date().getFullYear()} Crescentia Inc. All rights reserved.</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setTermsTab('terms');
              setTermsModalOpen(true);
            }}
            className="text-[#6A6F73] hover:text-[#0056D2] hover:underline bg-transparent border-none p-0 cursor-pointer text-xs"
          >
            Terms of Use
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              setTermsTab('privacy');
              setTermsModalOpen(true);
            }}
            className="text-[#6A6F73] hover:text-[#0056D2] hover:underline bg-transparent border-none p-0 cursor-pointer text-xs"
          >
            Privacy Notice
          </button>
        </div>
      </footer>

      {/* Terms and Privacy Modal */}
      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        initialTab={termsTab}
      />
    </div>
  );
};

export default RegisterPage;

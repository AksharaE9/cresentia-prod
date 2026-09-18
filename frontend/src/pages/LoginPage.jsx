import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Eye, EyeOff, CheckCircle2, Lock, Award, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (provider) => {
    setError(`Direct ${provider} sign-in is managed via your institution SSO. Please enter your registered email and password below.`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#1F1F1F] flex flex-col selection:bg-[#EBF3FF] selection:text-[#0056D2]">
      {/* Top Header */}
      <header className="bg-white border-b border-[#D1D7DC] px-6 sm:px-12 py-3.5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-black text-[#0056D2] tracking-tight no-underline flex items-center gap-1.5">
            <span>crescentia</span>
          </Link>
          <div className="text-xs sm:text-sm text-[#555555] flex items-center gap-1.5">
            <span>New to Crescentia?</span>
            <Link
              to="/register"
              className="font-bold text-[#0056D2] hover:text-[#00419E] hover:underline no-underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Split-Screen Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 lg:p-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl border border-[#D1D7DC] shadow-sm overflow-hidden min-h-[640px]">
          
          {/* Left Column: Login Form */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1F1F1F] tracking-tight">
                  Welcome back
                </h1>
                <p className="text-xs sm:text-sm text-[#6A6F73] mt-1.5">
                  Log in to resume your courses, track milestones, and download verified certificates.
                </p>
              </div>

              {/* Social Login Buttons (Coursera/Udemy style) */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleSocialClick('Google')}
                  className="w-full py-2.5 px-4 rounded-lg border border-[#D1D7DC] hover:border-[#757575] hover:bg-[#F8F9FA] text-[#1F1F1F] font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer bg-white"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick('Apple')}
                  className="w-full py-2.5 px-4 rounded-lg border border-[#D1D7DC] hover:border-[#757575] hover:bg-[#F8F9FA] text-[#1F1F1F] font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer bg-white"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.64 1.35-.57.65-1.07 1.72-.94 2.74 1 .08 2.04-.49 2.66-1.24z" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#D1D7DC] w-full" />
                <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-[#6A6F73] shrink-0">
                  or with email
                </span>
                <div className="border-t border-[#D1D7DC] w-full" />
              </div>

              {error && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              {forgotSent && (
                <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-[#0056D2] text-xs font-semibold leading-relaxed">
                  Password reset instructions have been forwarded to your registered email address.
                </div>
              )}

              <form className="space-y-4" onSubmit={submit}>
                <div>
                  <label className="block text-xs font-bold text-[#1F1F1F] mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. alex@company.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-sm text-[#1F1F1F] placeholder:text-[#6A6F73]"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#1F1F1F]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotSent(true)}
                      className="text-xs font-bold text-[#0056D2] hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-sm text-[#1F1F1F] placeholder:text-[#6A6F73]"
                      required
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-[#0056D2] hover:bg-[#00419E] text-white font-bold text-sm transition-colors mt-2 cursor-pointer border-none shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Logging in...' : 'Log In'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Security reassurance */}
              <div className="pt-4 border-t border-[#E0E0E0] flex items-center justify-center gap-2 text-[11px] text-[#6A6F73]">
                <Lock className="w-3.5 h-3.5 text-[#0A8543]" />
                <span>Protected by 256-bit SSL encryption & verified session tokens</span>
              </div>
            </div>
          </div>

          {/* Right Column: Social Proof & Institution Highlights */}
          <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-[#002F75] via-[#0047BA] to-[#0056D2] p-12 flex-col justify-between text-white relative overflow-hidden">
            {/* Ambient Background Circles */}
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-300/10 blur-3xl pointer-events-none" />

            {/* Top pill */}
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <Award className="w-3.5 h-3.5 text-[#FDE68A]" />
                <span>Industry-Recognized Curriculum</span>
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight leading-snug">
                Advance your career with masterclass courses and accredited certifications.
              </h2>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 text-sm text-blue-50">
                  <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
                  <span>Interactive classrooms with timed assessments & instant grading.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-blue-50">
                  <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
                  <span>Downloadable, verifiable PDF certificates with official credential IDs.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-blue-50">
                  <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
                  <span>Learn at your own pace with bite-sized lessons and practice exercises.</span>
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 space-y-3 mt-8">
              <p className="text-xs sm:text-sm text-white/95 italic leading-relaxed">
                "Crescentia's curriculum structure mirrors the best parts of Coursera and Udemy. The assessments gave me the confidence to transition into a senior engineering role."
              </p>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-9 h-9 rounded-full bg-white text-[#0056D2] font-black text-sm flex items-center justify-center shadow">
                  RS
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Rahul Sharma</div>
                  <div className="text-[11px] text-blue-200">Fullstack Engineer • Verified Graduate</div>
                </div>
              </div>
            </div>

            {/* Footer Trust Stats */}
            <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-white/15 text-center">
              <div>
                <div className="text-xl font-black text-white">200K+</div>
                <div className="text-[11px] text-blue-200">Learners</div>
              </div>
              <div>
                <div className="text-xl font-black text-white">96%</div>
                <div className="text-[11px] text-blue-200">Pass Rate</div>
              </div>
              <div>
                <div className="text-xl font-black text-white">4.8 / 5</div>
                <div className="text-[11px] text-blue-200">Satisfaction</div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default LoginPage;

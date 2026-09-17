import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-[#1F1F1F] flex flex-col selection:bg-[#EBF3FF] selection:text-[#0056D2]">
      {/* Header */}
      <header className="bg-white border-b border-[#D1D7DC] px-6 sm:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-black text-[#0056D2] tracking-tight no-underline">
            crescentia
          </Link>
          <Link
            to="/register"
            className="text-sm font-bold text-[#0056D2] hover:text-[#00419E] no-underline"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white border border-[#D1D7DC] rounded-lg shadow-sm p-8 sm:p-10 text-left">
          <h1 className="text-2xl font-bold text-[#1F1F1F] mb-1">
            Welcome back
          </h1>
          <p className="text-xs text-[#555555] mb-6">
            Log in to continue your courses and access assessments.
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@email.com"
                className="w-full px-3.5 py-2.5 rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-sm text-[#1F1F1F] placeholder:text-[#6A6F73]"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wide">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-sm text-[#1F1F1F] placeholder:text-[#6A6F73]"
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
              className="w-full py-3 rounded bg-[#0056D2] hover:bg-[#00419E] text-white font-bold text-sm transition-colors mt-2 cursor-pointer border-none shadow-none disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="pt-6 mt-6 border-t border-[#E0E0E0] text-center text-xs text-[#555555]">
            New to Crescentia?{' '}
            <Link to="/register" className="text-[#0056D2] hover:underline font-bold">
              Sign up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

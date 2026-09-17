import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

const RegisterPage = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await register(form);
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            to="/login"
            className="text-sm font-bold text-[#0056D2] hover:text-[#00419E] no-underline"
          >
            Log In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white border border-[#D1D7DC] rounded-lg shadow-sm p-8 sm:p-10 text-left">
          <h1 className="text-2xl font-bold text-[#1F1F1F] mb-1">
            Sign Up
          </h1>
          <p className="text-xs text-[#555555] mb-6">
            Learn with thousands of courses, certificates, and assessments.
          </p>

          {message && (
            <div className="mb-5 p-3.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wide mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-sm text-[#1F1F1F] placeholder:text-[#6A6F73]"
                required
                disabled={loading}
              />
            </div>

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
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Create password (6+ characters)"
                className="w-full px-3.5 py-2.5 rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 text-sm text-[#1F1F1F] placeholder:text-[#6A6F73]"
                required
                disabled={loading}
              />
            </div>

            <p className="text-[11px] text-[#6A6F73] leading-normal pt-1">
              By clicking "Get Started", you agree to Crescentia's{' '}
              <span className="text-[#0056D2] underline cursor-pointer">Terms of Use</span> and{' '}
              <span className="text-[#0056D2] underline cursor-pointer">Privacy Notice</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded bg-[#0056D2] hover:bg-[#00419E] text-white font-bold text-sm transition-colors mt-2 cursor-pointer border-none shadow-none disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Get Started'}
            </button>
          </form>

          <div className="pt-6 mt-6 border-t border-[#E0E0E0] text-center text-xs text-[#555555]">
            Already have a Crescentia account?{' '}
            <Link to="/login" className="text-[#0056D2] hover:underline font-bold">
              Log in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;

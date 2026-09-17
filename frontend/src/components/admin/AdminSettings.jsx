import { useState } from 'react';
import {
  Settings,
  Shield,
  Save,
  CheckCircle,
  Bell,
  Globe,
  Lock,
  Database,
  Mail,
  Sliders
} from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    institutionName: 'Crescentia Institute of Technology',
    tagline: 'Learn Without Limits - World-Class Education',
    supportEmail: 'support@crescentia.edu',
    passingScore: 70,
    timeLimitMinutes: 15,
    autoIssueCertificates: true,
    requireEmailVerification: false,
    publicCatalogEnabled: true,
    sessionExpiryDays: 7
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage('Platform settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-extrabold text-[#1F1F1F] tracking-tight">
          Platform Settings & Institutional Rules
        </h2>
        <p className="text-sm text-[#555555]">
          Configure institutional identity, academic passing thresholds, and security parameters.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-[#E6F4EA] border border-[#A8DAB5] text-[#0A8543] rounded-md text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Institution Profile */}
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0056D2] pb-2 border-b border-[#E0E0E0] flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>1. Institutional Identity & Contact</span>
          </h3>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#1F1F1F]">Institution Name</label>
            <input
              type="text"
              name="institutionName"
              value={settings.institutionName}
              onChange={handleChange}
              className="w-full p-2.5 rounded border border-[#757575] focus:border-[#0056D2] text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1F1F1F]">Platform Tagline</label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                className="w-full p-2.5 rounded border border-[#757575] focus:border-[#0056D2] text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1F1F1F]">Official Support Email</label>
              <input
                type="email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
                className="w-full p-2.5 rounded border border-[#757575] focus:border-[#0056D2] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic & Assessment Rules */}
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0056D2] pb-2 border-b border-[#E0E0E0] flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <span>2. Academic Assessment & Passing Standards</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1F1F1F]">Passing Score Threshold (%)</label>
              <input
                type="number"
                name="passingScore"
                min="50"
                max="100"
                value={settings.passingScore}
                onChange={handleChange}
                className="w-full p-2.5 rounded border border-[#757575] focus:border-[#0056D2] text-sm font-bold"
              />
              <span className="text-[11px] text-[#555555]">Students must reach this score to earn a certificate</span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1F1F1F]">Default Quiz Time Limit (Minutes)</label>
              <input
                type="number"
                name="timeLimitMinutes"
                min="5"
                max="120"
                value={settings.timeLimitMinutes}
                onChange={handleChange}
                className="w-full p-2.5 rounded border border-[#757575] focus:border-[#0056D2] text-sm font-bold"
              />
              <span className="text-[11px] text-[#555555]">Timed window for final competency evaluations</span>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="autoIssueCertificates"
                checked={settings.autoIssueCertificates}
                onChange={handleChange}
                className="w-4 h-4 text-[#0056D2] rounded"
              />
              <div>
                <div className="text-xs font-bold text-[#1F1F1F]">Auto-Issue Verified Certificates</div>
                <div className="text-[11px] text-[#555555]">Automatically generate and award credentials upon assessment completion</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="publicCatalogEnabled"
                checked={settings.publicCatalogEnabled}
                onChange={handleChange}
                className="w-4 h-4 text-[#0056D2] rounded"
              />
              <div>
                <div className="text-xs font-bold text-[#1F1F1F]">Allow Public Guest Catalog Browsing</div>
                <div className="text-[11px] text-[#555555]">Let visitors browse courses at /courses without requiring prior login</div>
              </div>
            </label>
          </div>
        </div>

        {/* Section 3: Security & Database */}
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0056D2] pb-2 border-b border-[#E0E0E0] flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>3. System & Database Health</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded bg-[#F8F9FA] border border-[#D1D7DC] space-y-1">
              <div className="font-bold text-[#1F1F1F]">Database Connection</div>
              <div className="text-[#0A8543] font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Connected to MongoDB Atlas Cluster0</span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#F8F9FA] border border-[#D1D7DC] space-y-1">
              <div className="font-bold text-[#1F1F1F]">Session & JWT Authentication</div>
              <div className="text-[#555555]">Active token validity: 7 days</div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="coursera-btn-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            <span>{loading ? 'Saving Settings...' : 'Save Platform Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;

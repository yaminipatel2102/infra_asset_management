import React, { useState } from 'react';
import { User } from '../types/auth';
import { api, setStoredToken, setStoredUser } from '../services/api';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    { label: 'Super Admin', email: 'admin@rb-demo.com', pass: 'Admin@123', role: 'SUPER_ADMIN', cat: 'ALL', color: 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100' },
    { label: 'R&B Dept Admin', email: 'rnbadmin@rb-demo.com', pass: 'Admin@123', role: 'RNB_ADMIN', cat: 'ALL', color: 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100' },
    { label: 'Road Officer', email: 'road@rb-demo.com', pass: 'Road@123', role: 'ROAD_OFFICER', cat: 'ROAD', color: 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100' },
    { label: 'Bridge Officer', email: 'bridge@rb-demo.com', pass: 'Bridge@123', role: 'BRIDGE_OFFICER', cat: 'BRIDGE', color: 'border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100' },
    { label: 'Building Officer', email: 'building@rb-demo.com', pass: 'Building@123', role: 'BUILDING_OFFICER', cat: 'BUILDING', color: 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' },
    { label: 'Field Officer', email: 'field@rb-demo.com', pass: 'Field@123', role: 'FIELD_OFFICER', cat: 'ALL', color: 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email, password);
      setStoredToken(res.token);
      setStoredUser(res.user);
      onLoginSuccess(res.user);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError(null);

    api.login(demoEmail, demoPass)
      .then((res) => {
        setStoredToken(res.token);
        setStoredUser(res.user);
        onLoginSuccess(res.user);
      })
      .catch((err) => {
        setError(err.message || 'Quick login failed');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-extrabold text-2xl font-outfit">
            R&B
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-outfit pt-2">
            R&B Asset Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Government of Gujarat • Roads & Buildings Department
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Official Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@rb-demo.com"
                className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Login Pills */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
            Hackathon Quick Demo Login
          </span>

          <div className="space-y-1.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleQuickLogin(acc.email, acc.pass)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${acc.color}`}
              >
                <span>{acc.label}</span>
                <span className="text-[10px] opacity-80">{acc.email} ({acc.pass})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

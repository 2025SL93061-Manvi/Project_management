import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert } from '../ui/alert';
import { FormGroup } from '../ui/form-group';
import { Eye, EyeOff, LayoutDashboard, FolderOpen, CheckSquare, Flag, CalendarDays, LogIn, Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(form);
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const FEATURES = [
    { Icon: FolderOpen,   label: 'Projects' },
    { Icon: CheckSquare,  label: 'Tasks' },
    { Icon: Flag,         label: 'Milestones' },
    { Icon: CalendarDays, label: 'Meetings' },
  ];

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#3f51b5] via-[#5c6bc0] to-[#3949ab] flex-col items-center justify-center p-12 text-white">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <LayoutDashboard size={32} strokeWidth={1.8} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-3 tracking-tight">Enterprise PM</h1>
        <p className="text-white/70 text-center text-base leading-relaxed max-w-xs">
          Manage projects, track tasks, schedule meetings, and collaborate — all in one place.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-xs">
          {FEATURES.map(({ Icon, label }) => (
            <div key={label} className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-2.5">
              <Icon size={18} strokeWidth={2} className="text-white/80 shrink-0" />
              <span className="text-sm font-medium text-white/90">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#f0f2f8] p-8">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 bg-[#3f51b5] rounded-xl flex items-center justify-center mx-auto mb-3 shadow">
              <LayoutDashboard size={22} strokeWidth={2} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#1a237e]">Enterprise PM</h1>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(63,81,181,0.1)] border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-[13px] text-gray-500 mb-6">Sign in to your account to continue</p>

            {error && <Alert variant="error">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormGroup>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword
                      ? <EyeOff size={16} strokeWidth={2} />
                      : <Eye size={16} strokeWidth={2} />}
                  </button>
                </div>
              </FormGroup>
              <Button type="submit" variant="primary" size="full" disabled={loading} className="mt-2 flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : <><LogIn size={15} /> Sign In</>}
              </Button>
            </form>

            <p className="text-center mt-5 text-[13px] text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#3f51b5] font-semibold hover:underline">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

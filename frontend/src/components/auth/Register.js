import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert } from '../ui/alert';
import { Select } from '../ui/select';
import { FormGroup } from '../ui/form-group';
import { LayoutDashboard, ShieldCheck, BarChart2, Mail, UserPlus, Loader2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'DEVELOPER' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(form);
      setSuccess('Registration successful! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const FEATURES = [
    { Icon: ShieldCheck, text: 'Secure, role-based access' },
    { Icon: BarChart2,   text: 'Real-time project dashboards' },
    { Icon: Mail,        text: 'Automated report emails' },
  ];

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#3f51b5] via-[#5c6bc0] to-[#3949ab] flex-col items-center justify-center p-12 text-white">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <LayoutDashboard size={32} strokeWidth={1.8} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-3 tracking-tight">Enterprise PM</h1>
        <p className="text-white/70 text-center text-base leading-relaxed max-w-xs">
          Join your team and start collaborating on projects from day one.
        </p>
        <div className="mt-10 space-y-3 w-full max-w-xs">
          {FEATURES.map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <Icon size={18} strokeWidth={2} className="text-white/80 shrink-0" />
              <span className="text-sm text-white/85">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#f0f2f8] p-8">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 bg-[#3f51b5] rounded-xl flex items-center justify-center mx-auto mb-3 shadow">
              <LayoutDashboard size={22} strokeWidth={2} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#1a237e]">Enterprise PM</h1>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(63,81,181,0.1)] border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
            <p className="text-[13px] text-gray-500 mb-6">Fill in the details below to get started</p>

            {error   && <Alert variant="error">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormGroup>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </FormGroup>
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
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="role">Role</Label>
                <Select id="role" name="role" value={form.role} onChange={handleChange}>
                  <option value="DEVELOPER">Developer</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </Select>
              </FormGroup>
              <Button type="submit" variant="primary" size="full" disabled={loading} className="mt-2 flex items-center justify-center gap-2">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Creating account…</>
                  : <><UserPlus size={15} /> Create Account</>}
              </Button>
            </form>

            <p className="text-center mt-5 text-[13px] text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-[#3f51b5] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

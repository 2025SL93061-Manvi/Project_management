import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { RoleBadge } from '../ui/role-badge';
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { FormGroup } from '../ui/form-group';
import { Alert } from '../ui/alert';
import api from '../../services/api';
import { LayoutDashboard, Pencil, LogOut, Save } from 'lucide-react';

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openProfile = () => {
    setProfileForm({ name: user?.name || '', email: user?.email || '' });
    setProfileError('');
    setProfileSuccess('');
    setDropdownOpen(false);
    setShowProfile(true);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    try {
      const res = await api.put('/auth/me', profileForm);
      login({ ...user, name: res.data.name, email: res.data.email });
      setProfileSuccess('Profile updated successfully');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `relative no-underline px-3.5 py-1.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
      isActive
        ? 'bg-white/20 text-white shadow-sm'
        : 'text-white/75 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f8]">
      <nav className="bg-gradient-to-r from-[#3f51b5] to-[#5c6bc0] text-white px-6 h-14 flex items-center justify-between shadow-[0_2px_8px_rgba(63,81,181,0.35)] sticky top-0 z-[100]">

        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shadow-sm">
            <LayoutDashboard size={16} strokeWidth={2} className="text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[16px] font-bold tracking-tight">Meridian</span>
            <span className="text-[10px] text-white/60 tracking-wide">The central reference point for all project work</span>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <NavLink to="/"         className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/projects" className={navLinkClass}>Projects</NavLink>
          <NavLink to="/calendar" className={navLinkClass}>Calendar</NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
          )}
          {(user?.role === 'MANAGER' || user?.role === 'DEVELOPER') && (
            <NavLink to="/admin" className={navLinkClass}>My Submissions</NavLink>
          )}
        </div>

        {/* User section */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            {/* Avatar circle — only initial shown by default */}
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="w-9 h-9 bg-white/30 hover:bg-white/40 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all duration-150 cursor-pointer shadow-sm"
              title={user?.name}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </button>

            {/* Dropdown panel */}
            {dropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 z-[200] overflow-hidden animate-slide-down">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[#3f51b5] rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 truncate">{user?.name}</p>
                      <div className="mt-0.5">
                        <RoleBadge role={user?.role} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="py-1">
                  <button
                    onClick={openProfile}
                    className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <Pencil size={14} strokeWidth={2} className="text-gray-400" />
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1.5">
            <LogOut size={13} strokeWidth={2} />
            Logout
          </Button>
        </div>
      </nav>

      <main className="flex-1 px-6 py-6 max-w-[1280px] mx-auto w-full">
        <Outlet />
      </main>

      {/* Edit Profile Modal */}
      <Modal show={showProfile} onClose={() => setShowProfile(false)} title="Edit Profile">
        {profileError   && <Alert variant="error">{profileError}</Alert>}
        {profileSuccess && <Alert variant="success">{profileSuccess}</Alert>}
        <form onSubmit={handleProfileSave} className="space-y-4">
          <FormGroup>
            <Label>Name *</Label>
            <Input
              value={profileForm.name}
              onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Full name"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Email *</Label>
            <Input
              type="email"
              value={profileForm.email}
              onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
              placeholder="Email address"
              required
            />
          </FormGroup>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary" className="flex items-center gap-1.5">
              <Save size={14} /> Save Changes
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowProfile(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

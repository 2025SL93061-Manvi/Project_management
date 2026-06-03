import React, { useState } from 'react';
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

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const openProfile = () => {
    setProfileForm({ name: user?.name || '', email: user?.email || '' });
    setProfileError('');
    setProfileSuccess('');
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
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg shadow-sm">📋</div>
          <span className="text-[16px] font-bold tracking-tight">Enterprise PM</span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <NavLink to="/"         className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/projects" className={navLinkClass}>Projects</NavLink>
          <NavLink to="/calendar" className={navLinkClass}>Calendar</NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
          )}
          {user?.role !== 'ADMIN' && (
            <NavLink to="/admin" className={navLinkClass}>My Complaints</NavLink>
          )}
        </div>

        {/* User section */}
        <div className="flex items-center gap-3">
          <button
            onClick={openProfile}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition-all duration-150 cursor-pointer"
          >
            <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="text-[13px] font-medium text-white/90">{user?.name}</span>
            <RoleBadge role={user?.role} />
          </button>
          <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
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
            <Button type="submit" variant="primary">Save Changes</Button>
            <Button type="button" variant="secondary" onClick={() => setShowProfile(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

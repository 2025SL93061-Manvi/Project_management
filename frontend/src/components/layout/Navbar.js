import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="navbar-brand">
          📋 Enterprise PM
        </div>

        <div className="navbar-links">
          <NavLink to="/"         className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
          <NavLink to="/projects" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Projects</NavLink>
          <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Calendar</NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Admin</NavLink>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-info">
            👤 {user?.name}
            <span className={`role-badge role-${user?.role?.toLowerCase()}`}>
              {user?.role}
            </span>
          </span>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

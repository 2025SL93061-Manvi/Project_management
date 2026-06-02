import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ProjectList from './components/projects/ProjectList';
import ProjectDetail from './components/projects/ProjectDetail';
import ProjectForm from './components/projects/ProjectForm';
import TaskList from './components/tasks/TaskList';
import MilestoneTracker from './components/milestones/MilestoneTracker';
import MeetingScheduler from './components/meetings/MeetingScheduler';
import ReportViewer from './components/reports/ReportViewer';
import FileStorage from './components/storage/FileStorage';
import WorkCalendar from './components/calendar/WorkCalendar';
import AdminPanel from './components/admin/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute><Navbar /></ProtectedRoute>}>
            <Route index                          element={<Dashboard />} />
            <Route path="projects"                element={<ProjectList />} />
            <Route path="projects/new"            element={<ProjectForm />} />
            <Route path="projects/:id"            element={<ProjectDetail />} />
            <Route path="projects/:id/edit"       element={<ProjectForm />} />
            <Route path="projects/:id/tasks"      element={<TaskList />} />
            <Route path="projects/:id/milestones" element={<MilestoneTracker />} />
            <Route path="projects/:id/meetings"   element={<MeetingScheduler />} />
            <Route path="projects/:id/files"      element={<FileStorage />} />
            <Route path="projects/:id/report"     element={<ReportViewer />} />
            <Route path="calendar"                element={<WorkCalendar />} />
            <Route path="admin"                   element={<AdminPanel />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

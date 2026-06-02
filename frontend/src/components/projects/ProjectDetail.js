import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { taskService, milestoneService, meetingService } from '../../services/taskService';
import { fileService } from '../../services/fileService';
import { useAuth } from '../../context/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts]   = useState({ tasks: 0, milestones: 0, meetings: 0, files: 0 });

  useEffect(() => {
    projectService.getById(id)
      .then(res => setProject(res.data))
      .catch(() => alert('Failed to load project'))
      .finally(() => setLoading(false));

    Promise.allSettled([
      taskService.getByProject(id),
      milestoneService.getByProject(id),
      meetingService.getByProject(id),
      fileService.getByProject(id),
    ]).then(([tasks, milestones, meetings, files]) => {
      setCounts({
        tasks:      tasks.status      === 'fulfilled' ? (tasks.value.data?.length      ?? 0) : 0,
        milestones: milestones.status === 'fulfilled' ? (milestones.value.data?.length ?? 0) : 0,
        meetings:   meetings.status   === 'fulfilled' ? (meetings.value.data?.length   ?? 0) : 0,
        files:      files.status      === 'fulfilled' ? (files.value.data?.length      ?? 0) : 0,
      });
    });
  }, [id]);

  if (loading)  return <div className="loading">Loading project...</div>;
  if (!project) return <div className="alert alert-error">Project not found</div>;

  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{project.name}</h1>
          <span className={`badge badge-${project.status?.toLowerCase()}`}>{project.status}</span>
        </div>
        {canEdit && (
          <button className="btn btn-warning" onClick={() => navigate(`/projects/${id}/edit`)}>
            Edit Project
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Project Details</span>
        </div>
        <div className="form-row">
          <div>
            <p><strong>Owner:</strong> {project.ownerName}</p>
            <p style={{marginTop:8}}><strong>Description:</strong> {project.description || 'No description'}</p>
          </div>
          <div>
            <p><strong>Start Date:</strong> {project.startDate || '—'}</p>
            <p style={{marginTop:8}}><strong>End Date:</strong> {project.endDate || '—'}</p>
            <p style={{marginTop:8}}><strong>Total Tasks:</strong> {project.totalTasks}</p>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card blue" style={{cursor:'pointer'}} onClick={() => navigate(`/projects/${id}/tasks`)}>
          <div className="stat-value">📋</div>
          <div className="stat-label">Tasks</div>
          <div style={{fontSize:'1.4rem', fontWeight:'700', marginTop:4}}>{counts.tasks}</div>
        </div>
        <div className="stat-card green" style={{cursor:'pointer'}} onClick={() => navigate(`/projects/${id}/milestones`)}>
          <div className="stat-value">🏁</div>
          <div className="stat-label">Milestones</div>
          <div style={{fontSize:'1.4rem', fontWeight:'700', marginTop:4}}>{counts.milestones}</div>
        </div>
        <div className="stat-card orange" style={{cursor:'pointer'}} onClick={() => navigate(`/projects/${id}/meetings`)}>
          <div className="stat-value">📅</div>
          <div className="stat-label">Meetings</div>
          <div style={{fontSize:'1.4rem', fontWeight:'700', marginTop:4}}>{counts.meetings}</div>
        </div>
        <div className="stat-card blue" style={{cursor:'pointer'}} onClick={() => navigate(`/projects/${id}/files`)}>
          <div className="stat-value">📂</div>
          <div className="stat-label">Files</div>
          <div style={{fontSize:'1.4rem', fontWeight:'700', marginTop:4}}>{counts.files}</div>
        </div>
        <div className="stat-card green" style={{cursor:'pointer'}} onClick={() => navigate(`/projects/${id}/report`)}>
          <div className="stat-value">📊</div>
          <div className="stat-label">Reports</div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';

export default function ProjectList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const fetch = user?.role === 'ADMIN'
      ? projectService.getAllProjects()
      : projectService.getMyProjects();
    fetch
      .then(res => setProjects(res.data))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await projectService.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch {
      alert('Failed to delete project');
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📁 Projects</h1>
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <button className="btn btn-primary" onClick={() => navigate('/projects/new')}>+ New Project</button>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Description</th><th>Status</th><th>Owner</th>
                <th>Start Date</th><th>End Date</th><th>Tasks</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 && (
                <tr><td colSpan={8} className="empty-msg">No projects found</td></tr>
              )}
              {projects.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td style={{maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {p.description || '—'}
                  </td>
                  <td><span className={`badge badge-${p.status?.toLowerCase()}`}>{p.status}</span></td>
                  <td>{p.ownerName}</td>
                  <td>{p.startDate || '—'}</td>
                  <td>{p.endDate || '—'}</td>
                  <td>{p.totalTasks}</td>
                  <td>
                    <div className="flex-gap">
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/projects/${p.id}`)}>View</button>
                      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                        <>
                          <button className="btn btn-warning btn-sm" onClick={() => navigate(`/projects/${p.id}/edit`)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

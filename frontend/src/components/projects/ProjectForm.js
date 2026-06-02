import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import api from '../../services/api';

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', description: '', status: 'PLANNING',
    startDate: '', endDate: '', memberIds: []
  });
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data)).catch(() => {});
    if (isEdit) {
      projectService.getById(id).then(res => {
        const p = res.data;
        setForm({
          name: p.name || '',
          description: p.description || '',
          status: p.status || 'PLANNING',
          startDate: p.startDate || '',
          endDate: p.endDate || '',
          memberIds: p.memberIds || []
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMemberToggle = (userId) => {
    const ids = form.memberIds.includes(userId)
      ? form.memberIds.filter(i => i !== userId)
      : [...form.memberIds, userId];
    setForm({ ...form, memberIds: ids });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await projectService.update(id, form);
      } else {
        await projectService.create(form);
      }
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Project' : 'New Project'}</h1>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Assign Members</label>
            <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:6}}>
              {users.map(u => (
                <label key={u.id} style={{display:'flex', alignItems:'center', gap:4,
                  padding:'4px 10px', border:'1px solid #ddd', borderRadius:4, cursor:'pointer',
                  background: form.memberIds.includes(u.id) ? '#e3f2fd' : 'white'}}>
                  <input type="checkbox"
                    checked={form.memberIds.includes(u.id)}
                    onChange={() => handleMemberToggle(u.id)} />
                  {u.name}
                  <span className={`role-badge role-${u.role?.toLowerCase()}`}>{u.role}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex-gap">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project')}
            </button>
            <button type="button" className="btn btn-warning" onClick={() => navigate('/projects')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

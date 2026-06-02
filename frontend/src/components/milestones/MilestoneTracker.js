import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { milestoneService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';

export default function MilestoneTracker() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm] = useState({ title:'', dueDate:'', completed: false, projectId });
  const [error, setError] = useState('');

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    milestoneService.getByProject(projectId)
      .then(res => setMilestones(res.data))
      .finally(() => setLoading(false));
  }, [projectId]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ title:'', dueDate:'', completed: false, projectId });
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditItem(m);
    setForm({ title: m.title, dueDate: m.dueDate || '', completed: m.completed, projectId });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, projectId: Number(projectId) };
    try {
      if (editItem) {
        const res = await milestoneService.update(editItem.id, payload);
        setMilestones(milestones.map(m => m.id === editItem.id ? res.data : m));
      } else {
        const res = await milestoneService.create(payload);
        setMilestones([...milestones, res.data]);
      }
      setShowModal(false);
    } catch { setError('Failed to save milestone'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this milestone?')) return;
    await milestoneService.delete(id);
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const toggleComplete = async (m) => {
    const res = await milestoneService.update(m.id, { ...m, completed: !m.completed, projectId: Number(projectId) });
    setMilestones(milestones.map(x => x.id === m.id ? res.data : x));
  };

  if (loading) return <div className="loading">Loading milestones...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏁 Milestones</h1>
        {canManage && <button className="btn btn-primary" onClick={openCreate}>+ Add Milestone</button>}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Title</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {milestones.length === 0 && (
                <tr><td colSpan={4} className="empty-msg">No milestones yet</td></tr>
              )}
              {milestones.map(m => (
                <tr key={m.id}>
                  <td style={{textDecoration: m.completed ? 'line-through' : 'none'}}>
                    <strong>{m.title}</strong>
                  </td>
                  <td>{m.dueDate || '—'}</td>
                  <td>
                    <span className={`badge ${m.completed ? 'badge-done' : 'badge-todo'}`}>
                      {m.completed ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="flex-gap">
                      <button className={`btn btn-sm ${m.completed ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => toggleComplete(m)}>
                        {m.completed ? 'Reopen' : 'Mark Done'}
                      </button>
                      {canManage && (
                        <>
                          <button className="btn btn-warning btn-sm" onClick={() => openEdit(m)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>Delete</button>
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editItem ? 'Edit Milestone' : 'New Milestone'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input name="title" value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" name="dueDate" value={form.dueDate}
                  onChange={e => setForm({...form, dueDate: e.target.value})} />
              </div>
              <div className="flex-gap">
                <button type="submit" className="btn btn-primary">
                  {editItem ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn btn-warning" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

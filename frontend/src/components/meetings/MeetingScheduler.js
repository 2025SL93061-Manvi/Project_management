import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { meetingService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';

export default function MeetingScheduler() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [meetings, setMeetings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm] = useState({
    title:'', description:'', meetingDate:'', location:'', projectId
  });
  const [error, setError] = useState('');

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    meetingService.getByProject(projectId)
      .then(res => setMeetings(res.data))
      .finally(() => setLoading(false));
  }, [projectId]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ title:'', description:'', meetingDate:'', location:'', projectId });
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditItem(m);
    setForm({
      title: m.title, description: m.description || '',
      meetingDate: m.meetingDate ? m.meetingDate.slice(0,16) : '',
      location: m.location || '', projectId
    });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, projectId: Number(projectId) };
    try {
      if (editItem) {
        const res = await meetingService.update(editItem.id, payload);
        setMeetings(meetings.map(m => m.id === editItem.id ? res.data : m));
      } else {
        const res = await meetingService.create(payload);
        setMeetings([...meetings, res.data]);
      }
      setShowModal(false);
    } catch { setError('Failed to save meeting'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meeting?')) return;
    await meetingService.delete(id);
    setMeetings(meetings.filter(m => m.id !== id));
  };

  if (loading) return <div className="loading">Loading meetings...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📅 Meetings</h1>
        {canManage && <button className="btn btn-primary" onClick={openCreate}>+ Schedule Meeting</button>}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Description</th><th>Date & Time</th>
                <th>Location</th><th>Organizer</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.length === 0 && (
                <tr><td colSpan={6} className="empty-msg">No meetings scheduled yet</td></tr>
              )}
              {meetings.map(m => (
                <tr key={m.id}>
                  <td><strong>{m.title}</strong></td>
                  <td>{m.description || '—'}</td>
                  <td>{m.meetingDate ? new Date(m.meetingDate).toLocaleString() : '—'}</td>
                  <td>{m.location || '—'}</td>
                  <td>{m.organizerName || '—'}</td>
                  <td>
                    <div className="flex-gap">
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
              <span className="modal-title">{editItem ? 'Edit Meeting' : 'Schedule Meeting'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date & Time *</label>
                  <input type="datetime-local" name="meetingDate"
                    value={form.meetingDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input name="location" value={form.location} onChange={handleChange}
                    placeholder="e.g. Zoom, Room A" />
                </div>
              </div>
              <div className="flex-gap">
                <button type="submit" className="btn btn-primary">
                  {editItem ? 'Update' : 'Schedule'}
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

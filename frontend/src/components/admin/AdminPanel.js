import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

export default function AdminPanel() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [tab, setTab] = useState('users');

  const [users, setUsers]             = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [complaints, setComplaints]   = useState([]);
  const [compLoading, setCompLoading] = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [editComplaint, setEditComplaint] = useState(null);

  const EMPTY_FORM = { title:'', description:'', type:'COMPLAINT' };
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const closeModal = () => { setShowModal(false); setEditComplaint(null); };

  useEffect(() => {
    if (tab === 'users' && isAdmin) {
      setUsersLoading(true);
      adminService.getUsers()
        .then(res => setUsers(res.data))
        .finally(() => setUsersLoading(false));
    }
    if (tab === 'complaints') {
      setCompLoading(true);
      const fetch = isAdmin ? adminService.getAllComplaints() : adminService.getMyComplaints();
      fetch.then(res => setComplaints(res.data)).finally(() => setCompLoading(false));
    }
  }, [tab, isAdmin]);

  const handleToggleUser = async (id) => {
    await adminService.toggleUser(id);
    setUsers(users.map(u => u.id === id ? {...u, enabled: !u.enabled} : u));
  };

  const handleStatusChange = async (id, status) => {
    const res = await adminService.updateStatus(id, status);
    setComplaints(complaints.map(c => c.id === id ? res.data : c));
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await adminService.createComplaint(form);
      setComplaints([res.data, ...complaints]);
      closeModal();
      setForm(EMPTY_FORM);
    } catch { setError('Failed to submit'); }
  };

  const openEdit = (c) => {
    setEditComplaint(c);
    setForm({ title: c.title, description: c.description || '', type: c.type });
    setShowModal(true);
  };

  const handleEditComplaint = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await adminService.editComplaint(editComplaint.id, form);
      setComplaints(complaints.map(c => c.id === editComplaint.id ? res.data : c));
      closeModal();
      setForm(EMPTY_FORM);
    } catch { setError('Failed to update'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ {isAdmin ? 'Admin Panel' : 'My Interactions'}</h1>
        {tab === 'complaints' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Submit Complaint / Feedback
          </button>
        )}
      </div>

      <div style={{display:'flex', gap:8, marginBottom:20}}>
        {isAdmin && (
          <button className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-warning'}`}
            onClick={() => setTab('users')}>
            👥 User Management
          </button>
        )}
        <button className={`btn ${tab === 'complaints' ? 'btn-primary' : 'btn-warning'}`}
          onClick={() => setTab('complaints')}>
          📝 Complaints & Feedback
        </button>
      </div>

      {tab === 'users' && isAdmin && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">All Users</span>
            <span style={{color:'#888', fontSize:12}}>{users.length} users</span>
          </div>
          {usersLoading ? <div className="loading">Loading...</div> : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td><span className={`role-badge role-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                      <td>
                        <span className={`badge ${u.enabled ? 'badge-active' : 'badge-on_hold'}`}>
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        {u.email !== user.email && (
                          <button className={`btn btn-sm ${u.enabled ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => handleToggleUser(u.id)}>
                            {u.enabled ? 'Disable' : 'Enable'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'complaints' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">{isAdmin ? 'All Complaints & Feedback' : 'My Submissions'}</span>
          </div>
          {compLoading ? <div className="loading">Loading...</div> : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th><th>Type</th><th>Description</th><th>Status</th>
                    {isAdmin && <th>Raised By</th>}
                    <th>Date</th>
                    {isAdmin && <th>Update Status</th>}
                    {isAdmin && <th>Edit</th>}
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 && (
                    <tr><td colSpan={7} className="empty-msg">No submissions yet</td></tr>
                  )}
                  {complaints.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.title}</strong></td>
                      <td><span className="badge badge-todo">{c.type}</span></td>
                      <td style={{maxWidth:200}}>{c.description || '—'}</td>
                      <td>
                        <span className={`badge badge-${c.status?.toLowerCase().replace('_','-')}`}>
                          {c.status}
                        </span>
                      </td>
                      {isAdmin && <td>{c.raisedByName}</td>}
                      <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                      {isAdmin && (
                        <td>
                          <select value={c.status}
                            onChange={e => handleStatusChange(c.id, e.target.value)}
                            style={{padding:'4px 8px', borderRadius:4, border:'1px solid #ddd', fontSize:12}}>
                            <option value="OPEN">Open</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="RESOLVED">Resolved</option>
                          </select>
                        </td>
                      )}
                      {isAdmin && (
                        <td>
                          <button className="btn btn-warning btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {editComplaint ? 'Edit Complaint / Feedback' : 'Submit Complaint / Feedback / Query'}
              </span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={editComplaint ? handleEditComplaint : handleCreateComplaint}>
              <div className="form-group">
                <label>Title *</label>
                <input value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="COMPLAINT">Complaint</option>
                  <option value="FEEDBACK">Feedback</option>
                  <option value="QUERY">Query</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} rows={4}
                  onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="flex-gap">
                <button type="submit" className="btn btn-primary">
                  {editComplaint ? 'Update' : 'Submit'}
                </button>
                <button type="button" className="btn btn-warning"
                  onClick={closeModal}>
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

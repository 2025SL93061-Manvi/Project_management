import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function TaskList() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [form, setForm] = useState({
    title:'', description:'', status:'TODO', priority:'MEDIUM',
    startDate:'', endDate:'', assigneeIds: [], projectId
  });
  const [error, setError] = useState('');

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'DEVELOPER';
  const canDelete = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    taskService.getByProject(projectId)
      .then(res => setTasks(res.data))
      .finally(() => setLoading(false));
    api.get('/users').then(res => setUsers(res.data)).catch(() => {});
  }, [projectId]);

  const openCreate = () => {
    setEditTask(null);
    setForm({ title:'', description:'', status:'TODO', priority:'MEDIUM',
      startDate:'', endDate:'', assigneeIds: [], projectId });
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title, description: task.description || '',
      status: task.status, priority: task.priority,
      startDate: task.startDate || '', endDate: task.endDate || '',
      assigneeIds: task.assigneeIds || [], projectId
    });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAssigneeToggle = (userId) => {
    const id = Number(userId);
    setForm(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(id)
        ? prev.assigneeIds.filter(x => x !== id)
        : [...prev.assigneeIds, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form,
      assigneeIds: form.assigneeIds.map(Number),
      startDate: form.startDate || null,
      endDate:   form.endDate   || null,
      projectId: Number(projectId)
    };
    try {
      if (editTask) {
        const res = await taskService.update(editTask.id, payload);
        setTasks(tasks.map(t => t.id === editTask.id ? res.data : t));
      } else {
        const res = await taskService.create(payload);
        setTasks([...tasks, res.data]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || `Failed to save task (${err.response?.status || 'network error'})`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.delete(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || `Failed to delete task`);
    }
  };

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📋 Tasks</h1>
        {canManage && <button className="btn btn-primary" onClick={openCreate}>+ Add Task</button>}
      </div>
      {error && !showModal && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Status</th><th>Priority</th>
                <th>Assigned To</th><th>Start</th><th>Due</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr><td colSpan={7} className="empty-msg">No tasks yet</td></tr>
              )}
              {tasks.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.title}</strong><br/>
                    <small style={{color:'#888'}}>{t.description}</small></td>
                  <td><span className={`badge badge-${t.status?.toLowerCase()}`}>{t.status}</span></td>
                  <td><span className={`badge badge-${t.priority?.toLowerCase()}`}>{t.priority}</span></td>
                  <td>
                    {t.assigneeNames && t.assigneeNames.length > 0
                      ? t.assigneeNames.join(', ')
                      : (t.assignedToName || 'Unassigned')}
                  </td>
                  <td>{t.startDate || '—'}</td>
                  <td>{t.endDate || '—'}</td>
                  <td>
                    <div className="flex-gap">
                      <button className="btn btn-warning btn-sm" onClick={() => openEdit(t)}>Edit</button>
                      {canDelete && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Delete</button>
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
              <span className="modal-title">{editTask ? 'Edit Task' : 'New Task'}</span>
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
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority" value={form.priority} onChange={handleChange}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Assign To (select multiple)</label>
                <div style={{maxHeight:160, overflowY:'auto', border:'1px solid #ddd', borderRadius:6, padding:'8px 10px', textAlign:'left'}}>
                  {users.length === 0 && <span style={{color:'#aaa',fontSize:13}}>No users available</span>}
                  {users.map(u => (
                    <label key={u.id} style={{display:'flex', alignItems:'center', justifyContent:'flex-start', gap:8, padding:'4px 0', cursor:'pointer', fontSize:14, fontWeight:'normal', textAlign:'left', width:'100%'}}>
                      <input
                        type="checkbox"
                        checked={form.assigneeIds.includes(u.id)}
                        onChange={() => handleAssigneeToggle(u.id)}
                        style={{accentColor:'#3a3a7c', flexShrink:0, width:16, height:16, cursor:'pointer'}}
                      />
                      <span>{u.name}</span>
                      <span style={{color:'#aaa',fontSize:12}}>({u.role})</span>
                    </label>
                  ))}
                </div>
                {form.assigneeIds.length > 0 && (
                  <div style={{marginTop:6, fontSize:12, color:'#3a3a7c'}}>
                    Selected: {users.filter(u => form.assigneeIds.includes(u.id)).map(u => u.name).join(', ')}
                  </div>
                )}
              </div>
              <div className="flex-gap">
                <button type="submit" className="btn btn-primary">
                  {editTask ? 'Update' : 'Create Task'}
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

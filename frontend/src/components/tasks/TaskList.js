import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Badge } from '../ui/badge';
import { Alert } from '../ui/alert';
import { Card } from '../ui/card';
import { FormGroup } from '../ui/form-group';
import { Modal } from '../ui/modal';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/table';

export default function TaskList() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks]         = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    title:'', description:'', status:'TODO', priority:'MEDIUM',
    startDate:'', endDate:'', assigneeIds: [], projectId
  });
  const [error, setError] = useState('');

  const [filter, setFilter] = useState('ALL');

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'DEVELOPER';
  const canDelete = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'DEVELOPER';

  const filteredTasks = tasks.filter(t => {
    if (filter === 'ACTIVE') return t.status !== 'DONE';
    if (filter === 'DONE') return t.status === 'DONE';
    return true;
  });

  useEffect(() => {
    taskService.getByProject(projectId)
      .then(res => setTasks(res.data))
      .finally(() => setLoading(false));

    Promise.all([
      api.get('/users'),
      projectService.getById(projectId)
    ]).then(([usersRes, projectRes]) => {
      const memberIds = projectRes.data.memberIds ?? [];
      const ownerIds = projectRes.data.ownerId ? [Number(projectRes.data.ownerId)] : [];
      const allowed = new Set([...memberIds.map(Number), ...ownerIds]);
      setUsers(usersRes.data.filter(u => allowed.has(Number(u.id))));
    }).catch(() => {});
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      setForm(prev => ({
        ...prev,
        startDate: value,
        endDate: prev.endDate && value && prev.endDate < value ? '' : prev.endDate
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

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
      assigneeIds: form.assigneeIds,
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

  const handleDelete = async () => {
    try {
      await taskService.delete(deleteTarget);
      setTasks(tasks.filter(t => t.id !== deleteTarget));
    } catch (err) {
      setError(err.response?.data?.message || `Failed to delete task`);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 animate-pulse">Loading tasks…</div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1a237e] tracking-tight">📋 Tasks</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{filteredTasks.length} of {tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        {canManage && <Button variant="primary" onClick={openCreate}>+ Add Task</Button>}
      </div>
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        {[['ALL', 'All'], ['ACTIVE', 'Active'], ['DONE', 'Completed']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
              filter === val
                ? 'bg-white text-[#1a237e] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              filter === val ? 'bg-[#e8eaf6] text-[#3f51b5]' : 'bg-gray-200 text-gray-500'
            }`}>
              {val === 'ALL' ? tasks.length : val === 'ACTIVE' ? tasks.filter(t => t.status !== 'DONE').length : tasks.filter(t => t.status === 'DONE').length}
            </span>
          </button>
        ))}
      </div>
      {error && !showModal && <Alert variant="error">{error}</Alert>}

      <Card>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Title</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Priority</TableHeader>
              <TableHeader>Assigned To</TableHeader>
              <TableHeader>Start</TableHeader>
              <TableHeader>Due</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {filteredTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                  {tasks.length === 0 ? 'No tasks yet' : `No ${filter === 'DONE' ? 'completed' : 'active'} tasks`}
                </TableCell>
              </TableRow>
            )}
            {filteredTasks.map(t => (
              <TableRow key={t.id}>
                <TableCell>
                  <span className="font-semibold text-gray-900">{t.title}</span>
                  {t.description && <p className="text-[12px] text-gray-400 mt-0.5 truncate max-w-[200px]">{t.description}</p>}
                </TableCell>
                <TableCell><Badge value={t.status}>{t.status}</Badge></TableCell>
                <TableCell><Badge value={t.priority}>{t.priority}</Badge></TableCell>
                <TableCell className="text-gray-600">
                  {t.assigneeNames?.length > 0
                    ? t.assigneeNames.join(', ')
                    : (t.assignedToName || <span className="text-gray-400 italic">Unassigned</span>)}
                </TableCell>
                <TableCell className="text-gray-500">{t.startDate || '—'}</TableCell>
                <TableCell className="text-gray-500">{t.endDate || '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1.5 items-center">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>Edit</Button>
                    {canDelete && (
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(t.id)}>Delete</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editTask ? 'Edit Task' : 'New Task'}>
        {error && <Alert variant="error">{error}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormGroup>
            <Label>Title *</Label>
            <Input name="title" value={form.title} onChange={handleChange} placeholder="Task title" required />
          </FormGroup>
          <FormGroup>
            <Label>Description</Label>
            <Textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Optional description…" />
          </FormGroup>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup>
              <Label>Status</Label>
              <Select name="status" value={form.status} onChange={handleChange}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Priority</Label>
              <Select name="priority" value={form.priority} onChange={handleChange}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
            </FormGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup>
              <Label>Start Date</Label>
              <Input type="date" name="startDate" value={form.startDate} onChange={handleChange} max={form.endDate || undefined} />
            </FormGroup>
            <FormGroup>
              <Label>Due Date</Label>
              <Input type="date" name="endDate" value={form.endDate} onChange={handleChange} min={form.startDate || undefined} />
            </FormGroup>
          </div>
          <FormGroup>
            <Label>Assign To</Label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50 space-y-1">
              {users.length === 0 && <span className="text-[13px] text-gray-400">No users available</span>}
              {users.map(u => (
                <label key={u.id} className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer text-[13px] transition-colors ${form.assigneeIds.includes(u.id) ? 'bg-blue-50' : 'hover:bg-white'}`}>
                  <input
                    type="checkbox"
                    checked={form.assigneeIds.includes(u.id)}
                    onChange={() => handleAssigneeToggle(u.id)}
                    className="accent-[#3f51b5] w-4 h-4 flex-shrink-0"
                  />
                  <span className="font-medium text-gray-800">{u.name}</span>
                  <span className="text-gray-400 text-xs">({u.role})</span>
                </label>
              ))}
            </div>
            {form.assigneeIds.length > 0 && (
              <p className="text-xs text-[#3f51b5] mt-1.5">
                Selected: {users.filter(u => form.assigneeIds.includes(u.id)).map(u => u.name).join(', ')}
              </p>
            )}
          </FormGroup>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">{editTask ? 'Update Task' : 'Create Task'}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
      <Modal show={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Task">
        <p className="text-[14px] text-gray-600 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <Button variant="danger" onClick={handleDelete}>Yes, Delete</Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}

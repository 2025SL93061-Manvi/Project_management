import React, { useEffect, useRef, useState } from 'react';
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
import KanbanBoard from './KanbanBoard';
import { ClipboardList, Plus, Pencil, Trash2, AlertTriangle, LayoutGrid, List } from 'lucide-react';
import { DatePicker } from '../ui/DatePicker';

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
  const [view, setView] = useState('table'); // 'table' | 'kanban'
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);
  const assigneeDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(e.target)) {
        setAssigneeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    projectService.getById(projectId).then(projectRes => {
      const memberIds   = (projectRes.data.memberIds   ?? []).map(Number);
      const memberNames = projectRes.data.memberNames  ?? [];
      const memberRoles = projectRes.data.memberRoles  ?? [];
      const ownerId   = projectRes.data.ownerId   ? Number(projectRes.data.ownerId)  : null;
      const ownerName = projectRes.data.ownerName || '';
      const ownerRole = projectRes.data.ownerRole || '';

      const membersFromProject = memberIds.map((id, i) => ({
        id, name: memberNames[i] || `User ${id}`, role: memberRoles[i] || ''
      }));
      if (ownerId && !memberIds.includes(ownerId)) {
        membersFromProject.push({ id: ownerId, name: ownerName, role: ownerRole });
      }

      api.get('/users')
        .then(usersRes => {
          const allowed = new Set([...memberIds, ...(ownerId ? [ownerId] : [])]);
          setUsers(usersRes.data.filter(u => allowed.has(Number(u.id))));
        })
        .catch(() => {
          setUsers(membersFromProject);
        });
    }).catch(() => {});
  }, [projectId]);

  const openCreate = (defaultStatus = 'TODO') => {
    setEditTask(null);
    setAssigneeDropdownOpen(false);
    setForm({ title:'', description:'', status: defaultStatus, priority:'MEDIUM',
      startDate:'', endDate:'', assigneeIds: [], projectId });
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setAssigneeDropdownOpen(false);
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
    <div className="animate-fade-up">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1a237e] tracking-tight flex items-center gap-2">
            <ClipboardList size={22} strokeWidth={2.2} className="text-[#3f51b5]" />
            Tasks
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{filteredTasks.length} of {tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
              <button
                onClick={() => setView('table')}
                title="Table view"
                className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-white text-[#3f51b5] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List size={15} strokeWidth={2} />
              </button>
              <button
                onClick={() => setView('kanban')}
                title="Kanban view"
                className={`p-1.5 rounded-md transition-colors ${view === 'kanban' ? 'bg-white text-[#3f51b5] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid size={15} strokeWidth={2} />
              </button>
            </div>
            <Button variant="primary" onClick={() => openCreate()} className="flex items-center gap-1.5">
              <Plus size={16} strokeWidth={2.5} />
              Add Task
            </Button>
          </div>
        )}
        {!canManage && (
          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
            <button
              onClick={() => setView('table')}
              title="Table view"
              className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-white text-[#3f51b5] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={15} strokeWidth={2} />
            </button>
            <button
              onClick={() => setView('kanban')}
              title="Kanban view"
              className={`p-1.5 rounded-md transition-colors ${view === 'kanban' ? 'bg-white text-[#3f51b5] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={15} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit" style={{ display: view === 'kanban' ? 'none' : undefined }}>
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

      {view === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          setTasks={setTasks}
          onEdit={openEdit}
          onAddTask={(status) => openCreate(status)}
          canManage={canManage}
        />
      ) : (
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
                <TableCell className="text-gray-500">{t.startDate ? t.startDate.split('-').reverse().join('/') : '—'}</TableCell>
                <TableCell className="text-gray-500">{t.endDate ? t.endDate.split('-').reverse().join('/') : '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1.5 items-center">
                    <button
                      onClick={() => openEdit(t)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-[#3f51b5] hover:bg-[#e8eaf6] transition-colors"
                      title="Edit task"
                    >
                      <Pencil size={15} strokeWidth={2} />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => setDeleteTarget(t.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      )}

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
              <DatePicker name="startDate" value={form.startDate} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <Label>Due Date</Label>
              <DatePicker name="endDate" value={form.endDate} onChange={handleChange} />
            </FormGroup>
          </div>
          <FormGroup>
            <Label>Assign To</Label>
            <div className="relative" ref={assigneeDropdownRef}>
              <button
                type="button"
                onClick={() => setAssigneeDropdownOpen(prev => !prev)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-white hover:border-[#3f51b5] focus:outline-none focus:ring-2 focus:ring-[#3f51b5]/20 transition-colors"
              >
                <span className={form.assigneeIds.length === 0 ? 'text-gray-400' : 'text-gray-800 font-medium'}>
                  {form.assigneeIds.length === 0
                    ? 'Select members…'
                    : `${form.assigneeIds.length} member${form.assigneeIds.length > 1 ? 's' : ''} selected`}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${assigneeDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {assigneeDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-slide-down">
                  <div className="max-h-44 overflow-y-auto py-1">
                    {users.length === 0 && (
                      <div className="px-3 py-2 text-[13px] text-gray-400">No users available</div>
                    )}
                    {users.map(u => {
                      const checked = form.assigneeIds.includes(Number(u.id));
                      return (
                        <label
                          key={u.id}
                          className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-[13px] transition-colors ${checked ? 'bg-[#e8eaf6]' : 'hover:bg-gray-50'}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleAssigneeToggle(u.id)}
                            className="accent-[#3f51b5] w-4 h-4 flex-shrink-0 rounded"
                          />
                          <span className="font-medium text-gray-800 flex-1">{u.name}</span>
                          <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-medium">{u.role}</span>
                        </label>
                      );
                    })}
                  </div>
                  {form.assigneeIds.length > 0 && (
                    <div className="border-t border-gray-100 px-3 py-2 bg-gray-50 flex items-center justify-between">
                      <span className="text-[12px] text-[#3f51b5] font-medium truncate max-w-[75%]">
                        {users.filter(u => form.assigneeIds.includes(Number(u.id))).map(u => u.name).join(', ')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, assigneeIds: [] }))}
                        className="text-[11px] text-gray-400 hover:text-red-500 font-medium ml-2 shrink-0"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </FormGroup>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary" className="flex items-center gap-1.5">
              {editTask
                ? <><Pencil size={14} strokeWidth={2} /> Update Task</>
                : <><Plus size={14} strokeWidth={2.5} /> Create Task</>}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
      <Modal show={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Task">
        <div className="flex items-start gap-3 mb-5">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={18} strokeWidth={2} className="text-red-500" />
          </div>
          <p className="text-[14px] text-gray-600 pt-1.5">Are you sure you want to delete this task? This action cannot be undone.</p>
        </div>
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <Button variant="danger" onClick={handleDelete} className="flex items-center gap-1.5">
            <Trash2 size={14} strokeWidth={2} />
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}

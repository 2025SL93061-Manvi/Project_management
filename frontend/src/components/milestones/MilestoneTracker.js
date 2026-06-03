import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { milestoneService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert } from '../ui/alert';
import { Card } from '../ui/card';
import { FormGroup } from '../ui/form-group';
import { Modal } from '../ui/modal';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/table';

export default function MilestoneTracker() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm] = useState({ title:'', dueDate:'', completed: false, projectId });
  const [error, setError] = useState('');

  const [filter, setFilter] = useState('ALL');
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const filteredMilestones = milestones.filter(m => {
    if (filter === 'PENDING') return !m.completed;
    if (filter === 'COMPLETED') return m.completed;
    return true;
  });

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

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 animate-pulse">Loading milestones…</div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1a237e] tracking-tight">🏁 Milestones</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{filteredMilestones.length} of {milestones.length} milestone{milestones.length !== 1 ? 's' : ''}</p>
        </div>
        {canManage && <Button variant="primary" onClick={openCreate}>+ Add Milestone</Button>}
      </div>
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        {[['ALL', 'All'], ['PENDING', 'Pending'], ['COMPLETED', 'Completed']].map(([val, label]) => (
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
              {val === 'ALL' ? milestones.length : val === 'PENDING' ? milestones.filter(m => !m.completed).length : milestones.filter(m => m.completed).length}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Title</TableHeader>
              <TableHeader>Due Date</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {filteredMilestones.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-gray-400">
                  {milestones.length === 0 ? 'No milestones yet' : `No ${filter === 'COMPLETED' ? 'completed' : 'pending'} milestones`}
                </TableCell>
              </TableRow>
            )}
            {filteredMilestones.map(m => (
              <TableRow key={m.id}>
                <TableCell>
                  <span className={`font-semibold ${m.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{m.title}</span>
                </TableCell>
                <TableCell className="text-gray-500">{m.dueDate || '—'}</TableCell>
                <TableCell>
                  <Badge value={m.completed ? 'done' : 'todo'}>
                    {m.completed ? 'Completed' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5 items-center">
                    {canManage && (
                      <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>Edit</Button>
                    )}
                    <Button
                      variant={m.completed ? 'warning' : 'success'}
                      size="sm"
                      onClick={() => toggleComplete(m)}
                    >
                      {m.completed ? 'Reopen' : 'Mark Done'}
                    </Button>
                    {canManage && (
                      <Button variant="danger" size="sm" onClick={() => handleDelete(m.id)}>Delete</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Milestone' : 'New Milestone'}>
        {error && <Alert variant="error">{error}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormGroup>
            <Label>Title *</Label>
            <Input
              name="title"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              placeholder="Milestone title"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Due Date</Label>
            <Input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={e => setForm({...form, dueDate: e.target.value})}
            />
          </FormGroup>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">{editItem ? 'Update Milestone' : 'Create Milestone'}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

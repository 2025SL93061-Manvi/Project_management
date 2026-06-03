import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import api from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Alert } from '../ui/alert';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { FormGroup } from '../ui/form-group';
import { RoleBadge } from '../ui/role-badge';
import { Plus, Pencil, X, Save } from 'lucide-react';

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', description: '', status: 'PLANNING',
    startDate: '', endDate: '', ownerId: '', memberIds: []
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
          ownerId: p.ownerId ?? '',
          memberIds: p.memberIds ?? []
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'ownerId') {
      const ownerIdNum = value ? Number(value) : null;
      setForm(prev => ({
        ...prev,
        ownerId: value,
        memberIds: prev.memberIds.filter(id => id !== ownerIdNum && id !== value)
      }));
    } else if (name === 'startDate') {
      setForm(prev => ({
        ...prev,
        startDate: value,
        endDate: prev.endDate && value && prev.endDate < value ? '' : prev.endDate
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

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
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1a237e] tracking-tight flex items-center gap-2">
            {isEdit
              ? <><Pencil size={20} strokeWidth={2.2} className="text-[#3f51b5]" /> Edit Project</>
              : <><Plus size={22} strokeWidth={2.5} className="text-[#3f51b5]" /> New Project</>}
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{isEdit ? 'Update project details below' : 'Fill in the details to create a new project'}</p>
        </div>
      </div>

      <Card>
        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormGroup>
            <Label htmlFor="name">Project Name *</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Website Redesign" required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Briefly describe the project…" />
          </FormGroup>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormGroup>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" value={form.status} onChange={handleChange}>
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" name="startDate" value={form.startDate} onChange={handleChange} max={form.endDate || undefined} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" name="endDate" value={form.endDate} onChange={handleChange} min={form.startDate || undefined} />
            </FormGroup>
          </div>
          <FormGroup>
            <Label htmlFor="ownerId">Owner *</Label>
            <Select id="ownerId" name="ownerId" value={form.ownerId} onChange={handleChange} required>
              <option value="">— Select owner —</option>
              {users.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN').map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role.charAt(0) + u.role.slice(1).toLowerCase()})</option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Assign Members</Label>
            <div className="flex flex-wrap gap-2 mt-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[52px]">
              {users.length === 0 && <span className="text-[13px] text-gray-400">No users available</span>}
              {users.filter(u => String(u.id) !== String(form.ownerId)).map(u => (
                <label
                  key={u.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-[13px] ${
                    form.memberIds.includes(u.id)
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.memberIds.includes(u.id)}
                    onChange={() => handleMemberToggle(u.id)}
                    className="accent-[#3f51b5]"
                  />
                  <span className="font-medium">{u.name}</span>
                  <RoleBadge role={u.role} />
                </label>
              ))}
            </div>
          </FormGroup>
          <div className="flex gap-3 items-center pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary" disabled={loading} className="flex items-center gap-1.5">
              <Save size={14} strokeWidth={2} />
              {loading ? 'Saving…' : (isEdit ? 'Update Project' : 'Create Project')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/projects')} className="flex items-center gap-1.5">
              <X size={14} strokeWidth={2} />
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

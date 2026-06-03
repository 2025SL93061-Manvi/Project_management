import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { meetingService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert } from '../ui/alert';
import { Card } from '../ui/card';
import { FormGroup } from '../ui/form-group';
import { Modal } from '../ui/modal';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/table';

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

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 animate-pulse">Loading meetings…</div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1a237e] tracking-tight">📅 Meetings</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{meetings.length} meeting{meetings.length !== 1 ? 's' : ''}</p>
        </div>
        {canManage && <Button variant="primary" onClick={openCreate}>+ Schedule Meeting</Button>}
      </div>

      <Card>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Title</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader>Date &amp; Time</TableHeader>
              <TableHeader>Location</TableHeader>
              <TableHeader>Organizer</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {meetings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-400">No meetings scheduled yet</TableCell>
              </TableRow>
            )}
            {meetings.map(m => (
              <TableRow key={m.id}>
                <TableCell><span className="font-semibold text-gray-900">{m.title}</span></TableCell>
                <TableCell className="text-gray-500 max-w-[160px] truncate">{m.description || '—'}</TableCell>
                <TableCell className="text-gray-600">{m.meetingDate ? new Date(m.meetingDate).toLocaleString() : '—'}</TableCell>
                <TableCell className="text-gray-500">{m.location || '—'}</TableCell>
                <TableCell className="text-gray-600">{m.organizerName || '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1.5 items-center">
                    {canManage && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(m.id)}>Delete</Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Meeting' : 'Schedule Meeting'}>
        {error && <Alert variant="error">{error}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormGroup>
            <Label>Title *</Label>
            <Input name="title" value={form.title} onChange={handleChange} placeholder="Meeting title" required />
          </FormGroup>
          <FormGroup>
            <Label>Description</Label>
            <Textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Optional agenda…" />
          </FormGroup>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup>
              <Label>Date &amp; Time *</Label>
              <Input type="datetime-local" name="meetingDate" value={form.meetingDate} onChange={handleChange} required />
            </FormGroup>
            <FormGroup>
              <Label>Location</Label>
              <Input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Zoom, Room A" />
            </FormGroup>
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">{editItem ? 'Update Meeting' : 'Schedule Meeting'}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

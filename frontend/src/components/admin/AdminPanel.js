import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Badge } from '../ui/badge';
import { RoleBadge } from '../ui/role-badge';
import { Alert } from '../ui/alert';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { FormGroup } from '../ui/form-group';
import { Modal } from '../ui/modal';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/table';
import {
  Settings, Users, MessageSquareWarning, UserRound,
  Plus, Pencil, Trash2, AlertTriangle, Save, Send
} from 'lucide-react';

export default function AdminPanel() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [tab, setTab] = useState(isAdmin ? 'users' : 'my');

  const [users, setUsers]               = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleFilter, setRoleFilter]     = useState('ALL');
  const [editUser, setEditUser]         = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const EMPTY_USER_FORM = { name: '', email: '', role: 'DEVELOPER' };
  const [userForm, setUserForm]         = useState(EMPTY_USER_FORM);
  const [userError, setUserError]       = useState('');

  const [complaints, setComplaints]     = useState([]);
  const [compLoading, setCompLoading]   = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter]     = useState('ALL');

  const [myComplaints, setMyComplaints] = useState([]);
  const [myLoading, setMyLoading]       = useState(false);
  const [myStatusFilter, setMyStatusFilter] = useState('ALL');
  const [myTypeFilter, setMyTypeFilter] = useState('ALL');

  const [showModal, setShowModal]         = useState(false);
  const [editComplaint, setEditComplaint] = useState(null);
  const EMPTY_FORM = { title: '', description: '', type: 'COMPLAINT' };
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget]   = useState(null);

  const closeModal = () => { setShowModal(false); setEditComplaint(null); setForm(EMPTY_FORM); setError(''); };

  useEffect(() => {
    if (tab === 'users' && isAdmin) {
      setUsersLoading(true);
      adminService.getUsers()
        .then(res => setUsers(res.data))
        .finally(() => setUsersLoading(false));
    }
    if (tab === 'complaints' && isAdmin) {
      setCompLoading(true);
      adminService.getAllComplaints()
        .then(res => setComplaints(res.data))
        .finally(() => setCompLoading(false));
    }
    if (tab === 'my') {
      setMyLoading(true);
      adminService.getMyComplaints()
        .then(res => setMyComplaints(res.data))
        .finally(() => setMyLoading(false));
    }
  }, [tab, isAdmin]);

  const handleToggleUser = async (id) => {
    await adminService.toggleUser(id);
    setUsers(users.map(u => u.id === id ? { ...u, enabled: !u.enabled } : u));
  };

  const openEditUser = (u) => {
    setEditUser(u);
    setUserForm({ name: u.name, email: u.email, role: u.role });
    setUserError('');
    setShowUserModal(true);
  };

  const closeUserModal = () => { setShowUserModal(false); setEditUser(null); setUserForm(EMPTY_USER_FORM); };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setUserError('');
    try {
      const res = await adminService.updateUser(editUser.id, userForm);
      setUsers(users.map(u => u.id === editUser.id ? res.data : u));
      closeUserModal();
    } catch { setUserError('Failed to update user'); }
  };

  const handleStatusChange = async (id, status) => {
    const res = await adminService.updateStatus(id, status);
    setComplaints(complaints.map(c => c.id === id ? res.data : c));
  };

  const handleDeleteComplaint = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    try {
      await adminService.deleteComplaint(deleteTarget);
      setComplaints(complaints.map(c => c.id === deleteTarget ? { ...c, status: 'DELETED' } : c));
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await adminService.createComplaint(form);
      setMyComplaints([res.data, ...myComplaints]);
      closeModal();
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
      setMyComplaints(myComplaints.map(c => c.id === editComplaint.id ? res.data : c));
      closeModal();
    } catch { setError('Failed to update'); }
  };

  return (
    <div className="animate-fade-up">
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1a237e] tracking-tight flex items-center gap-2">
            <Settings size={22} strokeWidth={2.2} className="text-[#3f51b5]" />
            {isAdmin ? 'Admin Panel' : 'My Interactions'}
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {isAdmin ? 'Manage users and handle complaints' : 'Submit and track your complaints'}
          </p>
        </div>
        {tab === 'my' && !isAdmin && (
          <Button variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-1.5">
            <Plus size={15} strokeWidth={2.5} />
            Submit Complaint / Feedback
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl w-fit">
        {isAdmin && (
          <button
            onClick={() => setTab('users')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
              tab === 'users' ? 'bg-white text-[#1a237e] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={14} strokeWidth={2} />
            User Management
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setTab('complaints')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
              tab === 'complaints' ? 'bg-white text-[#1a237e] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquareWarning size={14} strokeWidth={2} />
            All Complaints &amp; Feedback
          </button>
        )}
        {!isAdmin && (
          <button
            onClick={() => setTab('my')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
              tab === 'my' ? 'bg-white text-[#1a237e] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserRound size={14} strokeWidth={2} />
            My Submissions
          </button>
        )}
      </div>

      {tab === 'users' && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <div className="flex items-center gap-2 ml-auto">
              {['ALL', 'ADMIN', 'MANAGER', 'DEVELOPER'].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-full text-[12px] font-semibold border transition-all duration-150 ${
                    roleFilter === r
                      ? 'bg-[#1a237e] text-white border-[#1a237e]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {r === 'ALL' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
              <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full ml-1">
                {(roleFilter === 'ALL' ? users : users.filter(u => u.role === roleFilter)).length} users
              </span>
            </div>
          </CardHeader>
          {usersLoading ? (
            <div className="text-center py-10 text-gray-400 animate-pulse">Loading…</div>
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Role</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Action</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {(roleFilter === 'ALL' ? users : users.filter(u => u.role === roleFilter)).map(u => (
                  <TableRow key={u.id}>
                    <TableCell><span className="font-semibold text-gray-900">{u.name}</span></TableCell>
                    <TableCell className="text-gray-600">{u.email}</TableCell>
                    <TableCell><RoleBadge role={u.role} /></TableCell>
                    <TableCell>
                      <Badge value={u.enabled ? 'active' : 'on_hold'}>
                        {u.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {u.email !== user.email && (
                          <Button
                            variant={u.enabled ? 'danger' : 'success'}
                            size="sm"
                            onClick={() => handleToggleUser(u.id)}
                          >
                            {u.enabled ? 'Disable' : 'Enable'}
                          </Button>
                        )}
                        <button
                          onClick={() => openEditUser(u)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-[#3f51b5] hover:bg-[#e8eaf6] transition-colors"
                          title="Edit user"
                        >
                          <Pencil size={15} strokeWidth={2} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {tab === 'complaints' && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>All Complaints &amp; Feedback</CardTitle>
            <div className="flex items-center gap-2 ml-auto">
              <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-auto text-xs py-1">
                <option value="ALL">All Types</option>
                <option value="COMPLAINT">Complaint</option>
                <option value="FEEDBACK">Feedback</option>
                <option value="QUERY">Query</option>
              </Select>
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-auto text-xs py-1">
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DELETED">Deleted</option>
              </Select>
              <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                {complaints.filter(c =>
                  (statusFilter === 'ALL' ? c.status !== 'DELETED' : c.status === statusFilter) &&
                  (typeFilter === 'ALL' || c.type === typeFilter)
                ).length} items
              </span>
            </div>
          </CardHeader>
          {compLoading ? (
            <div className="text-center py-10 text-gray-400 animate-pulse">Loading…</div>
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Raised By</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Update Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {complaints.filter(c =>
                  (statusFilter === 'ALL' ? c.status !== 'DELETED' : c.status === statusFilter) &&
                  (typeFilter === 'ALL' || c.type === typeFilter)
                ).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-400">No submissions yet</TableCell>
                  </TableRow>
                )}
                {complaints.filter(c =>
                  (statusFilter === 'ALL' ? c.status !== 'DELETED' : c.status === statusFilter) &&
                  (typeFilter === 'ALL' || c.type === typeFilter)
                ).map(c => (
                  <TableRow key={c.id} className={c.status === 'DELETED' ? 'opacity-50' : ''}>
                    <TableCell><span className="font-semibold text-gray-900">{c.title}</span></TableCell>
                    <TableCell><Badge value="todo">{c.type}</Badge></TableCell>
                    <TableCell className="max-w-[180px] truncate text-gray-500">{c.description || '—'}</TableCell>
                    <TableCell>
                      <Badge value={c.status?.toLowerCase().replace('_', '-')}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{c.raisedByName}</TableCell>
                    <TableCell className="text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>
                      {c.status !== 'DELETED' && (
                        <Select
                          value={c.status}
                          onChange={e => handleStatusChange(c.id, e.target.value)}
                          className="w-auto text-xs py-1"
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="RESOLVED">Resolved</option>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.status !== 'DELETED' && (
                        <button
                          onClick={() => handleDeleteComplaint(c.id)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete complaint"
                        >
                          <Trash2 size={15} strokeWidth={2} />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {tab === 'my' && (
        <Card>
          <CardHeader>
            <CardTitle>My Submissions</CardTitle>
            <div className="flex items-center gap-2 ml-auto">
              <Select value={myTypeFilter} onChange={e => setMyTypeFilter(e.target.value)} className="w-auto text-xs py-1">
                <option value="ALL">All Types</option>
                <option value="COMPLAINT">Complaint</option>
                <option value="FEEDBACK">Feedback</option>
                <option value="QUERY">Query</option>
              </Select>
              <Select value={myStatusFilter} onChange={e => setMyStatusFilter(e.target.value)} className="w-auto text-xs py-1">
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="RESOLVED">Resolved</option>
              </Select>
              <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                {myComplaints.filter(c =>
                  (myStatusFilter === 'ALL' || c.status === myStatusFilter) &&
                  (myTypeFilter === 'ALL' || c.type === myTypeFilter)
                ).length} items
              </span>
            </div>
          </CardHeader>
          {myLoading ? (
            <div className="text-center py-10 text-gray-400 animate-pulse">Loading…</div>
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Date</TableHeader>
                  {!isAdmin && <TableHeader>Actions</TableHeader>}
                </tr>
              </TableHead>
              <TableBody>
                {myComplaints.filter(c =>
                  (myStatusFilter === 'ALL' || c.status === myStatusFilter) &&
                  (myTypeFilter === 'ALL' || c.type === myTypeFilter)
                ).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={!isAdmin ? 6 : 5} className="text-center py-12 text-gray-400">No submissions yet</TableCell>
                  </TableRow>
                )}
                {myComplaints.filter(c =>
                  (myStatusFilter === 'ALL' || c.status === myStatusFilter) &&
                  (myTypeFilter === 'ALL' || c.type === myTypeFilter)
                ).map(c => (
                  <TableRow key={c.id}>
                    <TableCell><span className="font-semibold text-gray-900">{c.title}</span></TableCell>
                    <TableCell><Badge value="todo">{c.type}</Badge></TableCell>
                    <TableCell className="max-w-[180px] truncate text-gray-500">{c.description || '—'}</TableCell>
                    <TableCell>
                      <Badge value={c.status?.toLowerCase().replace('_', '-')}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</TableCell>
                    {!isAdmin && (
                      <TableCell>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-[#3f51b5] hover:bg-[#e8eaf6] transition-colors"
                          title="Edit submission"
                        >
                          <Pencil size={15} strokeWidth={2} />
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      <Modal show={showUserModal} onClose={closeUserModal} title="Edit User">
        {userError && <Alert variant="error">{userError}</Alert>}
        <form onSubmit={handleEditUser} className="space-y-4">
          <FormGroup>
            <Label>Name *</Label>
            <Input
              value={userForm.name}
              onChange={e => setUserForm({ ...userForm, name: e.target.value })}
              placeholder="Full name"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Email *</Label>
            <Input
              type="email"
              value={userForm.email}
              onChange={e => setUserForm({ ...userForm, email: e.target.value })}
              placeholder="Email address"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Role</Label>
            <Select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="DEVELOPER">Developer</option>
            </Select>
          </FormGroup>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary" className="flex items-center gap-1.5">
              <Save size={14} /> Save Changes
            </Button>
            <Button type="button" variant="secondary" onClick={closeUserModal}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal
        show={showModal}
        onClose={closeModal}
        title={editComplaint ? 'Edit Complaint / Feedback' : 'Submit Complaint / Feedback / Query'}
      >
        {error && <Alert variant="error">{error}</Alert>}
        <form onSubmit={editComplaint ? handleEditComplaint : handleCreateComplaint} className="space-y-4">
          <FormGroup>
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Brief title"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Type</Label>
            <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="COMPLAINT">Complaint</option>
              <option value="FEEDBACK">Feedback</option>
              <option value="QUERY">Query</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              rows={4}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your complaint, feedback, or query…"
            />
          </FormGroup>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary" className="flex items-center gap-1.5">
              {editComplaint ? <><Pencil size={14} /> Update</> : <><Send size={14} /> Submit</>}
            </Button>
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal show={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Complaint">
        <div className="flex items-start gap-3 mb-5">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={18} strokeWidth={2} className="text-red-500" />
          </div>
          <p className="text-[14px] text-gray-600 pt-1.5">
            Are you sure you want to delete this complaint? It will be moved to the <span className="font-semibold text-gray-800">Deleted</span> filter and can still be reviewed.
          </p>
        </div>
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <Button variant="danger" onClick={confirmDelete} className="flex items-center gap-1.5">
            <Trash2 size={14} /> Delete
          </Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}

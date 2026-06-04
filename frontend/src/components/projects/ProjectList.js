import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert } from '../ui/alert';
import { Card } from '../ui/card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/table';
import { FolderOpen, Plus, Eye, Pencil, Trash2 } from 'lucide-react';

const STATUS_FILTERS = ['All', 'ACTIVE', 'PLANNING', 'COMPLETED'];
const STATUS_LABELS  = { All: 'All', ACTIVE: 'Active', PLANNING: 'Planning', COMPLETED: 'Completed' };

export default function ProjectList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteId, setDeleteId]         = useState(null);
  const [deleteError, setDeleteError]   = useState('');

  useEffect(() => {
    const fetch = user?.role === 'ADMIN'
      ? projectService.getAllProjects()
      : projectService.getMyProjects();
    fetch
      .then(res => setProjects(res.data))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, [user]);

  const confirmDelete = async () => {
    try {
      await projectService.delete(deleteId);
      setProjects(projects.filter(p => p.id !== deleteId));
      setDeleteId(null);
    } catch {
      setDeleteError('Failed to delete project');
    }
  };

  const filteredProjects = statusFilter === 'All'
    ? projects
    : projects.filter(p => p.status === statusFilter);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 text-[15px] animate-pulse">Loading projects…</div>
    </div>
  );
  if (error) return <Alert variant="error">{error}</Alert>;

  return (
    <div className="animate-fade-up">
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1a237e] tracking-tight flex items-center gap-2">
            <FolderOpen size={22} strokeWidth={2.2} className="text-[#3f51b5]" />
            Projects
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-md text-[13px] font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-white text-[#1a237e] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <Button variant="primary" onClick={() => navigate('/projects/new')} className="flex items-center gap-1.5">
              <Plus size={15} strokeWidth={2.5} />
              New Project
            </Button>
          )}
        </div>
      </div>

      <Card>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Name</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Owner</TableHeader>
              <TableHeader>Start Date</TableHeader>
              <TableHeader>End Date</TableHeader>
              <TableHeader>Tasks</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {filteredProjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-400">No projects found</TableCell>
              </TableRow>
            )}
            {filteredProjects.map(p => (
              <TableRow key={p.id}>
                <TableCell><span className="font-semibold text-gray-900">{p.name}</span></TableCell>
                <TableCell className="max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap text-gray-500">
                  {p.description || '—'}
                </TableCell>
                <TableCell><Badge value={p.status}>{p.status}</Badge></TableCell>
                <TableCell className="text-gray-600">{p.ownerName}</TableCell>
                <TableCell className="text-gray-500">{p.startDate || '—'}</TableCell>
                <TableCell className="text-gray-500">{p.endDate || '—'}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">{p.totalTasks}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5 items-center">
                    <button
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-[#3f51b5] hover:bg-[#e8eaf6] transition-colors"
                      title="View project"
                    >
                      <Eye size={15} strokeWidth={2} />
                    </button>
                    {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                      <>
                        <button
                          onClick={() => navigate(`/projects/${p.id}/edit`)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit project"
                        >
                          <Pencil size={15} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => { setDeleteId(p.id); setDeleteError(''); }}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 size={15} strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={18} className="text-red-600" strokeWidth={2} />
              </div>
              <h2 className="text-[17px] font-bold text-gray-900">Delete Project</h2>
            </div>
            <p className="text-[14px] text-gray-500 mt-1 mb-4">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            {deleteError && <p className="text-[13px] text-red-600 mb-3">{deleteError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

  useEffect(() => {
    const fetch = user?.role === 'ADMIN'
      ? projectService.getAllProjects()
      : projectService.getMyProjects();
    fetch
      .then(res => setProjects(res.data))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await projectService.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch {
      alert('Failed to delete project');
    }
  };

  const filtered = statusFilter === 'All'
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
          <p className="text-[13px] text-gray-500 mt-0.5">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
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
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-400">No projects found</TableCell>
              </TableRow>
            )}
            {filtered.map(p => (
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
                          onClick={() => handleDelete(p.id)}
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
    </div>
  );
}

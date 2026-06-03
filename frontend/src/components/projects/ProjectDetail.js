import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { taskService, milestoneService, meetingService } from '../../services/taskService';
import { fileService } from '../../services/fileService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { Alert } from '../ui/alert';

const NAV_CARDS = [
  { key: 'tasks',      emoji: '📋', label: 'Tasks',      color: 'blue',   path: 'tasks'      },
  { key: 'milestones', emoji: '🏁', label: 'Milestones', color: 'green',  path: 'milestones' },
  { key: 'meetings',   emoji: '📅', label: 'Meetings',   color: 'amber',  path: 'meetings'   },
  { key: 'files',      emoji: '📂', label: 'Files',      color: 'violet', path: 'files'      },
  { key: 'report',     emoji: '📊', label: 'Reports',    color: 'indigo', path: 'report'     },
];

const COLOR = {
  blue:   'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
  green:  'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
  amber:  'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100',
  violet: 'bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100',
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts]   = useState({ tasks: 0, milestones: 0, meetings: 0, files: 0 });

  useEffect(() => {
    projectService.getById(id)
      .then(res => setProject(res.data))
      .catch(() => alert('Failed to load project'))
      .finally(() => setLoading(false));

    Promise.allSettled([
      taskService.getByProject(id),
      milestoneService.getByProject(id),
      meetingService.getByProject(id),
      fileService.getByProject(id),
    ]).then(([tasks, milestones, meetings, files]) => {
      setCounts({
        tasks:      tasks.status      === 'fulfilled' ? (tasks.value.data?.length      ?? 0) : 0,
        milestones: milestones.status === 'fulfilled' ? (milestones.value.data?.length ?? 0) : 0,
        meetings:   meetings.status   === 'fulfilled' ? (meetings.value.data?.length   ?? 0) : 0,
        files:      files.status      === 'fulfilled' ? (files.value.data?.length      ?? 0) : 0,
      });
    });
  }, [id]);

  if (loading)  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 animate-pulse">Loading project…</div>
    </div>
  );
  if (!project) return <Alert variant="error">Project not found</Alert>;

  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-[24px] font-extrabold text-[#1a237e] tracking-tight">{project.name}</h1>
            <Badge value={project.status}>{project.status}</Badge>
          </div>
          <p className="text-[13px] text-gray-500">Owner: <span className="font-medium text-gray-700">{project.ownerName}</span></p>
        </div>
        {canEdit && (
          <Button variant="warning" onClick={() => navigate(`/projects/${id}/edit`)}>Edit Project</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Description</p>
              <p className="text-[14px] text-gray-700">{project.description || 'No description provided'}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Owner</p>
              <p className="text-[14px] text-gray-700">{project.ownerName}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Members</p>
              {project.memberNames && project.memberNames.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {project.memberNames.map((name, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[12px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-2.5 py-0.5">
                      👤 {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[14px] text-gray-400">No members assigned</p>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Start Date</p>
                <p className="text-[14px] text-gray-700">{project.startDate || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">End Date</p>
                <p className="text-[14px] text-gray-700">{project.endDate || '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Total Tasks</p>
              <p className="text-[14px] text-gray-700">{project.totalTasks}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {NAV_CARDS.map(({ key, emoji, label, color, path }) => (
          <button
            key={key}
            onClick={() => navigate(`/projects/${id}/${path}`)}
            className={`${COLOR[color]} border rounded-xl p-5 text-left transition-all duration-150 hover:shadow-md active:scale-[0.98] cursor-pointer`}
          >
            <div className="text-3xl mb-2">{emoji}</div>
            <div className="text-[13px] font-bold">{label}</div>
            {counts[key] !== undefined && (
              <div className="text-2xl font-extrabold mt-1">{counts[key]}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

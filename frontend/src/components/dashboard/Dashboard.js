import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { taskService, milestoneService } from '../../services/taskService';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { Alert } from '../ui/alert';
import { Select } from '../ui/select';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/table';
import {
  FolderOpen, Activity, Zap, ListTodo, CheckCircle2,
  Flag, CalendarDays, PartyPopper, Plus, ArrowRight,
  ExternalLink, RotateCcw, Check, Clock
} from 'lucide-react';

function getActivityLinkUrl(a) {
  const base = `/projects/${a.projectId}`;
  switch (a.entityType) {
    case 'TASK':      return `${base}/tasks`;
    case 'MEETING':   return `${base}/meetings`;
    case 'MILESTONE': return `${base}/milestones`;
    default:          return base;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y.slice(2)}`;
}

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const STAT_CONFIG = {
  blue:   { bg: 'bg-blue-50',    icon: 'text-blue-500',    border: 'border-blue-200',   ring: 'bg-blue-500' },
  green:  { bg: 'bg-emerald-50', icon: 'text-emerald-500', border: 'border-emerald-200',ring: 'bg-emerald-500' },
  orange: { bg: 'bg-orange-50',  icon: 'text-orange-500',  border: 'border-orange-200', ring: 'bg-orange-500' },
  red:    { bg: 'bg-red-50',     icon: 'text-red-500',     border: 'border-red-200',    ring: 'bg-red-500' },
};

function StatCard({ color, value, label, icon }) {
  const cfg = STAT_CONFIG[color] || STAT_CONFIG.blue;
  return (
    <div className="bg-white rounded-xl px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center gap-4 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5">
      <div className={`w-11 h-11 rounded-xl ${cfg.bg} ${cfg.icon} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-[26px] font-extrabold text-gray-900 leading-none">{value}</div>
        <div className="text-[12px] text-gray-500 mt-0.5 font-medium">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const isAdmin = user?.role === 'ADMIN';

  const handleTaskStatusChange = async (task, newStatus) => {
    try {
      const res = await taskService.update(task.id, { ...task, status: newStatus, projectId: task.projectId });
      setData(prev => ({
        ...prev,
        myTasks: prev.myTasks.map(t => t.id === task.id ? res.data : t)
      }));
    } catch { /* silent */ }
  };

  const handleMilestoneToggle = async (milestone) => {
    try {
      const res = await milestoneService.update(milestone.id, {
        ...milestone, completed: !milestone.completed, projectId: milestone.projectId
      });
      setData(prev => ({
        ...prev,
        upcomingMilestones: prev.upcomingMilestones.map(m => m.id === milestone.id ? res.data : m)
      }));
    } catch { /* silent */ }
  };

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 text-[15px] animate-pulse">Loading dashboard…</div>
    </div>
  );
  if (error) return <Alert variant="error">{error}</Alert>;

  return (
    <div className="animate-fade-up">
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#1a237e] tracking-tight">
            Welcome back, {toTitleCase(user?.name)}
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Here's what's happening across your projects today.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-7">
        <StatCard color="blue"   value={data.totalProjects}   label="Total Projects"  icon={<FolderOpen size={20} />} />
        <StatCard color="green"  value={data.activeProjects}  label="Active Projects" icon={<Activity size={20} />} />
        <StatCard color="orange" value={data.tasksInProgress} label="In Progress"     icon={<Zap size={20} />} />
        <StatCard color="red"    value={data.tasksTodo}       label="To Do"           icon={<ListTodo size={20} />} />
        <StatCard color="green"  value={data.tasksDone}       label="Done"            icon={<CheckCircle2 size={20} />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-1.5">
              <FolderOpen size={15} className="text-[#3f51b5]" />
              Recent Projects
            </span>
          </CardTitle>
          {data.recentProjects?.length === 0 ? (
            <Button variant="primary" size="sm" onClick={() => navigate('/projects/new')} className="flex items-center gap-1.5">
              <Plus size={14} strokeWidth={2.5} /> New Project
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="flex items-center gap-1.5">
              View All <ArrowRight size={13} />
            </Button>
          )}
        </CardHeader>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Project Name</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Owner</TableHeader>
              <TableHeader>Start Date</TableHeader>
              <TableHeader>End Date</TableHeader>
              <TableHeader>Tasks</TableHeader>
              <TableHeader>Action</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {data.recentProjects?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-400">No projects yet</TableCell>
              </TableRow>
            )}
            {data.recentProjects?.map(p => (
              <TableRow key={p.id}>
                <TableCell><span className="font-semibold text-blue-700 cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>{p.name}</span></TableCell>
                <TableCell><Badge value={p.status}>{p.status}</Badge></TableCell>
                <TableCell className="text-gray-600">{p.ownerName}</TableCell>
                <TableCell className="text-gray-500">{formatDate(p.startDate)}</TableCell>
                <TableCell className="text-gray-500">{formatDate(p.endDate)}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">{p.totalTasks}</span>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-[#3f51b5] hover:bg-[#e8eaf6] transition-colors"
                    title="Open project"
                  >
                    <ExternalLink size={15} strokeWidth={2} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" />
              My Tasks
            </span>
          </CardTitle>
        </CardHeader>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Task</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Priority</TableHeader>
              <TableHeader>Due Date</TableHeader>
              {isAdmin && <TableHeader>Change Status</TableHeader>}
            </tr>
          </TableHead>
          <TableBody>
            {data.myTasks?.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-10 text-gray-400">No tasks assigned to you</TableCell>
              </TableRow>
            )}
            {data.myTasks?.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-medium text-blue-700 cursor-pointer" onClick={() => navigate(`/projects/${t.projectId}/tasks`)}>{t.title}</TableCell>
                <TableCell><Badge value={t.status}>{t.status}</Badge></TableCell>
                <TableCell><Badge value={t.priority}>{t.priority}</Badge></TableCell>
                <TableCell className="text-gray-500">{formatDate(t.endDate)}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <Select
                      value={t.status}
                      onChange={e => handleTaskStatusChange(t, e.target.value)}
                      className="w-auto text-xs py-1"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </Select>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <Card className="mb-0">
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-1.5">
                <Flag size={15} className="text-emerald-500" />
                Upcoming Milestones
              </span>
            </CardTitle>
            <span className="text-xs text-gray-400 font-medium">Next 30 days</span>
          </CardHeader>
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Milestone</TableHeader>
                <TableHeader>Due Date</TableHeader>
                <TableHeader>Status</TableHeader>
                {isAdmin && <TableHeader>Action</TableHeader>}
              </tr>
            </TableHead>
            <TableBody>
              {data.upcomingMilestones?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-10 text-gray-400">No upcoming milestones</TableCell>
                </TableRow>
              )}
              {data.upcomingMilestones?.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-blue-700 cursor-pointer" onClick={() => navigate(`/projects/${m.projectId}/milestones`)}>{m.title}</TableCell>
                  <TableCell className="text-gray-500">{formatDate(m.dueDate)}</TableCell>
                  <TableCell>
                    <Badge value={m.completed ? 'done' : 'todo'}>
                      {m.completed ? 'Completed' : 'Pending'}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Button
                        variant={m.completed ? 'warning' : 'success'}
                        size="sm"
                        onClick={() => handleMilestoneToggle(m)}
                        className="flex items-center gap-1"
                      >
                        {m.completed
                          ? <><RotateCcw size={12} /> Reopen</>
                          : <><Check size={12} /> Mark Done</>}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="mb-0">
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={15} className="text-amber-500" />
                Upcoming Meetings
              </span>
            </CardTitle>
            <span className="text-xs text-gray-400 font-medium">Next 7 days</span>
          </CardHeader>
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Meeting</TableHeader>
                <TableHeader>Date &amp; Time</TableHeader>
                <TableHeader>Location</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {data.upcomingMeetings?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-gray-400">No upcoming meetings</TableCell>
                </TableRow>
              )}
              {data.upcomingMeetings?.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-blue-700 cursor-pointer" onClick={() => navigate(`/projects/${m.projectId}/meetings`)}>{m.title}</TableCell>
                  <TableCell className="text-gray-500">{m.meetingDate ? new Date(m.meetingDate).toLocaleString() : '—'}</TableCell>
                  <TableCell className="text-gray-500">{m.location || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-1.5">
              <PartyPopper size={15} className="text-amber-500" />
              Upcoming Holidays
            </span>
          </CardTitle>
          <span className="text-xs text-gray-400 font-medium">Next 30 days</span>
        </CardHeader>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Holiday</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Day</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {(!data.upcomingHolidays || data.upcomingHolidays.length === 0) && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-gray-400">No holidays in the next 30 days</TableCell>
              </TableRow>
            )}
            {data.upcomingHolidays?.map(h => (
              <TableRow key={h.id}>
                <TableCell className="font-medium text-blue-700 cursor-pointer" onClick={() => navigate('/calendar')}>{h.name}</TableCell>
                <TableCell className="text-gray-500">{formatDate(h.holidayDate)}</TableCell>
                <TableCell className="text-gray-500">{new Date(h.holidayDate + 'T00:00:00').toLocaleDateString('default', { weekday: 'long' })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {data.recentActivity?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-[#3f51b5]" />
                Recent Activity
              </span>
            </CardTitle>
          </CardHeader>
          <div className="divide-y divide-gray-50 max-h-[320px] overflow-y-auto">
            {data.recentActivity.map(a => (
              <div key={a.id} onClick={() => navigate(getActivityLinkUrl(a))} className="group flex items-start gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-[#e8eaf6] flex items-center justify-center shrink-0 text-[11px] font-bold text-[#3f51b5]">
                  {a.userName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-800">
                    <span className="font-semibold">{a.userName || 'Someone'}</span>
                    {' '}{a.action?.toLowerCase().replace('_', ' ')}{' '}
                    <span className="font-medium text-[#3f51b5]">{a.entityName}</span>
                    {a.projectName && <span className="text-gray-400"> in {a.projectName}</span>}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {a.entityType}
                  </span>
                  <ExternalLink size={11} strokeWidth={2} className="text-gray-300 group-hover:text-[#3f51b5] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

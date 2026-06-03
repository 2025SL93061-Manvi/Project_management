import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { taskService, milestoneService } from '../../services/taskService';

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

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {toTitleCase(user?.name)} 👋</h1>
      </div>

      <div className="stats-row">
        <div className="stat-card blue">
          <div className="stat-value">{data.totalProjects}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{data.activeProjects}</div>
          <div className="stat-label">Active Projects</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-value">{data.tasksInProgress}</div>
          <div className="stat-label">Tasks In Progress</div>
        </div>
        <div className="stat-card red">
          <div className="stat-value">{data.tasksTodo}</div>
          <div className="stat-label">Tasks To Do</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{data.tasksDone}</div>
          <div className="stat-label">Tasks Done</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">📁 Recent Projects</span>
          {data.recentProjects?.length === 0 ? (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/projects/new')}>+ New Project</button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/projects')}>View All</button>
          )}
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Project Name</th><th>Status</th><th>Owner</th>
                <th>Start Date</th><th>End Date</th><th>Tasks</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.recentProjects?.length === 0 && (
                <tr><td colSpan={7} className="empty-msg">No projects yet</td></tr>
              )}
              {data.recentProjects?.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td><span className={`badge badge-${p.status?.toLowerCase()}`}>{p.status}</span></td>
                  <td>{p.ownerName}</td>
                  <td>{p.startDate || '—'}</td>
                  <td>{p.endDate || '—'}</td>
                  <td>{p.totalTasks}</td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/projects/${p.id}`)}>Open</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">✅ My Tasks</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Task</th><th>Status</th><th>Priority</th><th>Due Date</th>
                {isAdmin && <th>Change Status</th>}
              </tr>
            </thead>
            <tbody>
              {data.myTasks?.length === 0 && (
                <tr><td colSpan={isAdmin ? 5 : 4} className="empty-msg">No tasks assigned to you</td></tr>
              )}
              {data.myTasks?.map(t => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td><span className={`badge badge-${t.status?.toLowerCase()}`}>{t.status}</span></td>
                  <td><span className={`badge badge-${t.priority?.toLowerCase()}`}>{t.priority}</span></td>
                  <td>{t.endDate || '—'}</td>
                  {isAdmin && (
                    <td>
                      <select value={t.status} onChange={e => handleTaskStatusChange(t, e.target.value)}>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="form-row">
        <div className="card">
          <div className="card-header">
            <span className="card-title">🏁 Upcoming Milestones</span>
            <small style={{color:'#888'}}>Next 30 days</small>
          </div>
          <table>
            <thead>
              <tr>
                <th>Milestone</th><th>Due Date</th><th>Status</th>
                {isAdmin && <th>Change Status</th>}
              </tr>
            </thead>
            <tbody>
              {data.upcomingMilestones?.length === 0 && (
                <tr><td colSpan={isAdmin ? 4 : 3} className="empty-msg">No upcoming milestones</td></tr>
              )}
              {data.upcomingMilestones?.map(m => (
                <tr key={m.id}>
                  <td>{m.title}</td>
                  <td>{m.dueDate || '—'}</td>
                  <td>
                    <span className={`badge ${m.completed ? 'badge-done' : 'badge-todo'}`}>
                      {m.completed ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <button className={`btn btn-sm ${m.completed ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleMilestoneToggle(m)}>
                        {m.completed ? 'Reopen' : 'Mark Done'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Upcoming Meetings</span>
            <small style={{color:'#888'}}>Next 7 days</small>
          </div>
          <table>
            <thead>
              <tr><th>Meeting</th><th>Date & Time</th><th>Location</th></tr>
            </thead>
            <tbody>
              {data.upcomingMeetings?.length === 0 && (
                <tr><td colSpan={3} className="empty-msg">No upcoming meetings</td></tr>
              )}
              {data.upcomingMeetings?.map(m => (
                <tr key={m.id}>
                  <td>{m.title}</td>
                  <td>{m.meetingDate ? new Date(m.meetingDate).toLocaleString() : '—'}</td>
                  <td>{m.location || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Upcoming Holidays</span>
          <small style={{color:'#888'}}>Next 30 days</small>
        </div>
        <table>
          <thead>
            <tr><th>Holiday</th><th>Date</th><th>Day</th></tr>
          </thead>
          <tbody>
            {(!data.upcomingHolidays || data.upcomingHolidays.length === 0) && (
              <tr><td colSpan={3} className="empty-msg">No holidays in the next 30 days</td></tr>
            )}
            {data.upcomingHolidays?.map(h => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td>{h.holidayDate}</td>
                <td>{new Date(h.holidayDate + 'T00:00:00').toLocaleDateString('default', { weekday: 'long' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

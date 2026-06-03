import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { reportService } from '../../services/fileService';
import { projectService } from '../../services/projectService';
import { taskService, milestoneService } from '../../services/taskService';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
import { Card, CardHeader, CardTitle } from '../ui/card';

export default function ReportViewer() {
  const { id: projectId } = useParams();
  const [loading, setLoading]   = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleDownload = async () => {
    setLoading(true);
    clearMessages();
    try {
      const res = await reportService.download(projectId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-report-${projectId}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      setSuccess('Report downloaded successfully!');
    } catch {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    setEmailing(true);
    clearMessages();
    try {
      await reportService.email(projectId);
      setSuccess('Report summary emailed to your account!');
    } catch {
      setError('Failed to send email — check SMTP configuration');
    } finally {
      setEmailing(false);
    }
  };

  const handlePrint = async () => {
    clearMessages();
    try {
      const [projRes, tasksRes, milestonesRes] = await Promise.all([
        projectService.getById(projectId),
        taskService.getByProject(projectId),
        milestoneService.getByProject(projectId),
      ]);
      const project    = projRes.data;
      const tasks      = tasksRes.data;
      const milestones = milestonesRes.data;

      const counts = tasks.reduce((acc, t) => {
        if (t.status === 'DONE') acc.done++;
        else if (t.status === 'IN_PROGRESS') acc.inProgress++;
        else if (t.status === 'TODO') acc.todo++;
        return acc;
      }, { done: 0, inProgress: 0, todo: 0 });
      const { done, inProgress, todo } = counts;

      const taskRows = tasks.map(t => `
        <tr>
          <td>${t.title}</td>
          <td>${t.description || '—'}</td>
          <td>${t.status}</td>
          <td>${t.priority}</td>
          <td>${t.assigneeNames?.join(', ') || t.assignedToName || 'Unassigned'}</td>
          <td>${t.startDate || '—'}</td>
          <td>${t.endDate || '—'}</td>
        </tr>`).join('');

      const milestoneRows = milestones.map(m => `
        <tr>
          <td>${m.title}</td>
          <td>${m.dueDate || '—'}</td>
          <td>${m.completed ? 'Completed' : 'Pending'}</td>
        </tr>`).join('');

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Project Report — ${project.name}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; color: #222; margin: 32px; }
    h1   { font-size: 22px; color: #3a3a7c; margin-bottom: 4px; }
    h2   { font-size: 15px; color: #3a3a7c; margin: 24px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    .meta { color: #555; margin-bottom: 20px; font-size: 12px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .summary-box  { border: 1px solid #ddd; border-radius: 6px; padding: 12px 16px; text-align: center; }
    .summary-box .val { font-size: 28px; font-weight: bold; color: #3a3a7c; }
    .summary-box .lbl { font-size: 11px; color: #888; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th    { background: #3a3a7c; color: #fff; text-align: left; padding: 8px 10px; font-size: 12px; }
    td    { padding: 7px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
    tr:nth-child(even) td { background: #f9f9f9; }
    .info-table td:first-child { font-weight: bold; width: 140px; color: #555; }
    @media print { body { margin: 16px; } button { display: none; } }
  </style>
</head>
<body>
  <h1>Project Status Report</h1>
  <div class="meta">Generated on ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</div>
  <h2>Project Summary</h2>
  <table class="info-table">
    <tr><td>Project Name</td><td>${project.name}</td></tr>
    <tr><td>Description</td><td>${project.description || '—'}</td></tr>
    <tr><td>Status</td><td>${project.status}</td></tr>
    <tr><td>Owner</td><td>${project.ownerName || '—'}</td></tr>
    <tr><td>Start Date</td><td>${project.startDate || '—'}</td></tr>
    <tr><td>End Date</td><td>${project.endDate || '—'}</td></tr>
  </table>
  <h2>Task Overview</h2>
  <div class="summary-grid">
    <div class="summary-box"><div class="val">${tasks.length}</div><div class="lbl">Total Tasks</div></div>
    <div class="summary-box"><div class="val">${done}</div><div class="lbl">Done</div></div>
    <div class="summary-box"><div class="val">${inProgress}</div><div class="lbl">In Progress</div></div>
    <div class="summary-box"><div class="val">${todo}</div><div class="lbl">To Do</div></div>
  </div>
  <h2>Task List</h2>
  <table>
    <thead><tr><th>Title</th><th>Description</th><th>Status</th><th>Priority</th><th>Assigned To</th><th>Start</th><th>Due</th></tr></thead>
    <tbody>${taskRows || '<tr><td colspan="7">No tasks</td></tr>'}</tbody>
  </table>
  <h2>Milestones</h2>
  <table>
    <thead><tr><th>Title</th><th>Due Date</th><th>Status</th></tr></thead>
    <tbody>${milestoneRows || '<tr><td colspan="3">No milestones</td></tr>'}</tbody>
  </table>
</body>
</html>`;

      const win = window.open('', '_blank');
      if (!win) {
        setError('Pop-up blocked by browser — please allow pop-ups for this site and try again.');
        return;
      }
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    } catch {
      setError('Failed to load report data for printing');
    }
  };

  const busy = loading || emailing;

  return (
    <div>
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1a237e] tracking-tight">📊 Project Report</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Export or print a full project status report</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Project Status Report</CardTitle>
        </CardHeader>
        <p className="text-[13px] text-gray-600 mb-3">
          Generate a full project status report. The report includes:
        </p>
        <ul className="text-[13px] text-gray-600 space-y-1 mb-6 ml-4 list-disc">
          <li>Project summary (name, status, dates, owner)</li>
          <li>Task count breakdown (Todo / In Progress / Done)</li>
          <li>Full task list with assignees and due dates</li>
        </ul>

        {error   && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="flex flex-wrap gap-3">
          <Button variant="success" onClick={handleDownload} disabled={busy}>
            {loading ? '⏳ Generating…' : '⬇ Download Excel'}
          </Button>
          <Button variant="primary" onClick={handleEmail} disabled={busy}>
            {emailing ? '⏳ Sending…' : '✉ Email Report'}
          </Button>
          <Button variant="secondary" onClick={handlePrint} disabled={busy}>
            🖨 Print Report
          </Button>
        </div>
        <p className="mt-5 text-xs text-gray-400 border-t border-gray-100 pt-4">
          Weekly and monthly reports are automatically emailed to project owners every Monday and on the 1st of each month.
        </p>
      </Card>
    </div>
  );
}

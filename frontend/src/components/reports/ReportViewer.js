import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { reportService } from '../../services/fileService';

export default function ReportViewer() {
  const { id: projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Project Report</h1>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Export Project Status Report</span>
        </div>
        <p style={{marginBottom:16, color:'#555'}}>
          Download a full project status report as an Excel file (.xlsx). The report includes:
        </p>
        <ul style={{marginLeft:20, marginBottom:24, color:'#555', lineHeight:2}}>
          <li>Project summary (name, status, dates, owner)</li>
          <li>Task count breakdown (Todo / In Progress / Done)</li>
          <li>Full task list with assignees and due dates</li>
        </ul>
        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <button className="btn btn-success" onClick={handleDownload} disabled={loading}>
          {loading ? 'Generating...' : '⬇ Download Excel Report'}
        </button>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fileService } from '../../services/fileService';
import { useAuth } from '../../context/AuthContext';

export default function FileStorage() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [files, setFiles]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    fileService.getByProject(projectId)
      .then(res => setFiles(res.data))
      .catch(() => setError('Failed to load files'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Upload failed. Max file size is 10 MB.');
      e.target.value = '';
      return;
    }
    setUploading(true);
    setError('');
    try {
      const res = await fileService.upload(projectId, file);
      setFiles([...files, res.data]);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message;
      setError(msg ? `Upload failed: ${msg}` : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (file) => {
    try {
      const res = await fileService.download(file.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Download failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    await fileService.delete(id);
    setFiles(files.filter(f => f.id !== id));
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) return <div className="loading">Loading files...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📂 File Storage</h1>
        <label className="btn btn-primary" style={{cursor:'pointer'}}>
          {uploading ? 'Uploading...' : '+ Upload File'}
          <input type="file" style={{display:'none'}} onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>File Name</th><th>Type</th><th>Size</th>
                <th>Uploaded By</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 && (
                <tr><td colSpan={6} className="empty-msg">No files uploaded yet</td></tr>
              )}
              {files.map(f => (
                <tr key={f.id}>
                  <td>📄 {f.fileName}</td>
                  <td>{f.fileType || '—'}</td>
                  <td>{formatSize(f.fileSize)}</td>
                  <td>{f.uploadedBy?.name || '—'}</td>
                  <td>{f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="flex-gap">
                      <button className="btn btn-success btn-sm" onClick={() => handleDownload(f)}>Download</button>
                      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f.id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

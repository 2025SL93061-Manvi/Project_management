import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fileService } from '../../services/fileService';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../ui/alert';
import { Card } from '../ui/card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/table';
import { FolderOpen, Upload, Loader2, Eye, Download, Trash2, FileText, FileImage, BookOpen } from 'lucide-react';

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

  const isViewable = (fileType) => {
    if (!fileType) return false;
    return fileType.startsWith('image/') || fileType === 'application/pdf';
  };

  const handleView = async (file) => {
    try {
      const res = await fileService.view(file.id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: file.fileType }));
      window.open(url, '_blank');
    } catch {
      alert('Failed to open file');
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

  const FileIcon = ({ type }) => {
    if (!type) return <FileText size={18} className="text-gray-400" />;
    if (type.startsWith('image/')) return <FileImage size={18} className="text-violet-500" />;
    if (type === 'application/pdf') return <BookOpen size={18} className="text-red-500" />;
    return <FileText size={18} className="text-gray-400" />;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 animate-pulse">Loading files…</div>
    </div>
  );

  return (
    <div className="animate-fade-up">
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1a237e] tracking-tight flex items-center gap-2">
            <FolderOpen size={22} strokeWidth={2.2} className="text-[#3f51b5]" />
            File Storage
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{files.length} file{files.length !== 1 ? 's' : ''} · Max 10 MB per file</p>
        </div>
        <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all duration-150 shadow-sm ${uploading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#3f51b5] text-white hover:bg-[#3547a8] hover:shadow-md'}`}>
          {uploading
            ? <><Loader2 size={14} className="animate-spin" /> Uploading…</>
            : <><Upload size={14} /> Upload File</>}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Card>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>File Name</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Size</TableHeader>
              <TableHeader>Uploaded By</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {files.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-400">No files uploaded yet</TableCell>
              </TableRow>
            )}
            {files.map(f => (
              <TableRow key={f.id}>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <FileIcon type={f.fileType} />
                    <span className="font-medium text-gray-800">{f.fileName}</span>
                  </span>
                </TableCell>
                <TableCell className="text-gray-500 text-xs">{f.fileType || '—'}</TableCell>
                <TableCell className="text-gray-500">{formatSize(f.fileSize)}</TableCell>
                <TableCell className="text-gray-600">{f.uploadedBy?.name || '—'}</TableCell>
                <TableCell className="text-gray-500">{f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1.5 items-center">
                    {isViewable(f.fileType) && (
                      <button
                        onClick={() => handleView(f)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-[#3f51b5] hover:bg-[#e8eaf6] transition-colors"
                        title="View file"
                      >
                        <Eye size={15} strokeWidth={2} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(f)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Download file"
                    >
                      <Download size={15} strokeWidth={2} />
                    </button>
                    {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete file"
                      >
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
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

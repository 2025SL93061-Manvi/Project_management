import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { activityService } from '../../services/activityService';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { Clock, ArrowLeft } from 'lucide-react';

const ACTION_COLOR = {
  CREATED:        { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  UPDATED:        { bg: 'bg-blue-100',    text: 'text-blue-700'    },
  STATUS_CHANGED: { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  DELETED:        { bg: 'bg-red-100',     text: 'text-red-600'     },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ActivityLogPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    activityService.getByProject(projectId)
      .then(res => setLogs(res.data || []))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <div className="animate-fade-up">
      <div className="mb-5">
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="flex items-center gap-1 text-[13px] text-gray-400 hover:text-[#3f51b5] mb-1.5 transition-colors"
        >
          <ArrowLeft size={13} strokeWidth={2} /> Back to Project
        </button>
        <h1 className="text-[24px] font-extrabold text-[#1a237e] tracking-tight flex items-center gap-2">
          <Clock size={22} strokeWidth={2.2} className="text-[#3f51b5]" />
          Activity Log
        </h1>
        <p className="text-[13px] text-gray-500 mt-0.5">{logs.length} event{logs.length !== 1 ? 's' : ''} recorded for this project</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Activity</CardTitle>
          <span className="text-xs text-gray-400 font-medium">Most recent first</span>
        </CardHeader>

        {loading && (
          <div className="px-4 py-12 text-center text-gray-400 animate-pulse text-sm">Loading…</div>
        )}

        {!loading && logs.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">No activity recorded yet</div>
        )}

        {!loading && logs.length > 0 && (
          <div className="divide-y divide-gray-50">
            {logs.map((a, i) => {
              const colors = ACTION_COLOR[a.action] || { bg: 'bg-gray-100', text: 'text-gray-600' };
              return (
                <div key={a.id} className="flex items-start gap-4 px-4 py-3.5 hover:bg-gray-50/60 transition-colors">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center shrink-0 pt-1">
                    <div className="w-7 h-7 rounded-full bg-[#e8eaf6] flex items-center justify-center text-[11px] font-bold text-[#3f51b5]">
                      {a.userName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    {i < logs.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1.5 min-h-[16px]" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-gray-800">{a.userName || 'Unknown'}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${colors.bg} ${colors.text}`}>
                        {a.action?.replace('_', ' ')}
                      </span>
                      <span className="text-[13px] text-gray-500">
                        <span className="text-[12px] text-gray-400">{a.entityType?.toLowerCase()} </span>
                        <span className="font-medium text-gray-700">{a.entityName}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(a.createdAt)}</p>
                  </div>

                  {/* Timestamp */}
                  <span className="text-[11px] text-gray-400 shrink-0 pt-1 hidden sm:block">
                    {a.createdAt ? new Date(a.createdAt).toLocaleString('en-GB', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    }) : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { taskService } from '../../services/taskService';
import { Badge } from '../ui/badge';
import { Plus, GripVertical } from 'lucide-react';

const COLUMNS = [
  { key: 'TODO',        label: 'To Do',      color: '#6366f1', bg: '#eef2ff' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#f59e0b', bg: '#fffbeb' },
  { key: 'DONE',        label: 'Done',        color: '#10b981', bg: '#ecfdf5' },
];

function TaskCard({ task, onDragStart, onEdit }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className="bg-white rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[13px] font-semibold text-gray-900 leading-snug flex-1">{task.title}</span>
        <GripVertical size={14} className="text-gray-300 shrink-0 mt-0.5 group-hover:text-gray-400" />
      </div>
      {task.description && (
        <p className="text-[11px] text-gray-400 mb-2 truncate">{task.description}</p>
      )}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge value={task.priority}>{task.priority}</Badge>
        <div className="flex items-center gap-2">
          {task.assigneeNames?.length > 0 && (
            <div className="flex -space-x-1.5">
              {task.assigneeNames.slice(0, 3).map((name, i) => (
                <div
                  key={i}
                  title={name}
                  className="w-5 h-5 rounded-full bg-[#3f51b5] text-white text-[9px] font-bold flex items-center justify-center border border-white"
                >
                  {name.charAt(0).toUpperCase()}
                </div>
              ))}
              {task.assigneeNames.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[9px] font-bold flex items-center justify-center border border-white">
                  +{task.assigneeNames.length - 3}
                </div>
              )}
            </div>
          )}
          {task.endDate && (
            <span className="text-[10px] text-gray-400 font-medium">{task.endDate}</span>
          )}
        </div>
      </div>
      <button
        onClick={() => onEdit(task)}
        className="mt-2 w-full text-[11px] text-gray-400 hover:text-[#3f51b5] text-left transition-colors opacity-0 group-hover:opacity-100"
      >
        Edit…
      </button>
    </div>
  );
}

export default function KanbanBoard({ tasks, setTasks, onEdit, onAddTask, canManage }) {
  const [dragTask, setDragTask]   = useState(null);
  const [dragOver, setDragOver]   = useState(null);

  const handleDragStart = (e, task) => {
    setDragTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(colKey);
  };

  const handleDrop = async (e, colKey) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragTask || dragTask.status === colKey) return;
    const updated = { ...dragTask, status: colKey };
    setTasks(prev => prev.map(t => t.id === dragTask.id ? { ...t, status: colKey } : t));
    try {
      await taskService.update(dragTask.id, { ...dragTask, status: colKey });
    } catch {
      setTasks(prev => prev.map(t => t.id === dragTask.id ? dragTask : t));
    }
    setDragTask(null);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key);
        const isOver   = dragOver === col.key;
        return (
          <div
            key={col.key}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, col.key)}
            className={`rounded-2xl p-3 transition-all duration-150 ${
              isOver
                ? 'ring-2 ring-[#3f51b5] ring-offset-2 bg-[#e8eaf6]/50'
                : 'bg-gray-100/70'
            }`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                <span className="text-[13px] font-bold text-gray-700">{col.label}</span>
                <span
                  className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: col.bg, color: col.color }}
                >
                  {colTasks.length}
                </span>
              </div>
              {canManage && (
                <button
                  onClick={() => onAddTask(col.key)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-[#3f51b5] hover:bg-white transition-colors"
                  title={`Add task to ${col.label}`}
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Cards */}
            <div className="space-y-2 min-h-[120px]">
              {colTasks.length === 0 && (
                <div className={`h-16 rounded-xl border-2 border-dashed flex items-center justify-center text-[12px] transition-colors ${
                  isOver ? 'border-[#3f51b5] text-[#3f51b5]' : 'border-gray-200 text-gray-300'
                }`}>
                  {isOver ? 'Drop here' : 'No tasks'}
                </div>
              )}
              {colTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

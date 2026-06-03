import React from 'react';
import { cn } from '../../lib/utils';

function Modal({ show, onClose, title, children, className }) {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[200] p-4 animate-backdrop-in"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-white rounded-2xl p-7 w-full max-w-[540px] max-h-[90vh] overflow-y-auto shadow-[0_8px_40px_rgba(0,0,0,0.18)] border border-gray-100 animate-modal-in',
          className
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-[17px] font-bold text-[#1a237e]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export { Modal };

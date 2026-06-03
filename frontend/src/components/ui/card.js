import React from 'react';
import { cn } from '../../lib/utils';

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.05)] mb-5 border border-gray-100 transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]',
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex justify-between items-center mb-4 pb-3 border-b border-gray-100', className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <span
      className={cn('text-[15px] font-bold text-[#1a237e] tracking-tight', className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle };

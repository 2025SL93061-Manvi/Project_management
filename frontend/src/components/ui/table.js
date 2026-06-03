import React from 'react';
import { cn } from '../../lib/utils';

function Table({ className, ...props }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table
        className={cn('w-full border-collapse text-[13px]', className)}
        {...props}
      />
    </div>
  );
}

function TableHead({ className, ...props }) {
  return <thead className={cn('', className)} {...props} />;
}

function TableBody({ className, ...props }) {
  return <tbody className={cn('divide-y divide-gray-50', className)} {...props} />;
}

function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn('transition-colors hover:bg-indigo-50/40 group', className)}
      {...props}
    />
  );
}

function TableHeader({ className, ...props }) {
  return (
    <th
      className={cn(
        'bg-gray-50 px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200',
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }) {
  return (
    <td
      className={cn('px-4 py-3 border-b border-gray-50 align-middle text-[13px] text-gray-700', className)}
      {...props}
    />
  );
}

export { Table, TableHead, TableBody, TableRow, TableHeader, TableCell };

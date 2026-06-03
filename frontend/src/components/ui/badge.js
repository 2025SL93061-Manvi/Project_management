import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap border',
  {
    variants: {
      variant: {
        planning:    'bg-blue-50   text-blue-700   border-blue-200',
        active:      'bg-emerald-50 text-emerald-700 border-emerald-200',
        on_hold:     'bg-amber-50  text-amber-700  border-amber-200',
        completed:   'bg-purple-50 text-purple-700 border-purple-200',
        todo:        'bg-rose-50   text-rose-700   border-rose-200',
        in_progress: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        done:        'bg-emerald-50 text-emerald-700 border-emerald-200',
        low:         'bg-green-50  text-green-700  border-green-200',
        medium:      'bg-orange-50 text-orange-600 border-orange-200',
        high:        'bg-red-50    text-red-700    border-red-200',
        open:        'bg-red-50    text-red-700    border-red-200',
        in_review:   'bg-amber-50  text-amber-700  border-amber-200',
        resolved:    'bg-emerald-50 text-emerald-700 border-emerald-200',
        default:     'bg-gray-50   text-gray-600   border-gray-200',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, value, ...props }) {
  const resolvedVariant = (value?.toLowerCase().replace(/[\s-]/g, '_')) || variant || 'default';
  return (
    <span
      className={cn(badgeVariants({ variant: resolvedVariant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

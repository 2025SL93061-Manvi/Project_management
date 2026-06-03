import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const alertVariants = cva(
  'flex items-start gap-2.5 px-4 py-3 rounded-lg mb-4 text-[13px] border',
  {
    variants: {
      variant: {
        error:   'bg-red-50   text-red-800   border-red-200',
        success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        info:    'bg-blue-50  text-blue-800  border-blue-200',
      },
    },
    defaultVariants: { variant: 'info' },
  }
);

const ICONS = {
  error:   '✕',
  success: '✓',
  info:    'ℹ',
};

function Alert({ className, variant = 'info', children, ...props }) {
  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
      <span className="font-bold mt-px shrink-0">{ICONS[variant]}</span>
      <span>{children}</span>
    </div>
  );
}

export { Alert };

import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const roleBadgeVariants = cva(
  'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white',
  {
    variants: {
      role: {
        admin:     'bg-[#c62828]',
        manager:   'bg-[#e65100]',
        developer: 'bg-[#2e7d32]',
      },
    },
    defaultVariants: { role: 'developer' },
  }
);

function RoleBadge({ role, className, ...props }) {
  return (
    <span
      className={cn(roleBadgeVariants({ role: role?.toLowerCase() }), className)}
      {...props}
    >
      {role}
    </span>
  );
}

export { RoleBadge };

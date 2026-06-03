import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-md text-[13px] font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed no-underline select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
  {
    variants: {
      variant: {
        primary:   'bg-[#3f51b5] text-white shadow-sm hover:bg-[#3547a8] hover:shadow-md active:scale-[0.98] focus-visible:ring-[#3f51b5]',
        success:   'bg-[#2e7d32] text-white shadow-sm hover:bg-[#266429] hover:shadow-md active:scale-[0.98] focus-visible:ring-[#2e7d32]',
        danger:    'bg-[#d32f2f] text-white shadow-sm hover:bg-[#b71c1c] hover:shadow-md active:scale-[0.98] focus-visible:ring-[#d32f2f]',
        warning:   'bg-[#e65100] text-white shadow-sm hover:bg-[#bf360c] hover:shadow-md active:scale-[0.98] focus-visible:ring-[#e65100]',
        secondary: 'bg-[#546e7a] text-white shadow-sm hover:bg-[#455a64] hover:shadow-md active:scale-[0.98] focus-visible:ring-[#546e7a]',
        outline:   'bg-white/10 text-white border border-white/40 hover:bg-white/20 hover:border-white/60 active:scale-[0.98] backdrop-blur-sm',
        ghost:     'bg-transparent text-[#3f51b5] hover:bg-[#3f51b5]/10 active:scale-[0.98]',
      },
      size: {
        default: 'px-4 py-2',
        sm:      'px-3 py-1.5 text-xs',
        lg:      'px-6 py-2.5 text-sm',
        full:    'w-full justify-center px-4 py-2.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size:    'default',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

import React from 'react';
import { cn } from '../../lib/utils';

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-800 outline-none transition-all duration-150 shadow-sm hover:border-gray-300 focus:border-[#3f51b5] focus:ring-2 focus:ring-[#3f51b5]/15 cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

export { Select };

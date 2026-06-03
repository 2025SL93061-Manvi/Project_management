import React from 'react';
import { cn } from '../../lib/utils';

const FormGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mb-4', className)} {...props} />
));
FormGroup.displayName = 'FormGroup';

export { FormGroup };

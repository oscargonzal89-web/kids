import React from 'react';
import { cn } from './utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm', className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';



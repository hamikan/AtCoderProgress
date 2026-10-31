'use client';

import { forwardRef, type ComponentProps } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const SidebarAddProblemButton = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'absolute right-1 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 opacity-0 outline-none transition-opacity hover:bg-slate-200 hover:text-slate-900 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-emerald-500 group-hover/sidebar-row:opacity-100 group-data-[collapsible=icon]:hidden data-[state=open]:bg-slate-200 data-[state=open]:opacity-100 pointer-coarse:opacity-100',
        className
      )}
      {...props}
    >
      <Plus className="size-3.5" />
    </button>
  )
);
SidebarAddProblemButton.displayName = 'SidebarAddProblemButton';

export default SidebarAddProblemButton;

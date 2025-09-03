// Reusable delete confirmation component
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DeleteConfirmationProps {
  isVisible: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  className?: string;
}

export function DeleteConfirmation({
  isVisible,
  isDeleting,
  onConfirm,
  onCancel,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  className
}: DeleteConfirmationProps) {
  if (!isVisible) return null;

  return (
    <div className={cn(
      'mt-4 p-3 bg-red-50 border border-red-200 rounded-lg',
      className
    )}>
      {title && (
        <h4 className="text-sm font-medium text-red-900 mb-2">{title}</h4>
      )}
      <p className="text-sm text-red-800 mb-3">{message}</p>
      <div className="flex gap-2">
        <Button 
          variant="destructive"
          className="text-sm py-2 px-3"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
        </Button>
        <Button 
          variant="outline"
          className="text-sm py-2 px-3"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

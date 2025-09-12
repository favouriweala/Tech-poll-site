'use client';

import { cn } from '@/lib/utils';

/**
 * Loading Spinner Props
 */
interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Custom className for styling */
  className?: string;
  /** Loading text to display */
  text?: string;
  /** Whether to show as fullscreen overlay */
  fullscreen?: boolean;
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'white';
}

/**
 * Size mappings for spinner
 */
const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

/**
 * Color variant mappings
 */
const variantClasses = {
  primary: 'border-blue-500',
  secondary: 'border-gray-500',
  white: 'border-white'
};

/**
 * Loading Spinner Component
 * 
 * WHAT: Reusable loading spinner component with multiple size and style variants
 * for consistent loading states across the application.
 * 
 * WHY: Consistent loading indicators are important because:
 * 1. Provide visual feedback during async operations
 * 2. Improve perceived performance and user experience
 * 3. Prevent user confusion during loading states
 * 4. Maintain consistent design language across the app
 * 
 * HOW: Uses CSS animations and Tailwind classes for smooth spinning animation
 * with configurable size, color, and layout options.
 */
export function LoadingSpinner({
  size = 'md',
  className,
  text,
  fullscreen = false,
  variant = 'primary'
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn(
      'animate-spin rounded-full border-t-2 border-b-2',
      sizeClasses[size],
      variantClasses[variant],
      className
    )} />
  );

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {spinner}
      {text && (
        <p className={cn(
          'text-sm font-medium',
          variant === 'white' ? 'text-white' : 'text-gray-600'
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Inline Loading Spinner for buttons and small spaces
 */
export function InlineSpinner({ size = 'sm', className, variant = 'white' }: Omit<LoadingSpinnerProps, 'text' | 'fullscreen'>) {
  return (
    <div className={cn(
      'animate-spin rounded-full border-t-2 border-b-2',
      sizeClasses[size],
      variantClasses[variant],
      className
    )} />
  );
}

/**
 * Page Loading Component for full page loading states
 */
export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

/**
 * Card Loading Component for loading states within cards
 */
export function CardLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}
/**
 * LoadingSpinner — animated signal-colored spinner.
 * @param {{ size?: 'sm'|'md'|'lg', className?: string }} props
 */
export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-14 w-14 border-4',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block rounded-full border-signal border-t-transparent animate-spin ${sizes[size]} ${className}`}
    />
  );
}

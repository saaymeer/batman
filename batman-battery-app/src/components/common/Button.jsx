/**
 * Button component
 *
 * Variants:
 *  - primary   : signal-colored large pill with beacon glow (the one signature element)
 *  - secondary : outlined/ghost on dark background
 *  - ghost     : text only
 *  - danger    : alert-red destructive actions
 *  - success   : go-green positive actions
 */

const BASE =
  'inline-flex items-center justify-center gap-2 font-display font-semibold rounded-full ' +
  'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-50 disabled:cursor-not-allowed ' +
  'select-none cursor-pointer';

const SIZES = {
  sm: 'text-sm px-4 py-2 min-h-[36px]',
  md: 'text-base px-6 py-3 min-h-[44px]',
  lg: 'text-lg px-8 py-4 min-h-[56px]',
  xl: 'text-xl px-10 py-5 min-h-[72px] tracking-tight',
};

const VARIANTS = {
  primary:
    'bg-signal text-ink hover:bg-signal/90 active:scale-[0.97] btn-beacon shadow-[0_0_20px_6px_rgba(245,166,35,0.45)]',
  secondary:
    'bg-surface text-mist border border-white/10 hover:bg-white/5 active:scale-[0.97]',
  ghost: 'bg-transparent text-fog hover:text-mist hover:bg-white/5 active:scale-[0.97]',
  danger:
    'bg-alert/15 text-alert border border-alert/30 hover:bg-alert/25 active:scale-[0.97]',
  success:
    'bg-go/15 text-go border border-go/30 hover:bg-go/25 active:scale-[0.97]',
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  loading = false,
  ...props
}) {
  return (
    <button
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

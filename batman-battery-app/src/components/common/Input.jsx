/**
 * Input — dark-themed text input with label and inline error slot.
 */
export default function Input({
  label,
  id,
  error,
  className = '',
  as: Tag = 'input',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-fog font-display"
        >
          {label}
        </label>
      )}
      <Tag
        id={id}
        className={[
          'w-full rounded-xl bg-ink border px-4 py-3 text-mist placeholder:text-fog/50',
          'transition-colors duration-150 outline-none font-body text-base',
          'focus:border-signal focus:ring-1 focus:ring-signal/50',
          error
            ? 'border-alert focus:border-alert focus:ring-alert/30'
            : 'border-white/10 hover:border-white/20',
          className,
        ].join(' ')}
        {...props}
      />
      {error && (
        <p className="text-xs text-alert mt-0.5 animate-fade-in">{error}</p>
      )}
    </div>
  );
}

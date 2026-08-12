import { STATUS_CONFIG, STATUS_STEPS } from '@/utils/statusConfig';

/**
 * StatusStepper — horizontal step indicator for the customer tracking page.
 * Highlights the current step and all prior steps.
 * @param {{ status: string }} props
 */
export default function StatusStepper({ status }) {
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <span className="px-4 py-2 rounded-full bg-fog/15 text-fog border border-fog/30 text-sm font-semibold font-display">
          Request cancelled
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-start gap-0">
        {STATUS_STEPS.map((stepKey, index) => {
          const cfg = STATUS_CONFIG[stepKey];
          const stepNum = cfg.step;
          const isDone = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          const isLast = index === STATUS_STEPS.length - 1;

          let circleClass =
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-display border-2 transition-all duration-300 z-10';
          if (isDone) {
            circleClass += ' bg-go border-go text-ink';
          } else if (isCurrent) {
            circleClass += ' bg-signal border-signal text-ink ring-4 ring-signal/20';
          } else {
            circleClass += ' bg-transparent border-white/15 text-fog';
          }

          return (
            <div key={stepKey} className="flex items-start flex-1 min-w-0">
              <div className="flex flex-col items-center">
                <div className={circleClass}>
                  {isDone ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{stepNum + 1}</span>
                  )}
                </div>
                <p
                  className={`mt-2 text-[10px] text-center leading-tight font-medium font-display transition-colors w-14 ${
                    isCurrent ? 'text-signal' : isDone ? 'text-go' : 'text-fog/60'
                  }`}
                >
                  {cfg.shortLabel}
                </p>
              </div>
              {!isLast && (
                <div className="flex-1 mt-4 mx-1">
                  <div
                    className={`h-0.5 transition-all duration-500 rounded-full ${
                      isDone ? 'bg-go' : isCurrent ? 'bg-signal/40' : 'bg-white/10'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

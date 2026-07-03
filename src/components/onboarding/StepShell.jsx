import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';

export default function StepShell({
  stepIndex,
  totalSteps,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  onSkip,
  nextLabel = 'Next',
  showSkip = true,
  showBack = true,
}) {
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  return (
    <div className="max-w-lg mx-auto w-full">
      {/* progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-ink-400 mb-1.5">
          <span>Step {stepIndex + 1} of {totalSteps}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
          <div
            className="h-full bg-brass-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="font-display text-2xl font-semibold text-ink-900 mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-ink-400 mb-6">{subtitle}</p>}

      <div className="space-y-4 mb-8">{children}</div>

      <div className="flex items-center justify-between gap-3">
        <div>
          {showBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2.5 rounded-lg border border-ink-200 hover:bg-ink-50"
            >
              <ArrowLeft size={15} /> Back
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2.5 rounded-lg text-ink-400 hover:text-ink-600 hover:bg-ink-50"
            >
              <SkipForward size={14} /> Skip
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg bg-ink-900 text-white hover:bg-ink-800"
          >
            {nextLabel} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

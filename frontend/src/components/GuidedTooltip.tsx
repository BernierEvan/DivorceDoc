import React, { useEffect, useRef, useCallback } from "react";
import { Info, ChevronRight } from "lucide-react";
import { useGuidedMode } from "../services/guidedMode";

interface GuidedStepProps {
  /** Step index (0-based) */
  step: number;
  /** Current active step index from page state */
  currentStep: number;
  /** Total number of steps on this page */
  totalSteps: number;
  /** Callback to advance to the next step */
  onAdvance: () => void;
  /** Tooltip explanation text */
  content: string;
  /** Step label, e.g. "Date de Mariage" */
  stepLabel?: string;
  /** Whether the user has filled in data for this step */
  isComplete?: boolean;
  children: React.ReactNode;
}

/**
 * Sequential reveal wrapper for guided mode.
 *
 * - In guided mode: only the active step is fully visible; future steps are
 *   blurred and non-interactive. A tooltip appears below the active step.
 *   When `isComplete` transitions from false to true, auto-advances after 600ms.
 *   A "Suivant" button is always available for manual advance.
 *
 * - In unguided mode (or after all steps done): renders children normally.
 */
export const GuidedStep: React.FC<GuidedStepProps> = ({
  step,
  currentStep,
  totalSteps,
  onAdvance,
  content,
  stepLabel,
  isComplete = false,
  children,
}) => {
  const { isGuided } = useGuidedMode();
  const stepRef = useRef<HTMLDivElement>(null);
  const wasCompleteRef = useRef(isComplete);

  const allDone = currentStep >= totalSteps;
  const isActive = isGuided && !allDone && currentStep === step;
  const isPast = !isGuided || allDone || currentStep > step;

  // Auto-advance when isComplete transitions false to true while active
  useEffect(() => {
    if (!isActive) {
      wasCompleteRef.current = isComplete;
      return;
    }

    if (isComplete && !wasCompleteRef.current) {
      const timer = setTimeout(onAdvance, 600);
      wasCompleteRef.current = isComplete;
      return () => clearTimeout(timer);
    }
    wasCompleteRef.current = isComplete;
  }, [isComplete, isActive, onAdvance]);

  // Scroll into view when step becomes active
  useEffect(() => {
    if (isActive && stepRef.current) {
      const timer = setTimeout(() => {
        stepRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // In unguided mode or all steps done: render normally
  if (!isGuided || allDone) {
    return <>{children}</>;
  }

  return (
    <div
      ref={stepRef}
      className={`transition-all duration-500 ease-out ${
        isActive
          ? "relative z-10"
          : isPast
            ? "" // past completed steps: normal
            : "opacity-15 blur-[4px] pointer-events-none select-none scale-[0.97]"
      }`}
    >
      {children}

      {/* Tooltip for the active step */}
      {isActive && (
        <div className="mt-3 animate-fade-in">
          <div className="bg-[var(--accent-primary)] text-white rounded-xl shadow-lg shadow-[var(--accent-primary)]/20 p-3 sm:p-4 relative">
            {/* Arrow pointing up */}
            <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[var(--accent-primary)] rotate-45" />

            <div className="relative z-10">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 opacity-90" />
                <div className="flex-1 min-w-0">
                  {stepLabel && (
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold opacity-70 block mb-1">
                      {stepLabel} — {step + 1}/{totalSteps}
                    </span>
                  )}
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {content}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-2 mt-2 sm:mt-3 pt-2 border-t border-white/20">
                <button
                  onClick={onAdvance}
                  className="flex items-center space-x-1.5 text-[11px] sm:text-xs font-medium bg-white/20 hover:bg-white/30 px-2.5 py-0.5 sm:px-3 sm:py-1.5 rounded-lg transition active:scale-95"
                >
                  <span>Suivant</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Custom hook for managing guided step state in a page.
 * Returns the current step, advance function, and total steps.
 */
export const useGuidedSteps = (totalSteps: number) => {
  const { isGuided } = useGuidedMode();
  const [currentStep, setCurrentStep] = React.useState(() =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    isGuided ? 0 : totalSteps,
  );

  const advanceStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  // When guided mode is toggled off: show all. On: restart from 0.
  useEffect(() => {
    if (!isGuided) {
      setCurrentStep(totalSteps); // all visible
    } else {
      setCurrentStep(0);
    }
  }, [isGuided, totalSteps]);

  const allDone = currentStep >= totalSteps;

  return { currentStep, totalSteps, advanceStep, allDone, isGuided };
};

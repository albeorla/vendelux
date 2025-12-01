import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  shortLabel?: string;
}

interface ProgressBarProps {
  current: number;
  total: number;
  steps?: Step[];
  className?: string;
}

export function ProgressBar({ current, total, steps, className }: ProgressBarProps) {
  const progress = Math.min(100, Math.max(0, ((current - 1) / (total - 1)) * 100));

  // If no steps provided, show simple progress bar
  if (!steps || steps.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="w-full h-2 bg-[var(--color-gray-200)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--color-primary)] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Step Indicators */}
      <div className="hidden sm:block">
        <div className="relative">
          {/* Background Line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-[var(--color-gray-200)]" />
          
          {/* Progress Line */}
          <div 
            className="absolute top-4 left-0 h-0.5 bg-[var(--color-primary)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
          
          {/* Step Dots */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = current > stepNumber;
              const isCurrent = current === stepNumber;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 z-10",
                      isCompleted 
                        ? "bg-[var(--color-primary)] text-white" 
                        : isCurrent 
                          ? "bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-primary-light)]" 
                          : "bg-[var(--color-gray-200)] text-[var(--color-gray-500)]"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span 
                    className={cn(
                      "mt-2 text-xs font-medium transition-colors duration-300 text-center max-w-[80px]",
                      isCurrent 
                        ? "text-[var(--color-primary)]" 
                        : isCompleted
                          ? "text-[var(--color-gray-600)]"
                          : "text-[var(--color-gray-400)]"
                    )}
                  >
                    {step.shortLabel || step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--color-gray-600)]">
            Step {current} of {total}
          </span>
          <span className="text-sm font-semibold text-[var(--color-primary)]">
            {steps[current - 1]?.shortLabel || steps[current - 1]?.label}
          </span>
        </div>
        <div className="w-full h-2 bg-[var(--color-gray-200)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--color-primary)] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

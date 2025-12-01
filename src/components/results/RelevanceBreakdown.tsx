import React, { useState } from 'react';
import { NormalizedEvent } from '@/types';
import { Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelevanceBreakdownProps {
  event: NormalizedEvent;
}

export function RelevanceBreakdown({ event }: RelevanceBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const score = event.relevanceScore;
  
  let scoreColor = 'bg-[var(--color-gray-400)]';
  let textColor = 'text-[var(--color-gray-600)]';
  if (score >= 80) {
    scoreColor = 'bg-[var(--color-success)]';
    textColor = 'text-[var(--color-success)]';
  } else if (score >= 60) {
    scoreColor = 'bg-[var(--color-primary)]';
    textColor = 'text-[var(--color-primary)]';
  } else if (score >= 40) {
    scoreColor = 'bg-[var(--color-accent)]';
    textColor = 'text-[var(--color-accent)]';
  }

  return (
    <div className="relative">
      <button 
        className="flex items-center cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`Relevance score: ${score}%. Click for details.`}
      >
        <div className="flex-1 h-2.5 bg-white/30 rounded-full overflow-hidden mr-2 w-20">
          <div 
            className={cn("h-full rounded-full transition-all duration-500", scoreColor)} 
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={cn("text-sm font-bold mr-1.5", textColor)}>
          {score}%
        </span>
        <Info className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Popover */}
          <div 
            className="absolute z-20 bottom-full left-0 mb-2 w-72 p-5 bg-white rounded-xl shadow-2xl border border-[var(--color-gray-100)] text-sm animate-scale-in"
            role="dialog"
            aria-label="Relevance breakdown"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold font-heading text-[var(--color-gray-900)]">Why this ranking?</h4>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[var(--color-gray-400)] hover:text-[var(--color-gray-600)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-3">
              {event.relevanceFactors.map((factor, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <span className="text-[var(--color-gray-600)]">{factor.factor}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[var(--color-gray-200)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--color-primary)] rounded-full"
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                    <span className="font-semibold text-[var(--color-gray-900)] w-10 text-right">
                      {Math.round(factor.score)}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

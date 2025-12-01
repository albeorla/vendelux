import React, { useMemo } from 'react';
import { Question, AnswerValue } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface MultiSelectQuestionProps {
  question: Question;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}

export function MultiSelectQuestion({ question, value, onChange }: MultiSelectQuestionProps) {
  const selectedValues = useMemo(
    () => (Array.isArray(value) ? value : []),
    [value]
  );

  const toggleOption = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter(v => v !== optionValue));
    } else {
      onChange([...selectedValues, optionValue]);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {question.options?.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleOption(option.value)}
            className={cn(
              "p-4 text-left border-2 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
              isSelected 
                ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-md" 
                : "border-[var(--color-gray-200)] hover:border-[var(--color-primary)] hover:border-opacity-50 bg-white"
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn(
                "font-medium block",
                isSelected ? "text-[var(--color-primary)]" : "text-[var(--color-gray-900)]"
              )}>
                {option.label}
              </span>
              <div 
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center transition-all duration-200",
                  isSelected 
                    ? "bg-[var(--color-primary)]" 
                    : "bg-[var(--color-gray-200)]"
                )}
              >
                {isSelected && (
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

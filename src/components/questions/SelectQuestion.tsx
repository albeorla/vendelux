import React from 'react';
import { Question, AnswerValue } from '@/types';
import { cn } from '@/lib/utils';

interface SelectQuestionProps {
  question: Question;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}

export function SelectQuestion({ question, value, onChange }: SelectQuestionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {question.options?.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "p-4 text-left border-2 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
              isSelected 
                ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-md" 
                : "border-[var(--color-gray-200)] hover:border-[var(--color-primary)] hover:border-opacity-50 bg-white"
            )}
          >
            <span className={cn(
              "font-medium block",
              isSelected ? "text-[var(--color-primary)]" : "text-[var(--color-gray-900)]"
            )}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

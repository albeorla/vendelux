import React from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  children: React.ReactNode;
  className?: string;
}

export function QuestionCard({ question, children, className }: QuestionCardProps) {
  return (
    <div 
      className={cn(
        "w-full max-w-lg mx-auto p-8 card-glass rounded-2xl shadow-lg transition-all duration-300 animate-scale-in",
        className
      )}
    >
      <h2 className="text-2xl md:text-3xl font-bold font-heading mb-3 text-[var(--color-gray-900)] tracking-tight">
        {question.label}
      </h2>
      {question.description && (
        <p className="text-[var(--color-gray-500)] mb-6">
          {question.description}
        </p>
      )}
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}

import React from 'react';
import { AnswerValue, DateRange } from '@/types';
import { format, addDays } from 'date-fns';
import { Calendar } from 'lucide-react';

interface DateRangeQuestionProps {
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}

const quickSelects = [
  { label: 'This Weekend', days: 3 },
  { label: 'Next Week', days: 7 },
  { label: 'Next Month', days: 30 },
  { label: 'Next 3 Months', days: 90 },
];

export function DateRangeQuestion({ value, onChange }: DateRangeQuestionProps) {
  const dateRange = (value as DateRange) || { from: undefined, to: undefined };

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    onChange({ ...dateRange, from: date });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    onChange({ ...dateRange, to: date });
  };

  const handleQuickSelect = (days: number) => {
    const from = new Date();
    const to = addDays(from, days);
    onChange({ from, to });
  };

  // Helper to format date for input value (YYYY-MM-DD)
  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return '';
    try {
      return format(date, 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Select Chips */}
      <div className="flex flex-wrap gap-2">
        {quickSelects.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => handleQuickSelect(option.days)}
            className="px-3 py-1.5 text-sm font-medium rounded-full border-2 border-[var(--color-gray-200)] bg-white text-[var(--color-gray-700)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-2">
            From
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-[var(--color-gray-400)]" />
            </div>
            <input
              type="date"
              className="block w-full pl-10 pr-3 py-3 border-2 border-[var(--color-gray-200)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-sm bg-white text-[var(--color-gray-900)] transition-all duration-200"
              value={formatDateForInput(dateRange.from)}
              onChange={handleFromChange}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-2">
            To
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-[var(--color-gray-400)]" />
            </div>
            <input
              type="date"
              className="block w-full pl-10 pr-3 py-3 border-2 border-[var(--color-gray-200)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-sm bg-white text-[var(--color-gray-900)] transition-all duration-200"
              value={formatDateForInput(dateRange.to)}
              onChange={handleToChange}
              min={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

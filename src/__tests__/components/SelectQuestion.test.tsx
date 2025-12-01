import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectQuestion } from '@/components/questions/SelectQuestion';
import { Question } from '@/types';
import '@testing-library/jest-dom';

describe('SelectQuestion', () => {
  const mockQuestion: Question = {
    id: 'radius',
    type: 'select',
    label: 'How far are you willing to travel?',
    required: true,
    options: [
      { value: '10', label: '10 miles' },
      { value: '25', label: '25 miles' },
      { value: '50', label: '50 miles' },
      { value: '100', label: '100 miles' },
    ],
    apiMapping: {
      param: 'radius',
      transform: 'direct',
    },
  };

  it('renders all options', () => {
    const onChange = jest.fn();
    render(<SelectQuestion question={mockQuestion} value={null} onChange={onChange} />);

    expect(screen.getByText('10 miles')).toBeInTheDocument();
    expect(screen.getByText('25 miles')).toBeInTheDocument();
    expect(screen.getByText('50 miles')).toBeInTheDocument();
    expect(screen.getByText('100 miles')).toBeInTheDocument();
  });

  it('calls onChange when an option is clicked', () => {
    const onChange = jest.fn();
    render(<SelectQuestion question={mockQuestion} value={null} onChange={onChange} />);

    fireEvent.click(screen.getByText('25 miles'));

    expect(onChange).toHaveBeenCalledWith('25');
  });

  it('applies selected styling to the chosen option', () => {
    const onChange = jest.fn();
    render(<SelectQuestion question={mockQuestion} value="50" onChange={onChange} />);

    const selectedButton = screen.getByText('50 miles').closest('button');
    expect(selectedButton).toHaveClass('border-[var(--color-primary)]');
  });

  it('handles question with no options gracefully', () => {
    const questionWithNoOptions: Question = {
      ...mockQuestion,
      options: undefined,
    };
    const onChange = jest.fn();

    expect(() => {
      render(<SelectQuestion question={questionWithNoOptions} value={null} onChange={onChange} />);
    }).not.toThrow();
  });
});

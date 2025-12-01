import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangeQuestion } from '@/components/questions/DateRangeQuestion';
import '@testing-library/jest-dom';

describe('DateRangeQuestion', () => {
  // Mock current date for consistent testing
  const mockDate = new Date('2024-06-15T12:00:00.000Z');
  const originalDate = global.Date;

  beforeAll(() => {
    // Mock Date constructor but preserve other functionality
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
    global.Date = originalDate;
  });

  it('renders date inputs and quick select buttons', () => {
    const onChange = jest.fn();
    render(<DateRangeQuestion value={null} onChange={onChange} />);

    // Check for quick select buttons
    expect(screen.getByText('This Weekend')).toBeInTheDocument();
    expect(screen.getByText('Next Week')).toBeInTheDocument();
    expect(screen.getByText('Next Month')).toBeInTheDocument();
    expect(screen.getByText('Next 3 Months')).toBeInTheDocument();

    // Check for From/To labels
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
  });

  it('renders date inputs', () => {
    const onChange = jest.fn();
    render(<DateRangeQuestion value={null} onChange={onChange} />);

    // Check for date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    expect(dateInputs).toHaveLength(2);
  });

  it('calls onChange with quick select for "This Weekend"', () => {
    const onChange = jest.fn();
    render(<DateRangeQuestion value={null} onChange={onChange} />);

    fireEvent.click(screen.getByText('This Weekend'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const callArg = onChange.mock.calls[0][0];
    expect(callArg).toHaveProperty('from');
    expect(callArg).toHaveProperty('to');
    expect(callArg.from).toBeInstanceOf(Date);
    expect(callArg.to).toBeInstanceOf(Date);
  });

  it('calls onChange with quick select for "Next Week"', () => {
    const onChange = jest.fn();
    render(<DateRangeQuestion value={null} onChange={onChange} />);

    fireEvent.click(screen.getByText('Next Week'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const callArg = onChange.mock.calls[0][0];
    
    // "Next Week" adds 7 days
    const expectedTo = new Date(mockDate);
    expectedTo.setDate(expectedTo.getDate() + 7);
    
    expect(callArg.from.toDateString()).toBe(mockDate.toDateString());
    expect(callArg.to.toDateString()).toBe(expectedTo.toDateString());
  });

  it('calls onChange with quick select for "Next Month"', () => {
    const onChange = jest.fn();
    render(<DateRangeQuestion value={null} onChange={onChange} />);

    fireEvent.click(screen.getByText('Next Month'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const callArg = onChange.mock.calls[0][0];
    
    // "Next Month" adds 30 days
    const expectedTo = new Date(mockDate);
    expectedTo.setDate(expectedTo.getDate() + 30);
    
    expect(callArg.to.toDateString()).toBe(expectedTo.toDateString());
  });

  it('calls onChange with quick select for "Next 3 Months"', () => {
    const onChange = jest.fn();
    render(<DateRangeQuestion value={null} onChange={onChange} />);

    fireEvent.click(screen.getByText('Next 3 Months'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const callArg = onChange.mock.calls[0][0];
    
    // "Next 3 Months" adds 90 days
    const expectedTo = new Date(mockDate);
    expectedTo.setDate(expectedTo.getDate() + 90);
    
    expect(callArg.to.toDateString()).toBe(expectedTo.toDateString());
  });

  it('handles "from" date input change', () => {
    const onChange = jest.fn();
    render(<DateRangeQuestion value={null} onChange={onChange} />);

    const dateInputs = document.querySelectorAll('input[type="date"]');
    const fromInput = dateInputs[0] as HTMLInputElement;

    fireEvent.change(fromInput, { target: { value: '2024-07-01' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const callArg = onChange.mock.calls[0][0];
    expect(callArg.from).toBeInstanceOf(Date);
    expect(callArg.from.toISOString().startsWith('2024-07-01')).toBe(true);
  });

  it('handles "to" date input change', () => {
    const onChange = jest.fn();
    // Use date with explicit time to avoid timezone issues
    const initialValue = { from: new Date('2024-06-20T12:00:00'), to: undefined };
    render(<DateRangeQuestion value={initialValue} onChange={onChange} />);

    const dateInputs = document.querySelectorAll('input[type="date"]');
    const toInput = dateInputs[1] as HTMLInputElement;

    fireEvent.change(toInput, { target: { value: '2024-08-15' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const callArg = onChange.mock.calls[0][0];
    expect(callArg.to).toBeInstanceOf(Date);
    expect(callArg.from.toISOString().startsWith('2024-06-20')).toBe(true);
  });

  it('displays existing date values in inputs', () => {
    const onChange = jest.fn();
    // Use dates with explicit time to avoid timezone issues
    const existingValue = {
      from: new Date('2024-07-10T12:00:00'),
      to: new Date('2024-07-20T12:00:00'),
    };
    render(<DateRangeQuestion value={existingValue} onChange={onChange} />);

    const dateInputs = document.querySelectorAll('input[type="date"]');
    const fromInput = dateInputs[0] as HTMLInputElement;
    const toInput = dateInputs[1] as HTMLInputElement;

    expect(fromInput.value).toBe('2024-07-10');
    expect(toInput.value).toBe('2024-07-20');
  });

  it('handles clearing from date', () => {
    const onChange = jest.fn();
    // Use dates with explicit time to avoid timezone issues
    const existingValue = {
      from: new Date('2024-07-10T12:00:00'),
      to: new Date('2024-07-20T12:00:00'),
    };
    render(<DateRangeQuestion value={existingValue} onChange={onChange} />);

    const dateInputs = document.querySelectorAll('input[type="date"]');
    const fromInput = dateInputs[0] as HTMLInputElement;

    fireEvent.change(fromInput, { target: { value: '' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const callArg = onChange.mock.calls[0][0];
    expect(callArg.from).toBeUndefined();
    expect(callArg.to).toBeInstanceOf(Date);
  });

  it('handles null/undefined value gracefully', () => {
    const onChange = jest.fn();
    
    // Should not throw
    expect(() => {
      render(<DateRangeQuestion value={null} onChange={onChange} />);
    }).not.toThrow();

    const dateInputs = document.querySelectorAll('input[type="date"]');
    const fromInput = dateInputs[0] as HTMLInputElement;
    const toInput = dateInputs[1] as HTMLInputElement;

    expect(fromInput.value).toBe('');
    expect(toInput.value).toBe('');
  });

  it('sets minimum date for "from" input to today', () => {
    const onChange = jest.fn();
    render(<DateRangeQuestion value={null} onChange={onChange} />);

    const dateInputs = document.querySelectorAll('input[type="date"]');
    const fromInput = dateInputs[0] as HTMLInputElement;

    expect(fromInput.getAttribute('min')).toBe('2024-06-15');
  });

  it('sets minimum date for "to" input based on "from" value', () => {
    const onChange = jest.fn();
    // Use date with explicit time to avoid timezone issues
    const existingValue = {
      from: new Date('2024-07-01T12:00:00'),
      to: undefined,
    };
    render(<DateRangeQuestion value={existingValue} onChange={onChange} />);

    const dateInputs = document.querySelectorAll('input[type="date"]');
    const toInput = dateInputs[1] as HTMLInputElement;

    expect(toInput.getAttribute('min')).toBe('2024-07-01');
  });
});


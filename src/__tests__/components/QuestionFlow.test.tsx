import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuestionFlow } from '@/components/questions/QuestionFlow';
import '@testing-library/jest-dom';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock useLocalStorage to behave like useState for tests
jest.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: (key: string, initialValue: unknown) => {
    const [val, setVal] = React.useState(initialValue);
    return [val, setVal];
  },
}));

describe('QuestionFlow', () => {
  it('renders the first question', () => {
    render(<QuestionFlow />);
    expect(screen.getByText(/What type of events/i)).toBeInTheDocument();
  });

  it('shows progress bar', () => {
    render(<QuestionFlow />);
    expect(screen.getByText(/Step 1 of/i)).toBeInTheDocument();
  });

  it('disables Next button when no answer is selected', () => {
    render(<QuestionFlow />);
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('enables Next button when answer is selected', async () => {
    render(<QuestionFlow />);

    // Find an option and click it
    const option = screen.getByText(/Music/i);
    fireEvent.click(option);

    // Next button should now be enabled
    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('navigates to next question when answer is provided', async () => {
    render(<QuestionFlow />);

    // Find an option and click it
    const option = screen.getByText(/Music/i);
    fireEvent.click(option);

    // Click Next
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Wait for the transition and check for next question
    await waitFor(() => {
      expect(screen.getByText(/Where do you want to go/i)).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('allows going back to previous question', async () => {
    render(<QuestionFlow />);

    // Answer first question and go to next
    const option = screen.getByText(/Music/i);
    fireEvent.click(option);

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Wait for second question
    await waitFor(() => {
      expect(screen.getByText(/Where do you want to go/i)).toBeInTheDocument();
    }, { timeout: 500 });

    // Click Back
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    // Wait for first question to appear again
    await waitFor(() => {
      expect(screen.getByText(/What type of events/i)).toBeInTheDocument();
    }, { timeout: 500 });
  });
});

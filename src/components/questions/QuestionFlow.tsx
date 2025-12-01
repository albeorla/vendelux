"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import questionsConfig from '@/config/questions.json';
import { Question, AnswerValue } from '@/types';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ProgressBar';
import { SelectQuestion } from './SelectQuestion';
import { MultiSelectQuestion } from './MultiSelectQuestion';
import { LocationQuestion } from './LocationQuestion';
import { DateRangeQuestion } from './DateRangeQuestion';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, SkipForward, Search } from 'lucide-react';

import { useLocalStorage } from '@/hooks/useLocalStorage';

// Cast the config to the correct type since JSON import might be loose
const questions = questionsConfig as unknown as Question[];

const STORAGE_KEYS = {
  ANSWERS: 'event-discovery-answers',
  STEP: 'event-discovery-step',
};

// Map question IDs to short labels for progress bar
const stepLabels: Record<string, { label: string; shortLabel: string }> = {
  category: { label: 'Event Type', shortLabel: 'Type' },
  location: { label: 'Location', shortLabel: 'Where' },
  radius: { label: 'Distance', shortLabel: 'Distance' },
  dateRange: { label: 'When', shortLabel: 'When' },
  price: { label: 'Budget', shortLabel: 'Budget' },
};

export function QuestionFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useLocalStorage(STORAGE_KEYS.STEP, 0);
  const [answers, setAnswers] = useLocalStorage<Record<string, AnswerValue>>(STORAGE_KEYS.ANSWERS, {});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const currentAnswer = answers[currentQuestion?.id];

  // Build steps array for progress bar
  const steps = useMemo(() => 
    questions.map(q => ({
      id: q.id,
      label: stepLabels[q.id]?.label || q.label,
      shortLabel: stepLabels[q.id]?.shortLabel || q.label.split(' ')[0],
    })),
    []
  );

  const handleAnswerChange = (value: AnswerValue) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    if (currentAnswer === undefined || currentAnswer === null) return false;
    if (Array.isArray(currentAnswer) && currentAnswer.length === 0) return false;
    if (typeof currentAnswer === 'string' && currentAnswer.trim() === '') return false;
    // Check location has address
    if (currentQuestion.type === 'location' && typeof currentAnswer === 'object' && 'address' in currentAnswer) {
      return (currentAnswer as { address: string }).address.trim() !== '';
    }
    return true;
  };

  const transitionToStep = (nextStep: number | 'results') => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (nextStep === 'results') {
        router.push('/results');
      } else {
        setCurrentStep(nextStep);
      }
      setIsTransitioning(false);
    }, 150);
  };

  const handleNext = () => {
    if (isLastStep) {
      transitionToStep('results');
    } else {
      transitionToStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    if (!currentQuestion.required && !isLastStep) {
      // Clear any existing answer for skipped question
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[currentQuestion.id];
        return newAnswers;
      });
      transitionToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      transitionToStep(currentStep - 1);
    }
  };

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'select':
        return <SelectQuestion question={currentQuestion} value={currentAnswer} onChange={handleAnswerChange} />;
      case 'multi-select':
        return <MultiSelectQuestion question={currentQuestion} value={currentAnswer} onChange={handleAnswerChange} />;
      case 'location':
        return <LocationQuestion value={currentAnswer} onChange={handleAnswerChange} />;
      case 'date-range':
        return <DateRangeQuestion value={currentAnswer} onChange={handleAnswerChange} />;
      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-10">
        <ProgressBar 
          current={currentStep + 1} 
          total={questions.length} 
          steps={steps}
        />
      </div>

      {/* Question Card with transition */}
      <div 
        className={`transition-all duration-150 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
      >
        <QuestionCard question={currentQuestion} className="mb-8">
          {renderQuestionInput()}
        </QuestionCard>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-[var(--color-gray-200)] sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:p-0 flex justify-between items-center z-10">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          disabled={currentStep === 0}
          className={currentStep === 0 ? "invisible" : ""}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-3">
          {/* Skip Button for Optional Questions */}
          {!currentQuestion.required && !isLastStep && (
            <Button 
              variant="ghost"
              onClick={handleSkip}
              className="text-[var(--color-gray-500)] hover:text-[var(--color-gray-700)]"
            >
              Skip
              <SkipForward className="w-4 h-4 ml-1.5" />
            </Button>
          )}
          
          <Button 
            onClick={handleNext} 
            disabled={!canProceed()}
            size="lg"
          >
            {isLastStep ? (
              <>
                <Search className="w-4 h-4 mr-2" />
                Find Events
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Spacer to prevent content from being hidden behind sticky footer on mobile */}
      <div className="h-24 sm:hidden" />
    </div>
  );
}

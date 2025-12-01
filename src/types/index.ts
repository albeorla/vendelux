export type QuestionType = 'select' | 'multi-select' | 'text' | 'date-range' | 'location';

export interface QuestionOption {
  value: string;
  label: string;
  apiParam?: string;
}

export interface ApiMapping {
  param: string;
  transform?: 'direct' | 'date-format' | 'geo-hash' | 'join-comma';
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
  apiMapping: ApiMapping;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface LocationValue {
  lat: number;
  lng: number;
  address: string;
}

export type AnswerValue = string | string[] | DateRange | LocationValue | null;

export interface Answer {
  questionId: string;
  value: AnswerValue;
}

export interface RelevanceFactor {
  factor: string;
  score: number;
  explanation: string;
}

export interface NormalizedEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: {
    name: string;
    city: string;
    state: string;
    address: string;
  };
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  images: {
    thumbnail: string;
    large: string;
  };
  url: string;
  category: string;
  relevanceScore: number;
  relevanceFactors: RelevanceFactor[];
}

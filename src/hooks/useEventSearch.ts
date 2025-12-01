import { useState, useEffect } from 'react';
import { NormalizedEvent, AnswerValue, Question } from '@/types';
import questionsConfig from '@/config/questions.json';

const questions = questionsConfig as Question[];

export function useEventSearch(answers: Record<string, AnswerValue>) {
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();

        // Map answers to API params
        Object.entries(answers).forEach(([questionId, value]) => {
          const question = questions.find(q => q.id === questionId);
          if (!question || !value) return;

          const mapping = question.apiMapping;
          let paramValue = '';

          if (mapping.transform === 'join-comma' && Array.isArray(value)) {
            paramValue = value.join(',');
          } else if (mapping.transform === 'geo-hash' && typeof value === 'object') {
            // TODO: Implement actual geohash conversion
            // For now, we rely on keyword or skip if not implemented
            // searchParams.append('geoPoint', ...);
          } else if (mapping.transform === 'date-format' && typeof value === 'object') {
            // Handle date range - dates may be Date objects or ISO strings (from localStorage)
            const range = value as { from?: Date | string; to?: Date | string };
            if (range.from) {
              const fromDate = range.from instanceof Date ? range.from : new Date(range.from);
              searchParams.append('startDateTime', fromDate.toISOString().split('.')[0] + 'Z');
            }
            if (range.to) {
              const toDate = range.to instanceof Date ? range.to : new Date(range.to);
              searchParams.append('endDateTime', toDate.toISOString().split('.')[0] + 'Z');
            }
            return; // Already appended
          } else {
            paramValue = String(value);
          }

          if (paramValue) {
            searchParams.append(mapping.param, paramValue);
          }
        });

        // Pass all answers for server-side relevance calculation
        searchParams.append('preferences', JSON.stringify(answers));

        const response = await fetch(`/api/events?${searchParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        setEvents(data.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have answers (or at least some)
    if (Object.keys(answers).length > 0) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [answers]);

  return { events, loading, error };
}

import { calculateRelevance } from '@/lib/relevance';
import { NormalizedEvent } from '@/types';

describe('calculateRelevance', () => {
  const mockEvent: NormalizedEvent = {
    id: '1',
    name: 'Test Event',
    date: '2024-12-01',
    time: '20:00:00',
    venue: { name: 'Venue', city: 'City', state: 'ST', address: '123 St' },
    priceRange: { min: 50, max: 100, currency: 'USD' },
    images: { thumbnail: '', large: '' },
    url: '',
    category: 'Music',
    relevanceScore: 0,
    relevanceFactors: []
  };

  it('should give high score for matching category', () => {
    const answers = { category: ['Music'] };
    const { score, factors } = calculateRelevance(mockEvent, answers);
    
    expect(score).toBeGreaterThan(50);
    expect(factors).toEqual(expect.arrayContaining([
      expect.objectContaining({ factor: 'Category Match' })
    ]));
  });

  it('should give lower score for non-matching category', () => {
    const answers = { category: ['Sports'] };
    const { score } = calculateRelevance(mockEvent, answers);
    
    // Should be lower than matching category score
    const matchingScore = calculateRelevance(mockEvent, { category: ['Music'] }).score;
    expect(score).toBeLessThan(matchingScore);
  });

  it('should give higher score for cheaper events if price is low', () => {
    const cheapEvent = { ...mockEvent, priceRange: { min: 10, max: 20, currency: 'USD' } };
    const expensiveEvent = { ...mockEvent, priceRange: { min: 200, max: 300, currency: 'USD' } };
    
    const cheapScore = calculateRelevance(cheapEvent, {}).score;
    const expensiveScore = calculateRelevance(expensiveEvent, {}).score;
    
    expect(cheapScore).toBeGreaterThan(expensiveScore);
  });
});

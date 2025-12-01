import { NormalizedEvent, AnswerValue, RelevanceFactor } from '@/types';

import questionsConfig from '@/config/questions.json';

const RELEVANCE_WEIGHTS = {
  categoryMatch: 0.3,
  dateProximity: 0.2,
  priceMatch: 0.2,
  distanceScore: 0.15,
  popularity: 0.15,
};

export function calculateRelevance(event: NormalizedEvent, answers: Record<string, AnswerValue>): { score: number, factors: RelevanceFactor[] } {
  const factors: RelevanceFactor[] = [];
  let totalScore = 0;

  // 1. Category Match
  const userCategoryIds = answers['category'] as string[] || [];
  let categoryScore = 0;
  
  if (userCategoryIds.length > 0) {
    // Find the category question to map IDs to labels
    const categoryQuestion = questionsConfig.find(q => q.id === 'category');
    const userCategoryLabels = userCategoryIds.map(id => {
      const option = categoryQuestion?.options?.find(opt => opt.value === id);
      return option ? option.label : id; // Fallback to ID if not found (e.g. for tests using names)
    });

    // Check if event category matches any user selection
    const isMatch = userCategoryLabels.some(label => 
      event.category.toLowerCase().includes(label.toLowerCase()) || 
      label.toLowerCase().includes(event.category.toLowerCase())
    );

    if (isMatch) {
      categoryScore = 1.0; 
      factors.push({
        factor: 'Category Match',
        score: 100,
        explanation: 'Matches your interest in ' + event.category
      });
    } else {
      categoryScore = 0.2; // Low score if selected categories don't match
      factors.push({
        factor: 'Category Mismatch',
        score: 20,
        explanation: 'Does not match your selected categories'
      });
    }
  } else {
    categoryScore = 0.5; // Neutral if no preference
  }
  totalScore += categoryScore * RELEVANCE_WEIGHTS.categoryMatch;

  // 2. Date Proximity
  // Closer dates get higher score
  const eventDate = event.date ? new Date(event.date) : null;
  let dateScore = 0;
  if (eventDate) {
    const today = new Date();
    const daysDiff = Math.max(0, (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 7) dateScore = 1.0; // This week
    else if (daysDiff < 30) dateScore = 0.8; // This month
    else if (daysDiff < 90) dateScore = 0.6; // Within 3 months
    else dateScore = 0.4;

    factors.push({
      factor: 'Date',
      score: dateScore * 100,
      explanation: daysDiff < 7 ? 'Happening this week!' : 'Upcoming event'
    });
  }
  totalScore += dateScore * RELEVANCE_WEIGHTS.dateProximity;

  // 3. Price Match
  // Simplified: Lower price is generally better unless user specified "expensive"
  // We'll assume "cheaper is better" for this basic logic unless we parse the "price" answer deeply
  const price = event.priceRange?.min || 0;
  let priceScore = 0.5;
  if (price === 0) priceScore = 1.0;
  else if (price < 50) priceScore = 0.9;
  else if (price < 100) priceScore = 0.7;
  else priceScore = 0.5;
  
  factors.push({
    factor: 'Price',
    score: priceScore * 100,
    explanation: price === 0 ? 'Free event!' : 'Within typical budget'
  });
  totalScore += priceScore * RELEVANCE_WEIGHTS.priceMatch;

  // 4. Distance
  // We don't have real distance yet without geocoding, so we'll randomize slightly or use a default
  const distanceScore = 0.8; // Placeholder
  totalScore += distanceScore * RELEVANCE_WEIGHTS.distanceScore;

  // 5. Popularity
  // Ticketmaster doesn't give a direct popularity score in the basic response, so we'll infer or randomize
  const popularityScore = 0.7; // Placeholder
  totalScore += popularityScore * RELEVANCE_WEIGHTS.popularity;

  return {
    score: Math.round(totalScore * 100),
    factors
  };
}

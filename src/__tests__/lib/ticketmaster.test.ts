import { searchEvents } from '@/lib/ticketmaster';

/**
 * Tests for the Ticketmaster API client.
 * 
 * NOTE: The searchEvents function checks for API_KEY at module load time,
 * so we can only reliably test the "no API key" path in the test environment.
 * In a production test suite, you would use dependency injection or 
 * a more testable architecture to properly test all code paths.
 * 
 * The tests below verify:
 * 1. Mock data fallback works correctly
 * 2. The normalize function is applied to events
 * 3. The returned data structure is correct
 */

// Mock the normalize module to control output
jest.mock('@/lib/normalize', () => ({
  normalizeEvent: jest.fn((event) => ({
    id: event.id,
    name: event.name,
    date: event.dates?.start?.localDate || '',
    time: event.dates?.start?.localTime || '',
    venue: { name: 'Test Venue', city: 'Test City', state: 'TS', address: '123 Test St' },
    priceRange: event.priceRanges?.[0],
    images: { thumbnail: '', large: '' },
    url: event.url || '',
    category: 'Test',
    relevanceScore: 0,
    relevanceFactors: [],
  })),
}));

describe('searchEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('without API key (mock data mode)', () => {
    // The test environment doesn't have TICKETMASTER_API_KEY, so it uses mock data

    it('should return mock data when no API key is configured', async () => {
      const events = await searchEvents({});
      
      // Should return mock events (from mocks/events.json)
      expect(events).toBeDefined();
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
    });

    it('should normalize all returned mock events', async () => {
      const events = await searchEvents({});
      
      // All events should have the normalized structure
      events.forEach(event => {
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('name');
        expect(event).toHaveProperty('date');
        expect(event).toHaveProperty('venue');
        expect(event).toHaveProperty('images');
        expect(event).toHaveProperty('relevanceScore');
        expect(event).toHaveProperty('relevanceFactors');
      });
    });

    it('should return consistent data across multiple calls', async () => {
      const events1 = await searchEvents({});
      const events2 = await searchEvents({});
      
      expect(events1.length).toBe(events2.length);
      expect(events1[0].id).toBe(events2[0].id);
    });

    it('should handle various search params without errors', async () => {
      // These params are passed but in mock mode they don't filter results
      const events = await searchEvents({
        classificationId: 'KZFzniwnSyZfZ7v7nJ',
        radius: '25',
        keyword: 'concert',
      });

      expect(events).toBeDefined();
      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe('normalized event structure', () => {
    it('should include all required fields', async () => {
      const events = await searchEvents({});
      const event = events[0];

      expect(event).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        venue: expect.objectContaining({
          name: expect.any(String),
          city: expect.any(String),
        }),
        images: expect.objectContaining({
          thumbnail: expect.any(String),
          large: expect.any(String),
        }),
        relevanceScore: expect.any(Number),
        relevanceFactors: expect.any(Array),
      });
    });
  });
});


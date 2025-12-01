import { normalizeEvent } from '@/lib/normalize';

describe('normalizeEvent', () => {
  it('should normalize a complete Ticketmaster event', () => {
    const ticketmasterEvent = {
      id: 'evt123',
      name: 'Test Concert',
      url: 'https://ticketmaster.com/event/evt123',
      dates: {
        start: {
          localDate: '2024-12-25',
          localTime: '20:00:00',
        },
      },
      images: [
        { url: 'https://example.com/small.jpg', width: 100, height: 100 },
        { url: 'https://example.com/large.jpg', width: 1000, height: 1000 },
        { url: 'https://example.com/medium.jpg', width: 500, height: 500 },
      ],
      priceRanges: [{ min: 50, max: 150, currency: 'USD' }],
      classifications: [{ segment: { name: 'Music' } }],
      _embedded: {
        venues: [{
          name: 'Madison Square Garden',
          city: { name: 'New York' },
          state: { name: 'NY' },
          address: { line1: '4 Pennsylvania Plaza' },
        }],
      },
    };

    const normalized = normalizeEvent(ticketmasterEvent);

    expect(normalized).toEqual({
      id: 'evt123',
      name: 'Test Concert',
      date: '2024-12-25',
      time: '20:00:00',
      venue: {
        name: 'Madison Square Garden',
        city: 'New York',
        state: 'NY',
        address: '4 Pennsylvania Plaza',
      },
      priceRange: {
        min: 50,
        max: 150,
        currency: 'USD',
      },
      images: {
        thumbnail: 'https://example.com/small.jpg',
        large: 'https://example.com/large.jpg',
      },
      url: 'https://ticketmaster.com/event/evt123',
      category: 'Music',
      relevanceScore: 0,
      relevanceFactors: [],
    });
  });

  it('should handle missing venue data gracefully', () => {
    const eventWithNoVenue = {
      id: 'evt456',
      name: 'Mystery Event',
      url: 'https://example.com',
      _embedded: {},
    };

    const normalized = normalizeEvent(eventWithNoVenue);

    expect(normalized.venue).toEqual({
      name: 'Unknown Venue',
      city: 'Unknown City',
      state: '',
      address: '',
    });
  });

  it('should handle missing dates', () => {
    const eventWithNoDates = {
      id: 'evt789',
      name: 'TBA Event',
      url: 'https://example.com',
    };

    const normalized = normalizeEvent(eventWithNoDates);

    expect(normalized.date).toBe('');
    expect(normalized.time).toBe('');
  });

  it('should handle missing price range', () => {
    const eventWithNoPrice = {
      id: 'evt000',
      name: 'Free Event',
      url: 'https://example.com',
    };

    const normalized = normalizeEvent(eventWithNoPrice);

    expect(normalized.priceRange).toBeUndefined();
  });

  it('should handle missing images', () => {
    const eventWithNoImages = {
      id: 'evt111',
      name: 'Imageless Event',
      url: 'https://example.com',
    };

    const normalized = normalizeEvent(eventWithNoImages);

    expect(normalized.images).toEqual({
      thumbnail: '',
      large: '',
    });
  });

  it('should handle missing classification/category', () => {
    const eventWithNoCategory = {
      id: 'evt222',
      name: 'Unclassified Event',
      url: 'https://example.com',
    };

    const normalized = normalizeEvent(eventWithNoCategory);

    expect(normalized.category).toBe('Miscellaneous');
  });

  it('should select largest image for large and smallest for thumbnail', () => {
    const eventWithMultipleImages = {
      id: 'evt333',
      name: 'Image Event',
      url: 'https://example.com',
      images: [
        { url: 'https://example.com/100.jpg', width: 100, height: 100 },
        { url: 'https://example.com/50.jpg', width: 50, height: 50 },
        { url: 'https://example.com/500.jpg', width: 500, height: 500 },
      ],
    };

    const normalized = normalizeEvent(eventWithMultipleImages);

    expect(normalized.images.large).toBe('https://example.com/500.jpg');
    expect(normalized.images.thumbnail).toBe('https://example.com/50.jpg');
  });

  it('should handle partial venue data', () => {
    const eventWithPartialVenue = {
      id: 'evt444',
      name: 'Partial Venue Event',
      url: 'https://example.com',
      _embedded: {
        venues: [{
          name: 'Some Arena',
          // Missing city, state, address
        }],
      },
    };

    const normalized = normalizeEvent(eventWithPartialVenue);

    expect(normalized.venue).toEqual({
      name: 'Some Arena',
      city: 'Unknown City',
      state: '',
      address: '',
    });
  });
});


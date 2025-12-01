import { NormalizedEvent } from '@/types';

interface TicketmasterImage {
  url: string;
  width: number;
  height: number;
}

interface TicketmasterVenue {
  name?: string;
  city?: { name?: string };
  state?: { name?: string };
  address?: { line1?: string };
}

interface TicketmasterPriceRange {
  min: number;
  max: number;
  currency: string;
}

interface TicketmasterClassification {
  segment?: { name?: string };
}

interface TicketmasterEvent {
  id: string;
  name: string;
  url: string;
  dates?: {
    start?: {
      localDate?: string;
      localTime?: string;
    };
  };
  images?: TicketmasterImage[];
  priceRanges?: TicketmasterPriceRange[];
  classifications?: TicketmasterClassification[];
  _embedded?: {
    venues?: TicketmasterVenue[];
  };
}

export function normalizeEvent(event: TicketmasterEvent): NormalizedEvent {
  const venue = event._embedded?.venues?.[0];
  const image = event.images?.reduce((prev, current) => {
    return (prev.width > current.width) ? prev : current;
  }) || { url: '', width: 0, height: 0 };

  const thumbnail = event.images?.reduce((prev, current) => {
    return (prev.width < current.width) ? prev : current;
  }) || { url: '', width: 0, height: 0 };

  return {
    id: event.id,
    name: event.name,
    date: event.dates?.start?.localDate || '',
    time: event.dates?.start?.localTime || '',
    venue: {
      name: venue?.name || 'Unknown Venue',
      city: venue?.city?.name || 'Unknown City',
      state: venue?.state?.name || '',
      address: venue?.address?.line1 || '',
    },
    priceRange: event.priceRanges?.[0] ? {
      min: event.priceRanges[0].min,
      max: event.priceRanges[0].max,
      currency: event.priceRanges[0].currency
    } : undefined,
    images: {
      thumbnail: thumbnail.url,
      large: image.url
    },
    url: event.url,
    category: event.classifications?.[0]?.segment?.name || 'Miscellaneous',
    relevanceScore: 0, // Calculated later
    relevanceFactors: []
  };
}

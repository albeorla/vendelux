import { normalizeEvent } from './normalize';
import { NormalizedEvent } from '@/types';
import mockEvents from '@/mocks/events.json';

const API_KEY = process.env.TICKETMASTER_API_KEY;
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

interface SearchParams {
  classificationId?: string;
  geoPoint?: string;
  radius?: string;
  unit?: string;
  startDateTime?: string;
  endDateTime?: string;
  keyword?: string;
  price?: string; // Custom param, not direct TM param
}

export async function searchEvents(params: SearchParams): Promise<NormalizedEvent[]> {
  // If no API key, return mock data
  if (!API_KEY) {
    console.log('No API key found, returning mock data');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockEvents.map(normalizeEvent);
  }

  const queryParams = new URLSearchParams({
    apikey: API_KEY,
    size: '50',
    sort: 'date,asc',
    unit: 'miles'
  });

  if (params.classificationId) queryParams.append('classificationId', params.classificationId);
  if (params.geoPoint) queryParams.append('geoPoint', params.geoPoint);
  if (params.radius) queryParams.append('radius', params.radius);
  if (params.startDateTime) queryParams.append('startDateTime', params.startDateTime);
  if (params.endDateTime) queryParams.append('endDateTime', params.endDateTime);
  if (params.keyword) queryParams.append('keyword', params.keyword);

  try {
    const response = await fetch(`${BASE_URL}?${queryParams.toString()}`);
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      throw new Error(`Ticketmaster API error: ${response.statusText}`);
    }

    const data = await response.json();
    const events = data._embedded?.events || [];
    
    return events.map(normalizeEvent);
  } catch (error) {
    console.error('Error fetching events:', error);
    // Fallback to mock data on error for robustness in this demo
    return mockEvents.map(normalizeEvent);
  }
}

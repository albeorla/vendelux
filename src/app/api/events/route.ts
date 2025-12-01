import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { searchEvents } from '@/lib/ticketmaster';
import { calculateRelevance } from '@/lib/relevance';
import { AnswerValue } from '@/types';

// Input validation schema
const SearchParamsSchema = z.object({
  classificationId: z.string().max(200).optional(),
  geoPoint: z.string()
    .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, 'Invalid geoPoint format')
    .optional(),
  radius: z.string()
    .regex(/^\d+$/, 'Radius must be numeric')
    .optional(),
  startDateTime: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'Invalid date format')
    .optional(),
  endDateTime: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'Invalid date format')
    .optional(),
  keyword: z.string().max(100).optional(),
  preferences: z.string().max(5000).optional(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Extract and validate parameters
  const rawParams = {
    classificationId: searchParams.get('classificationId') || undefined,
    geoPoint: searchParams.get('geoPoint') || undefined,
    radius: searchParams.get('radius') || undefined,
    startDateTime: searchParams.get('startDateTime') || undefined,
    endDateTime: searchParams.get('endDateTime') || undefined,
    keyword: searchParams.get('keyword') || undefined,
    preferences: searchParams.get('preferences') || undefined,
  };

  // Validate input
  const validationResult = SearchParamsSchema.safeParse(rawParams);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: 'Invalid parameters',
        details: validationResult.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const validatedParams = validationResult.data;

  // Parse preferences safely
  let preferences: Record<string, AnswerValue> = {};
  if (validatedParams.preferences) {
    try {
      preferences = JSON.parse(validatedParams.preferences);
    } catch {
      return NextResponse.json(
        { error: 'Invalid preferences JSON' },
        { status: 400 }
      );
    }
  }

  const apiParams = {
    classificationId: validatedParams.classificationId,
    geoPoint: validatedParams.geoPoint,
    radius: validatedParams.radius,
    startDateTime: validatedParams.startDateTime,
    endDateTime: validatedParams.endDateTime,
    keyword: validatedParams.keyword,
  };

  try {
    const rawEvents = await searchEvents(apiParams);

    // Calculate relevance for each event
    const events = rawEvents.map(event => {
      const { score, factors } = calculateRelevance(event, preferences);
      return {
        ...event,
        relevanceScore: score,
        relevanceFactors: factors
      };
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

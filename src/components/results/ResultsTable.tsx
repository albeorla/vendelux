import React, { memo, useMemo } from 'react';
import Image from 'next/image';
import { NormalizedEvent } from '@/types';
import { format } from 'date-fns';
import { ExternalLink, Star } from 'lucide-react';

import { RelevanceBreakdown } from './RelevanceBreakdown';

interface ResultsTableProps {
  events: NormalizedEvent[];
}

interface EventRowProps {
  event: NormalizedEvent;
  index: number;
}

const EventRow = memo(function EventRow({ event, index }: EventRowProps) {
  const formattedDate = useMemo(
    () => event.date ? format(new Date(event.date), 'MMM d, yyyy') : 'TBA',
    [event.date]
  );

  const formattedTime = useMemo(
    () => event.time ? format(new Date(`2000-01-01T${event.time}`), 'h:mm a') : '',
    [event.time]
  );

  const isHighRelevance = useMemo(
    () => (event.relevanceScore || 0) >= 80,
    [event.relevanceScore]
  );

  return (
    <tr className="hover:bg-[var(--color-gray-50)] transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12 relative">
            <Image
              className="rounded-lg object-cover"
              src={event.images.thumbnail}
              alt=""
              width={48}
              height={48}
              loading={index < 10 ? "eager" : "lazy"}
              priority={index < 5}
            />
            {isHighRelevance && (
              <div className="absolute -top-1 -right-1 bg-[var(--color-accent)] rounded-full p-0.5">
                <Star className="w-3 h-3 text-[var(--color-gray-900)] fill-current" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-[var(--color-gray-900)] max-w-xs truncate" title={event.name}>
              {event.name}
            </div>
            <div className="text-sm text-[var(--color-gray-500)]">
              {event.category}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-[var(--color-gray-900)]">
          {formattedDate}
        </div>
        <div className="text-sm text-[var(--color-gray-500)]">
          {formattedTime}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-[var(--color-gray-900)]">{event.venue.name}</div>
        <div className="text-sm text-[var(--color-gray-500)]">{event.venue.city}, {event.venue.state}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-gray-600)]">
        {event.priceRange
          ? `${event.priceRange.min} - ${event.priceRange.max} ${event.priceRange.currency}`
          : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <RelevanceBreakdown event={event} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded"
        >
          Tickets
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </td>
    </tr>
  );
});

export const ResultsTable = memo(function ResultsTable({ events }: ResultsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--color-gray-200)]">
        <thead className="bg-[var(--color-gray-50)]">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-gray-500)] uppercase tracking-wider">
              Event
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-gray-500)] uppercase tracking-wider">
              Date & Time
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-gray-500)] uppercase tracking-wider">
              Venue
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-gray-500)] uppercase tracking-wider">
              Price
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-gray-500)] uppercase tracking-wider">
              Relevance
            </th>
            <th scope="col" className="relative px-6 py-4">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[var(--color-gray-100)]">
          {events.map((event, index) => (
            <EventRow key={event.id} event={event} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
});
